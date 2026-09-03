// apps/server/src/auth/admin.service.ts
import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // Admin-specific login
  async adminLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== 'ADMIN') {
      throw new UnauthorizedException('Not authorized for admin access');
    }

    return {
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
      accessToken: this.jwt.sign({ sub: user.id, email: user.email, role: user.role }),
    };
  }

  // Admin-specific registration (ONLY use this in development, or use a seed script)
  async adminRegister(dto: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email is already registered');

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase(),
        passwordHash: await bcrypt.hash(dto.password, 10),
        role: 'ADMIN',
      },
    });

    return {
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
      accessToken: this.jwt.sign({ sub: user.id, email: user.email, role: user.role }),
    };
  }

  // NEW: Admin Google Login (Only allow existing ADMINS)
  async validateAdminGoogleToken(googleToken: string) {
    try {
      // 1. Decode the Google token to get user info
      const payload: any = this.jwt.decode(googleToken);

      // 2. Extract user info from Google
      const email = payload.email;
      const googleId = payload.sub;

      // 3. Only allow login if user already exists AND is ADMIN
      let user = await this.prisma.user.findFirst({
        where: { OR: [{ googleId }, { email }] },
      });

      if (!user || user.role !== 'ADMIN') {
        throw new UnauthorizedException('Only registered admin accounts can access this portal.');
      }

      // 4. Generate JWT
      const accessToken = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
      return { user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }, accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.delete({ where: { id } });
  }

  // Get current storefront allowed roles (default to CUSTOMER)
  async getStorefrontAccess() {
    const access = await this.prisma.storefrontAccess.findFirst();
    return { allowedRoles: access?.allowedRoles ?? ['CUSTOMER'] };
  }

  // Update allowed roles (admin only)
  async updateStorefrontAccess(allowedRoles: string[]) {
    const existing = await this.prisma.storefrontAccess.findFirst();
    if (existing) {
      return this.prisma.storefrontAccess.update({
        where: { id: existing.id },
        data: { allowedRoles },
      });
    }
    return this.prisma.storefrontAccess.create({
      data: { allowedRoles },
    });
  }

  async getAllRoles() {
    return Object.values(Role);
  }
}