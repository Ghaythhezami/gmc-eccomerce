import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client; // <-- Declared

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    // <-- Initialize in constructor!
    this.googleClient = new OAuth2Client(this.config.get<string>('GOOGLE_CLIENT_ID'));
  }

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

  // NEW: Validate Google token and create/find user
  async validateGoogleToken(googleToken: string) {
    try {
      // 1. Get token info
      const tokenInfo = await this.googleClient.getTokenInfo(googleToken);
      const googleId = tokenInfo.sub;

      // 2. Fetch user info from Google API - DEFINE THE TYPE!
      interface GoogleUserInfo {
        email: string;
        given_name?: string;
        family_name?: string;
      }

      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${googleToken}` },
      });
      const userInfo = (await response.json()) as GoogleUserInfo; // <-- CAST HERE!

      const email = userInfo.email;
      const firstName = userInfo.given_name || 'Google';
      const lastName = userInfo.family_name || 'User';

      // 3. Check if user exists
      let user = await this.prisma.user.findFirst({
        where: { OR: [{ googleId }, { email }] },
      });

      // 4. Create a new CUSTOMER if user doesn't exist
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            googleId,
            role: 'CUSTOMER',
          },
        });
      }

      // 5. Generate JWT
      const accessToken = this.token(user);
      return { user: this.safeUser(user), accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}