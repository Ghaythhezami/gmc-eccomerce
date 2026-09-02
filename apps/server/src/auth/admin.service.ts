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

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
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

  /** Real counts for the admin dashboard - no placeholder figures. */
  async getStats() {
    const [
      totalUsers, admins, totalProducts, activeProducts, outOfStock, lowStock,
      totalCategories, activeCategories, totalOrders, pushSubscriptions,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { stock: 0 } }),
      this.prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
      this.prisma.category.count(),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.pushSubscription.count(),
    ]);

    const byCategory = await this.prisma.category.findMany({
      select: { name: true, icon: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    const inventory = await this.prisma.product.aggregate({ _sum: { stock: true }, _avg: { price: true } });

    return {
      users: { total: totalUsers, admins, customers: totalUsers - admins },
      products: { total: totalProducts, active: activeProducts, hidden: totalProducts - activeProducts, outOfStock, lowStock },
      categories: { total: totalCategories, active: activeCategories },
      orders: { total: totalOrders },
      push: { subscriptions: pushSubscriptions },
      inventory: {
        unitsInStock: inventory._sum.stock ?? 0,
        averagePrice: inventory._avg.price ? Number(inventory._avg.price) : 0,
      },
      productsByCategory: byCategory.map((c) => ({ name: c.name, icon: c.icon, count: c._count.products })),
    };
  }

  async getAllRoles() {
    // Return all enum values from Prisma
    return Object.values(Role);
  }
}