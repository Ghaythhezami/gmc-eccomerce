import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { canTransition } from './order-status';
import { OrdersService } from './orders.service';

describe('order-status transition rules', () => {
  it('allows the documented moves', () => {
    expect(canTransition(OrderStatus.PENDING, OrderStatus.PAID)).toBe(true);
    expect(canTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true);
    expect(canTransition(OrderStatus.PAID, OrderStatus.PROCESSING)).toBe(true);
    expect(canTransition(OrderStatus.PROCESSING, OrderStatus.SHIPPED)).toBe(true);
    expect(canTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(true);
  });

  it('blocks skips, reversals and moves out of terminal states', () => {
    expect(canTransition(OrderStatus.PENDING, OrderStatus.SHIPPED)).toBe(false);
    expect(canTransition(OrderStatus.SHIPPED, OrderStatus.PROCESSING)).toBe(false);
    expect(canTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toBe(false);
    expect(canTransition(OrderStatus.CANCELLED, OrderStatus.PENDING)).toBe(false);
  });
});

describe('OrdersService.updateStatus', () => {
  const order = { findUnique: jest.fn(), update: jest.fn() };
  const prisma = { order } as any;
  const events = { emit: jest.fn() } as any;
  let service: OrdersService;

  beforeEach(() => {
    service = new OrdersService(prisma, events);
  });

  it('404s for an unknown order', async () => {
    order.findUnique.mockResolvedValue(null);
    await expect(service.updateStatus('x', OrderStatus.PAID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects an illegal transition without writing or emitting', async () => {
    order.findUnique.mockResolvedValue({ id: 'o1', status: OrderStatus.PENDING, userId: 'u1' });
    await expect(service.updateStatus('o1', OrderStatus.SHIPPED)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(order.update).not.toHaveBeenCalled();
    expect(events.emit).not.toHaveBeenCalled();
  });

  it('applies a legal transition and emits order.status.changed', async () => {
    order.findUnique.mockResolvedValue({ id: 'o1', status: OrderStatus.PENDING, userId: 'u1' });
    order.update.mockResolvedValue({ id: 'o1', status: OrderStatus.PAID, userId: 'u1' });

    await service.updateStatus('o1', OrderStatus.PAID);

    // The update also pulls customer + product rows so the admin list can re-render.
    expect(order.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'o1' }, data: { status: OrderStatus.PAID } }),
    );
    expect(events.emit).toHaveBeenCalledWith(
      'order.status.changed',
      expect.objectContaining({
        orderId: 'o1',
        userId: 'u1',
        from: OrderStatus.PENDING,
        to: OrderStatus.PAID,
      }),
    );
  });

  it('is a no-op when the status is unchanged', async () => {
    order.findUnique.mockResolvedValue({ id: 'o1', status: OrderStatus.PAID, userId: 'u1' });
    await service.updateStatus('o1', OrderStatus.PAID);
    expect(order.update).not.toHaveBeenCalled();
    expect(events.emit).not.toHaveBeenCalled();
  });
});
