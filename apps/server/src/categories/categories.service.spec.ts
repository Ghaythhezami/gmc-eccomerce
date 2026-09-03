import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import type { PrismaService } from '../prisma/prisma.service';

function buildPrisma(overrides: Record<string, unknown> = {}) {
  return {
    category: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue({}),
    },
    product: { count: jest.fn().mockResolvedValue(0) },
    ...overrides,
  } as any; // loosely typed so jest mock helpers stay visible on each method
}

const rawCategory = (extra: Record<string, unknown> = {}) => ({
  id: 'cat-1',
  name: 'PC Games',
  slug: 'pc-games',
  description: null,
  icon: null,
  imageUrl: null,
  sortOrder: 1,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { products: 4 },
  ...extra,
});

describe('CategoriesService', () => {
  describe('findPublic', () => {
    it('exposes only active categories, ordered for the storefront', async () => {
      const prisma = buildPrisma();
      await new CategoriesService(prisma as PrismaService).findPublic();

      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        }),
      );
    });

    it('flattens the relation count into productCount', async () => {
      const prisma = buildPrisma();
      prisma.category.findMany.mockResolvedValue([rawCategory()]);

      const [category] = await new CategoriesService(prisma as PrismaService).findPublic();

      expect(category.productCount).toBe(4);
      expect(category).not.toHaveProperty('_count');
    });
  });

  describe('findAll', () => {
    it('does not filter by isActive, so the admin sees hidden categories', async () => {
      const prisma = buildPrisma();
      await new CategoriesService(prisma as PrismaService).findAll();

      expect(prisma.category.findMany).toHaveBeenCalledWith(expect.not.objectContaining({ where: expect.anything() }));
    });
  });

  describe('findBySlug', () => {
    it('throws 404 for an unknown slug', async () => {
      const prisma = buildPrisma();
      await expect(new CategoriesService(prisma as PrismaService).findBySlug('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('slugifies the name, stripping accents and punctuation', async () => {
      const prisma = buildPrisma();
      prisma.category.create.mockResolvedValue(rawCategory());

      await new CategoriesService(prisma as PrismaService).create({ name: 'Jeux Vidéo & Accessoires' });

      expect(prisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ slug: 'jeux-video-accessoires' }) }),
      );
    });

    it('rejects a name with no usable characters', async () => {
      const prisma = buildPrisma();
      await expect(new CategoriesService(prisma as PrismaService).create({ name: '!!!' })).rejects.toThrow(BadRequestException);
    });

    it('rejects a duplicate slug', async () => {
      const prisma = buildPrisma();
      prisma.category.findUnique.mockResolvedValue({ id: 'other' });

      await expect(new CategoriesService(prisma as PrismaService).create({ name: 'PC Games' })).rejects.toThrow(/already in use/);
    });

    it('rejects a duplicate name', async () => {
      const prisma = buildPrisma();
      // Free slug, taken name.
      prisma.category.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'other' });

      await expect(new CategoriesService(prisma as PrismaService).create({ name: 'PC Games' })).rejects.toThrow(/already exists/);
    });
  });

  describe('remove', () => {
    it('refuses to delete a category that still holds products', async () => {
      const prisma = buildPrisma();
      prisma.category.findUnique.mockResolvedValue({ id: 'cat-1' });
      prisma.product.count.mockResolvedValue(5);

      await expect(new CategoriesService(prisma as PrismaService).remove('cat-1')).rejects.toThrow(/5 product/);
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });

    it('deletes an empty category', async () => {
      const prisma = buildPrisma();
      prisma.category.findUnique.mockResolvedValue({ id: 'cat-1' });

      const result = await new CategoriesService(prisma as PrismaService).remove('cat-1');

      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 'cat-1' } });
      expect(result).toEqual({ id: 'cat-1', deleted: true });
    });

    it('throws 404 for a category that does not exist', async () => {
      const prisma = buildPrisma();
      await expect(new CategoriesService(prisma as PrismaService).remove('ghost')).rejects.toThrow(NotFoundException);
    });
  });
});
