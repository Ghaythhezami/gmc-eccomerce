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
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // HARD BLOCK: Only allow ADMINS to use this login
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
        role: 'ADMIN', // <-- Directly set to ADMIN!
      },
    });

    return {
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
      accessToken: this.jwt.sign({ sub: user.id, email: user.email, role: user.role }),
    };
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
    // Return all enum values from Prisma
    return Object.values(Role);
  }
}