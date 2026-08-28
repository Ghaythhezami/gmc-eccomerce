import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Read-only catalog access. This is a minimal scaffold so the storefront
 * product page and the reviews feature have something to hang off — the full
 * catalog CRUD is FEATURE-002 / FEATURE-006.
 */
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
