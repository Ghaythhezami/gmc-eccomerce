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
    const user = await this.prisma.user.create({ data: { ...dto, email: dto.email.toLowerCase(), passwordHash: await bcrypt.hash(dto.password, 10) } });
    return { user: this.safeUser(user), accessToken: this.token(user) };
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid credentials');
    return { user: this.safeUser(user), accessToken: this.token(user) };
  }
  async me(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    return this.safeUser(user);
  }
}
