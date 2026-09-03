import { ForbiddenException, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

/** An order in one of these states counts as "the customer bought this". */
const PURCHASED_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** NEC-504: a user may only review a product they actually bought. */
  async hasPurchased(userId: string, productId: string): Promise<boolean> {
    const item = await this.prisma.orderItem.findFirst({
      where: { productId, order: { userId, status: { in: PURCHASED_STATUSES } } },
      select: { id: true },
    });
    return item !== null;
  }

  async create(userId: string, productId: string, dto: CreateReviewDto) {
    if (!(await this.hasPurchased(userId, productId))) {
      throw new ForbiddenException('You can only review products you have purchased');
    }
    // One review per user per product — a repeat submission updates it.
    return this.prisma.review.upsert({
      where: { productId_userId: { productId, userId } },
      create: { productId, userId, rating: dto.rating, comment: dto.comment ?? null },
      update: { rating: dto.rating, comment: dto.comment ?? null },
    });
  }

  async listForProduct(productId: string, skip = 0, take = 10) {
    const [items, aggregate] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);
    return {
      items,
      total: aggregate._count,
      averageRating: aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(2)) : 0,
      skip,
      take,
    };
  }
}
