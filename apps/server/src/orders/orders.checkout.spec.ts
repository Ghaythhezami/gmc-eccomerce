import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';

/**
 * Covers the checkout path: stock guarding, clearing the ordered cart lines, and
 * the admin order queries behind the /orders screen.
 */
function makeService(products: { id: string; name: string; price: number; stock: number }[]) {
  const tx = {
    order: { create: jest.fn(async ({ data }: any) => ({ id: 'o1', ...data, items: [] })) },
    product: {
      update: jest.fn(async ({ where, data }: any) => ({
        id: where.id,
        stock: products.find((p) => p.id === where.id)!.stock - data.stock.decrement,
      })),
    },
    cartItem: { deleteMany: jest.fn(async () => ({ count: 1 })) },
  };

  const prisma = {
    // Honour the id filter: create() compares the row count to the requested ids.
    product: {
      findMany: jest.fn(async ({ where }: any) =>
        products.filter((p) => where.id.in.includes(p.id)),
      ),
    },
    order: {
      findMany: jest.fn(async () => [{ id: 'o1' }]),
      count: jest.fn(async () => 1),
      groupBy: jest.fn(async () => [{ status: OrderStatus.PENDING, _count: { _all: 3 } }]),
      findUnique: jest.fn(async () => null),
    },
    $transaction: jest.fn(async (fn: any) => fn(tx)),
  } as any;

  const events = { emit: jest.fn() } as any;
  return { service: new OrdersService(prisma, events), prisma, tx, events };
}

const product = { id: 'p1', name: 'Pro Controller', price: 79.9, stock: 5 };

describe('OrdersService.create (checkout)', () => {
  it('refuses to oversell, so stock cannot go negative', async () => {
    const { service, tx } = makeService([product]);

    await expect(service.create('u1', { items: [{ productId: 'p1', quantity: 6 }] })).rejects.toThrow(
      'Only 5 left of Pro Controller',
    );
    expect(tx.product.update).not.toHaveBeenCalled();
  });

  it('reports an out-of-stock product distinctly', async () => {
    const { service } = makeService([{ ...product, stock: 0 }]);

    await expect(service.create('u1', { items: [{ productId: 'p1', quantity: 1 }] })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('decrements stock and removes only the ordered lines from the cart', async () => {
    const { service, tx } = makeService([product, { id: 'p2', name: 'Other', price: 10, stock: 9 }]);

    await service.create('u1', { items: [{ productId: 'p1', quantity: 2 }] });

    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { stock: { decrement: 2 } },
    });
    // p2 is still in the cart because it was not part of this order.
    expect(tx.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cart: { userId: 'u1' }, productId: { in: ['p1'] } },
    });
  });

  it('rejects an order referencing a product that does not exist', async () => {
    const { service } = makeService([]);

    await expect(service.create('u1', { items: [{ productId: 'ghost', quantity: 1 }] })).rejects.toThrow(
      'One or more products do not exist',
    );
  });
});

describe('OrdersService admin queries', () => {
  it('filters by status and reports per-status counts for the filter chips', async () => {
    const { service, prisma } = makeService([product]);

    const page = await service.findAllForAdmin({ status: OrderStatus.PENDING, skip: 0, take: 20 });

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: OrderStatus.PENDING }, skip: 0, take: 20 }),
    );
    expect(page.countsByStatus).toEqual({ PENDING: 3 });
    expect(page.total).toBe(1);
  });

  it('lists every order when no status is given', async () => {
    const { service, prisma } = makeService([product]);

    await service.findAllForAdmin({});

    expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
  });

  it('404s for an unknown order id', async () => {
    const { service } = makeService([product]);

    await expect(service.findOneForAdmin('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});
