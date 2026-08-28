import { ForbiddenException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  const orderItem = { findFirst: jest.fn() };
  const review = { upsert: jest.fn() };
  const prisma = { orderItem, review } as any;
  let service: ReviewsService;

  beforeEach(() => {
    service = new ReviewsService(prisma);
  });

  describe('hasPurchased (review eligibility)', () => {
    it('is true when the user has an order line for the product', async () => {
      orderItem.findFirst.mockResolvedValue({ id: 'oi_1' });
      await expect(service.hasPurchased('u1', 'p1')).resolves.toBe(true);
    });

    it('is false when the user never bought the product', async () => {
      orderItem.findFirst.mockResolvedValue(null);
      await expect(service.hasPurchased('u1', 'p1')).resolves.toBe(false);
    });
  });

  describe('create', () => {
    it('rejects a user who has not purchased the product', async () => {
      orderItem.findFirst.mockResolvedValue(null);
      await expect(service.create('u1', 'p1', { rating: 5 })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(review.upsert).not.toHaveBeenCalled();
    });

    it('upserts one review per (product, user) when eligible', async () => {
      orderItem.findFirst.mockResolvedValue({ id: 'oi_1' });
      review.upsert.mockResolvedValue({ id: 'r1', rating: 4 });

      const result = await service.create('u1', 'p1', { rating: 4, comment: 'Great' });

      expect(review.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId_userId: { productId: 'p1', userId: 'u1' } },
        }),
      );
      expect(result).toEqual({ id: 'r1', rating: 4 });
    });
  });
});
