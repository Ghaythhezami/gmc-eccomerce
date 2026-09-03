import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService) {}
  private safeUser(user: any) { const { passwordHash, ...safe } = user; return safe; }
  private token(user: any) { return this.jwt.sign({ sub: user.id, email: user.email, role: user.role }); }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email is already registered');
    // const user = await this.prisma.user.create({ data: { ...dto, email: dto.email.toLowerCase(), passwordHash: await bcrypt.hash(dto.password, 10) } });
    const user = await this.prisma.user.create({
    data: {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 10), // Hash it, don't spread password
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
    throw new UnauthorizedException('Invalid credentials'); // Same message, no clue!
    }

    return { user: this.safeUser(user), accessToken: this.token(user) };
  }
  async me(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    return this.safeUser(user);
  }

  // NEW: Validate Google token and create/find user
  async validateGoogleToken(googleToken: string) {
    try {
      // 1. Decode the Google token to get user info
      const payload: any = this.jwt.decode(googleToken);

      // 2. Extract user info from Google
      const email = payload.email;
      const firstName = payload.given_name;
      const lastName = payload.family_name;
      const googleId = payload.sub;

      // 3. Check if user already exists (by googleId or email)
      let user = await this.prisma.user.findFirst({
        where: { OR: [{ googleId }, { email }] },
      });

      // 4. Create a new user if they don't exist
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            googleId,
          },
        });
      }

      // 5. Generate your own JWT
      const accessToken = this.token(user);
      return { user: this.safeUser(user), accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

}
