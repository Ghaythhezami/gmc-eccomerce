import { NotificationType } from '@prisma/client';
import { LOW_STOCK_THRESHOLD, NotificationsListener } from './notifications.listener';

describe('NotificationsListener', () => {
  const notifications = { create: jest.fn(), createOrderStatus: jest.fn() } as any;
  const user = { findMany: jest.fn() };
  const prisma = { user } as any;
  const events = { on: jest.fn() } as any;
  let listener: NotificationsListener;

  beforeEach(() => {
    listener = new NotificationsListener(events, notifications, prisma);
  });

  describe('order.status.changed', () => {
    it('asks the notifications service to notify the customer', async () => {
      await listener.handleOrderStatusChanged({
        orderId: 'o1',
        userId: 'u1',
        from: 'PENDING' as any,
        to: 'SHIPPED' as any,
      });
      expect(notifications.createOrderStatus).toHaveBeenCalledWith('u1', 'o1', 'SHIPPED');
    });
  });

  describe('product.stock.changed (low-stock alert)', () => {
    it('alerts every admin when stock crosses below the threshold', async () => {
      user.findMany.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);

      await listener.handleStockChanged({
        productId: 'p1',
        name: 'Widget',
        stock: LOW_STOCK_THRESHOLD - 1,
        previousStock: LOW_STOCK_THRESHOLD,
      });

      expect(notifications.create).toHaveBeenCalledTimes(2);
      expect(notifications.create).toHaveBeenCalledWith(
        'a1',
        expect.objectContaining({ type: NotificationType.LOW_STOCK }),
      );
    });

    it('stays quiet when stock was already below the threshold', async () => {
      await listener.handleStockChanged({
        productId: 'p1',
        name: 'Widget',
        stock: 1,
        previousStock: 2,
      });
      expect(user.findMany).not.toHaveBeenCalled();
      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('stays quiet when stock stays at or above the threshold', async () => {
      await listener.handleStockChanged({
        productId: 'p1',
        name: 'Widget',
        stock: LOW_STOCK_THRESHOLD + 1,
        previousStock: 10,
      });
      expect(notifications.create).not.toHaveBeenCalled();
    });
  });
});
