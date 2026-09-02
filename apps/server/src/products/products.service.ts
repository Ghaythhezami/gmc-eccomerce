import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

const withCategory = {
  category: { select: { id: true, name: true, slug: true, icon: true } },
} satisfies Prisma.ProductInclude;

type ProductWithCategory = Prisma.ProductGetPayload<{ include: typeof withCategory }>;

const DEFAULT_LIMIT = 24;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Prisma returns Decimal instances, which JSON-serialize to strings and break
   * arithmetic on the client. Hand the UI plain numbers plus a derived discount.
   */
  private shape(product: ProductWithCategory) {
    const price = Number(product.price);
    const compareAtPrice = product.compareAtPrice === null ? null : Number(product.compareAtPrice);
    const discountPercent =
      compareAtPrice && compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : null;
    return { ...product, price, compareAtPrice, discountPercent };
  }

  async findPublic(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.featured ? { isFeatured: true } : {}),
      // Column-to-column comparison via Prisma field references, so paging stays accurate.
      ...(query.onSale ? { compareAtPrice: { gt: this.prisma.product.fields.price } } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: withCategory,
        orderBy: this.orderBy(query.sort),
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.shape(row)),
      total,
      page,
      limit,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /** Admin view: every product, newest first, inactive included. */
  async findAll() {
    const rows = await this.prisma.product.findMany({ include: withCategory, orderBy: { createdAt: 'desc' } });
    return rows.map((row) => this.shape(row));
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: withCategory });
    if (!product) throw new NotFoundException(`Product "${slug}" not found`);
    return this.shape(product);
  }

  async create(dto: CreateProductDto) {
    const slug = slugify(dto.slug ?? dto.name);
    if (!slug) throw new BadRequestException('Product name must contain at least one letter or digit');
    await this.assertSlugFree(slug);
    await this.assertCategoryExists(dto.categoryId);
    this.assertPricing(dto.price, dto.compareAtPrice);

    const product = await this.prisma.product.create({ data: { ...dto, slug }, include: withCategory });
    return this.shape(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const current = await this.prisma.product.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Product not found');

    const slugSource = dto.slug ?? dto.name;
    const slug = slugSource ? slugify(slugSource) : undefined;
    if (slug) await this.assertSlugFree(slug, id);
    if (dto.categoryId) await this.assertCategoryExists(dto.categoryId);

    this.assertPricing(
      dto.price ?? Number(current.price),
      dto.compareAtPrice !== undefined ? dto.compareAtPrice : current.compareAtPrice === null ? undefined : Number(current.compareAtPrice),
    );

    const product = await this.prisma.product.update({
      where: { id },
      data: { ...dto, ...(slug ? { slug } : {}) },
      include: withCategory,
    });
    return this.shape(product);
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!product) throw new NotFoundException('Product not found');

    const referenced = await this.prisma.orderItem.count({ where: { productId: id } });
    if (referenced > 0) {
      throw new BadRequestException(
        `This product appears on ${referenced} order line(s), so it cannot be deleted. Deactivate it instead.`,
      );
    }

    await this.prisma.cartItem.deleteMany({ where: { productId: id } });
    await this.prisma.product.delete({ where: { id } });
    return { id, deleted: true };
  }

  private orderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case 'price-asc':
        return { price: 'asc' };
      case 'price-desc':
        return { price: 'desc' };
      case 'rating':
        return { rating: 'desc' };
      case 'name':
        return { name: 'asc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  private assertPricing(price: number, compareAtPrice?: number | null) {
    if (compareAtPrice != null && compareAtPrice <= price) {
      throw new BadRequestException('Compare-at price must be higher than the selling price');
    }
  }

  private async assertSlugFree(slug: string, exceptId?: string) {
    const clash = await this.prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (clash && clash.id !== exceptId) throw new BadRequestException(`Slug "${slug}" is already in use`);
  }

  private async assertCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
    if (!category) throw new BadRequestException('Selected category does not exist');
  }
}
