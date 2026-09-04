import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { GoogleTokenVerifier } from './google-token.verifier';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly google: GoogleTokenVerifier,
  ) {}

  private safeUser(user: any) { const { passwordHash, ...safe } = user; return safe; }
  private token(user: any) { return this.jwt.sign({ sub: user.id, email: user.email, role: user.role }); }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email is already registered');

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase(),
        passwordHash: await bcrypt.hash(dto.password, 10),
      },
    });
    return { user: this.safeUser(user), accessToken: this.token(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !user.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== 'CUSTOMER') {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { user: this.safeUser(user), accessToken: this.token(user) };
  }

  async me(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    return this.safeUser(user);
  }

  /**
   * Storefront sign-in with Google. The token is verified against our own client id
   * first (see GoogleTokenVerifier) - this method only ever sees a proven identity.
   */
  async validateGoogleToken(googleToken: string) {
    const { googleId, email, firstName, lastName } = await this.google.verify(googleToken);

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { email, firstName, lastName, googleId, role: 'CUSTOMER' },
      });
    } else if (!user.googleId) {
      // Matched an existing password account by email: record the link so future
      // sign-ins resolve by googleId instead of relying on the email match alone.
      user = await this.prisma.user.update({ where: { id: user.id }, data: { googleId } });
    }

    // Mirrors login(): the storefront endpoint must never hand out an ADMIN token.
    if (user.role !== 'CUSTOMER') {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { user: this.safeUser(user), accessToken: this.token(user) };
  }
}