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
import { canTransition } from './order-status';

/**
 * Minimal order flow — enough to drive the notification triggers (NEC-503).
 * The full customer/admin Orders feature is FEATURE-005.
 */
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
        include: { items: true },
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
      include: { items: true },
    });
  }

  async findOneForUser(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order || order.userId !== userId) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, next: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === next) return order;
    if (!canTransition(order.status, next)) {
      throw new BadRequestException(`Cannot move order from ${order.status} to ${next}`);
    }
    const updated = await this.prisma.order.update({ where: { id }, data: { status: next } });
    this.events.emit(ORDER_STATUS_CHANGED, {
      orderId: updated.id,
      userId: updated.userId,
      from: order.status,
      to: next,
    });
    return updated;
  }
}
