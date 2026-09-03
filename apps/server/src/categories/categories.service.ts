import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const withCount = { _count: { select: { products: true } } } satisfies Prisma.CategoryInclude;

type CategoryWithCount = Prisma.CategoryGetPayload<{ include: typeof withCount }>;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private shape(category: CategoryWithCount) {
    const { _count, ...rest } = category;
    return { ...rest, productCount: _count.products };
  }

  /** Storefront view: only active categories, in the order the admin arranged them. */
  async findPublic() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      include: withCount,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return categories.map((category) => this.shape(category));
  }

  /** Admin view: everything, including deactivated categories. */
  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: withCount,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return categories.map((category) => this.shape(category));
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug }, include: withCount });
    if (!category) throw new NotFoundException(`Category "${slug}" not found`);
    return this.shape(category);
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.slug ?? dto.name);
    if (!slug) throw new BadRequestException('Category name must contain at least one letter or digit');
    await this.assertSlugFree(slug);
    await this.assertNameFree(dto.name);
    const category = await this.prisma.category.create({
      data: { ...dto, slug },
      include: withCount,
    });
    return this.shape(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.assertExists(id);
    const slugSource = dto.slug ?? dto.name;
    const slug = slugSource ? slugify(slugSource) : undefined;
    if (slug) await this.assertSlugFree(slug, id);
    if (dto.name) await this.assertNameFree(dto.name, id);
    const category = await this.prisma.category.update({
      where: { id },
      data: { ...dto, ...(slug ? { slug } : {}) },
      include: withCount,
    });
    return this.shape(category);
  }

  async remove(id: string) {
    await this.assertExists(id);
    const products = await this.prisma.product.count({ where: { categoryId: id } });
    if (products > 0) {
      throw new BadRequestException(
        `Cannot delete a category that still holds ${products} product(s). Move or delete them first.`,
      );
    }
    await this.prisma.category.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async assertExists(id: string) {
    const exists = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Category not found');
  }

  private async assertSlugFree(slug: string, exceptId?: string) {
    const clash = await this.prisma.category.findUnique({ where: { slug }, select: { id: true } });
    if (clash && clash.id !== exceptId) throw new BadRequestException(`Slug "${slug}" is already in use`);
  }

  private async assertNameFree(name: string, exceptId?: string) {
    const clash = await this.prisma.category.findUnique({ where: { name }, select: { id: true } });
    if (clash && clash.id !== exceptId) throw new BadRequestException(`Category "${name}" already exists`);
  }
}
