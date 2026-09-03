// apps/server/src/auth/admin.service.ts
import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AdminService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(this.config.get<string>('GOOGLE_CLIENT_ID'));
  }

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

  // Admin-specific registration
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

  // Admin Google Login
  async validateAdminGoogleToken(googleToken: string) {
    try {
      // 1. Get token info
      const tokenInfo = await this.googleClient.getTokenInfo(googleToken);
      const googleId = tokenInfo.sub;

      // 2. Fetch the FULL user profile from Google
      interface GoogleUserInfo {
        email: string;
        given_name?: string;
        family_name?: string;
        name?: string;
      }

      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${googleToken}` },
      });
      const userInfo = (await response.json()) as GoogleUserInfo;

      const email = userInfo.email;
      const firstName = userInfo.given_name || userInfo.name || 'Google';
      const lastName = userInfo.family_name || 'User';

      // 3. Check if user exists
      let user = await this.prisma.user.findFirst({
        where: { OR: [{ googleId }, { email }] },
      });

      // 4. Create a new ADMIN if user doesn't exist
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            googleId,
            role: 'ADMIN',
          },
        });
      }

      // 5. Generate JWT
      const accessToken = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
      return { 
        user: { 
          id: user.id, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          email: user.email, 
          role: user.role 
        }, 
        accessToken 
      };
    } catch (error) {
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

  // Get current storefront allowed roles
  async getStorefrontAccess() {
    const access = await this.prisma.storefrontAccess.findFirst();
    return { allowedRoles: access?.allowedRoles ?? ['CUSTOMER'] };
  }

  // Update allowed roles
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
    return Object.values(Role);
  }

    // Get current admin by ID
  async getAdminById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('User no longer exists');
    }
    return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role };
  }
}