import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import type { PrismaService } from '../prisma/prisma.service';

/**
 * Unit tests against a stubbed Prisma client. They cover the rules the service
 * owns - slug generation, Decimal-to-number mapping, derived discounts, pricing
 * validation and delete protection - without needing a database.
 */
function buildPrisma(overrides: Record<string, unknown> = {}) {
  const prisma = {
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue({}),
      fields: { price: Symbol('price') },
    },
    category: { findUnique: jest.fn().mockResolvedValue({ id: 'cat-1' }) },
    orderItem: { count: jest.fn().mockResolvedValue(0) },
    cartItem: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    $transaction: jest.fn(),
    ...overrides,
  };
  prisma.$transaction = jest.fn((operations: Promise<unknown>[]) => Promise.all(operations));
  // Returned loosely typed so jest mock helpers stay visible on each method.
  return prisma as any;
}

const rawProduct = (extra: Record<string, unknown> = {}) => ({
  id: 'p1',
  name: 'Baldurs Gate 3',
  slug: 'baldurs-gate-3',
  description: 'RPG',
  // Prisma returns Decimal instances; a string stands in for one here because
  // both serialize the same way through Number().
  price: '59.99',
  compareAtPrice: null,
  imageUrl: null,
  stock: 10,
  rating: 4.9,
  reviewCount: 100,
  isFeatured: true,
  isActive: true,
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'PC Games', slug: 'pc-games', icon: null },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...extra,
});

describe('ProductsService', () => {
  describe('findPublic', () => {
    it('returns prices as numbers, not Decimal strings', async () => {
      const prisma = buildPrisma();
      prisma.product.findMany.mockResolvedValue([rawProduct()]);
      prisma.product.count.mockResolvedValue(1);

      const result = await new ProductsService(prisma as PrismaService).findPublic({});

      expect(result.items[0].price).toBe(59.99);
      expect(typeof result.items[0].price).toBe('number');
    });

    it('derives the discount percentage from compareAtPrice', async () => {
      const prisma = buildPrisma();
      prisma.product.findMany.mockResolvedValue([rawProduct({ price: '30.00', compareAtPrice: '60.00' })]);
      prisma.product.count.mockResolvedValue(1);

      const result = await new ProductsService(prisma as PrismaService).findPublic({});

      expect(result.items[0].discountPercent).toBe(50);
    });

    it('leaves discountPercent null when there is no compare-at price', async () => {
      const prisma = buildPrisma();
      prisma.product.findMany.mockResolvedValue([rawProduct()]);
      prisma.product.count.mockResolvedValue(1);

      const result = await new ProductsService(prisma as PrismaService).findPublic({});

      expect(result.items[0].discountPercent).toBeNull();
    });

    it('only ever exposes active products', async () => {
      const prisma = buildPrisma();
      await new ProductsService(prisma as PrismaService).findPublic({});

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ isActive: true }) }),
      );
    });

    it('paginates server-side and reports a page count', async () => {
      const prisma = buildPrisma();
      prisma.product.count.mockResolvedValue(30);

      const result = await new ProductsService(prisma as PrismaService).findPublic({ page: 2, limit: 12 });

      expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 12, take: 12 }));
      expect(result.pageCount).toBe(3);
      expect(result.total).toBe(30);
    });

    it('searches name and description case-insensitively', async () => {
      const prisma = buildPrisma();
      await new ProductsService(prisma as PrismaService).findPublic({ search: 'zelda' });

      const where = prisma.product.findMany.mock.calls[0][0].where;
      expect(where.OR).toEqual([
        { name: { contains: 'zelda', mode: 'insensitive' } },
        { description: { contains: 'zelda', mode: 'insensitive' } },
      ]);
    });

    it('filters on-sale items in the query so paging stays accurate', async () => {
      const prisma = buildPrisma();
      await new ProductsService(prisma as PrismaService).findPublic({ onSale: true });

      const where = prisma.product.findMany.mock.calls[0][0].where;
      expect(where.compareAtPrice).toEqual({ gt: prisma.product.fields.price });
    });
  });

  describe('findBySlug', () => {
    it('throws 404 for an unknown slug', async () => {
      const prisma = buildPrisma();
      await expect(new ProductsService(prisma as PrismaService).findBySlug('nope')).rejects.toThrow(NotFoundException);
    });

    it('includes the category with the product', async () => {
      const prisma = buildPrisma();
      prisma.product.findUnique.mockResolvedValue(rawProduct());

      const product = await new ProductsService(prisma as PrismaService).findBySlug('baldurs-gate-3');

      expect(product.category).toEqual({ id: 'cat-1', name: 'PC Games', slug: 'pc-games', icon: null });
    });
  });

  describe('create', () => {
    const dto = { name: 'New Game', description: 'x', price: 10, categoryId: 'cat-1' };

    it('generates a slug from the name when none is given', async () => {
      const prisma = buildPrisma();
      prisma.product.create.mockResolvedValue(rawProduct());

      await new ProductsService(prisma as PrismaService).create({ ...dto, name: 'Some New Game!' });

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ slug: 'some-new-game' }) }),
      );
    });

    it('rejects a duplicate slug with a readable error', async () => {
      const prisma = buildPrisma();
      prisma.product.findUnique.mockResolvedValue({ id: 'other' });

      await expect(new ProductsService(prisma as PrismaService).create(dto)).rejects.toThrow(BadRequestException);
    });

    it('rejects a compare-at price that is not above the selling price', async () => {
      const prisma = buildPrisma();

      await expect(
        new ProductsService(prisma as PrismaService).create({ ...dto, price: 50, compareAtPrice: 40 }),
      ).rejects.toThrow('Compare-at price must be higher than the selling price');
    });

    it('rejects an unknown category', async () => {
      const prisma = buildPrisma();
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(new ProductsService(prisma as PrismaService).create(dto)).rejects.toThrow('Selected category does not exist');
    });
  });

  describe('remove', () => {
    it('refuses to delete a product that appears on an order', async () => {
      const prisma = buildPrisma();
      prisma.product.findUnique.mockResolvedValue({ id: 'p1' });
      prisma.orderItem.count.mockResolvedValue(3);

      await expect(new ProductsService(prisma as PrismaService).remove('p1')).rejects.toThrow(/order line/);
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });

    it('clears cart lines before deleting an unreferenced product', async () => {
      const prisma = buildPrisma();
      prisma.product.findUnique.mockResolvedValue({ id: 'p1' });

      await new ProductsService(prisma as PrismaService).remove('p1');

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { productId: 'p1' } });
      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    });

    it('throws 404 for a product that does not exist', async () => {
      const prisma = buildPrisma();
      await expect(new ProductsService(prisma as PrismaService).remove('ghost')).rejects.toThrow(NotFoundException);
    });
  });
});
