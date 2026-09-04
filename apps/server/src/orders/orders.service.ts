import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { DomainEventsService } from '../common/events/domain-events.service';
import {
  ORDER_CREATED,
  ORDER_STATUS_CHANGED,
  PRODUCT_STOCK_CHANGED,
  type ProductStockChangedEvent,
} from '../common/events/event-names';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { canTransition } from './order-status';

/** Orders are rendered with product names, so every read pulls the product along. */
const ORDER_INCLUDE = {
  items: {
    include: { product: { select: { id: true, name: true, slug: true, imageUrl: true } } },
  },
} satisfies Prisma.OrderInclude;

/** The admin list additionally needs to say who placed the order. */
const ADMIN_ORDER_INCLUDE = {
  ...ORDER_INCLUDE,
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: DomainEventsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const productIds = [...new Set(dto.items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products do not exist');
    }
    const byId = new Map(products.map((p) => [p.id, p]));

    // Checkout must not oversell: without this the decrement below drives stock negative.
    for (const line of dto.items) {
      const product = byId.get(line.productId)!;
      if (product.stock < line.quantity) {
        throw new BadRequestException(
          product.stock === 0
            ? `${product.name} is out of stock`
            : `Only ${product.stock} left of ${product.name}`,
        );
      }
    }

    // Prices are snapshotted from the product and the total is computed here —
    // the client never sends a price or a total.
    const items = dto.items.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: byId.get(line.productId)!.price,
    }));
    const total = items.reduce(
      (sum, item) => sum.add(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
      new Prisma.Decimal(0),
    );

    const stockEvents: ProductStockChangedEvent[] = [];
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: { userId, total, items: { create: items } },
        include: ORDER_INCLUDE,
      });
      for (const line of items) {
        const product = byId.get(line.productId)!;
        const updated = await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: line.quantity } },
        });
        stockEvents.push({
          productId: product.id,
          name: product.name,
          stock: updated.stock,
          previousStock: product.stock,
        });
      }

      // Checkout hands us the cart's lines, so the ordered ones are now spoken for.
      // Only those are dropped: ordering a subset must leave the rest of the cart alone.
      await tx.cartItem.deleteMany({ where: { cart: { userId }, productId: { in: productIds } } });

      return created;
    });

    // Emit only once the write has committed.
    this.events.emit(ORDER_CREATED, { orderId: order.id, userId });
    for (const event of stockEvents) this.events.emit(PRODUCT_STOCK_CHANGED, event);

    return order;
  }

  findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: ORDER_INCLUDE,
    });
  }

  async findOneForUser(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    // 404 rather than 403 so this cannot be used to probe which order ids exist.
    if (!order || order.userId !== userId) throw new NotFoundException('Order not found');
    return order;
  }

  /** Admin: every customer's orders, newest first. */
  async findAllForAdmin({ status, skip = 0, take = 20 }: QueryOrdersDto) {
    const where = status ? { status } : {};
    const [items, total, grouped] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: ADMIN_ORDER_INCLUDE,
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
      // Drives the status filter chips, so it deliberately ignores `where`.
      // Kept out of $transaction: groupBy inside the tuple form trips a circular
      // mapped-type error in the generated Prisma client, and these counts are a
      // display aid that does not need to be transactionally consistent.
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const countsByStatus = Object.fromEntries(grouped.map((row) => [row.status, row._count._all]));

    return { items, total, skip, take, countsByStatus };
  }

  async findOneForAdmin(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: ADMIN_ORDER_INCLUDE });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, next: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === next) return order;
    if (!canTransition(order.status, next)) {
      throw new BadRequestException(`Cannot move order from ${order.status} to ${next}`);
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: next },
      include: ADMIN_ORDER_INCLUDE,
    });
    this.events.emit(ORDER_STATUS_CHANGED, {
      orderId: updated.id,
      userId: updated.userId,
      from: order.status,
      to: next,
    });
    return updated;
  }
}
