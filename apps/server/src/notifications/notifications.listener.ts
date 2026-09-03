import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationType, Role } from '@prisma/client';
import { DomainEventsService } from '../common/events/domain-events.service';
import {
  ORDER_STATUS_CHANGED,
  PRODUCT_STOCK_CHANGED,
  type OrderStatusChangedEvent,
  type ProductStockChangedEvent,
} from '../common/events/event-names';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

/** Admins are alerted the first time a product's stock drops below this. */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * Turns domain events into notifications (NEC-503):
 *  - order status change  -> notify the order's customer
 *  - stock crossing the low threshold -> notify every admin
 */
@Injectable()
export class NotificationsListener implements OnModuleInit {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    private readonly events: DomainEventsService,
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.events
      .on<OrderStatusChangedEvent>(ORDER_STATUS_CHANGED)
      .subscribe((event) => void this.handleOrderStatusChanged(event));
    this.events
      .on<ProductStockChangedEvent>(PRODUCT_STOCK_CHANGED)
      .subscribe((event) => void this.handleStockChanged(event));
  }

  async handleOrderStatusChanged(event: OrderStatusChangedEvent) {
    try {
      await this.notifications.createOrderStatus(event.userId, event.orderId, event.to);
    } catch (err) {
      this.logger.error(`${ORDER_STATUS_CHANGED} handler failed: ${(err as Error).message}`);
    }
  }

  async handleStockChanged(event: ProductStockChangedEvent) {
    const crossedBelow =
      event.previousStock >= LOW_STOCK_THRESHOLD && event.stock < LOW_STOCK_THRESHOLD;
    if (!crossedBelow) return;
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: Role.ADMIN },
        select: { id: true },
      });
      await Promise.all(
        admins.map((admin) =>
          this.notifications.create(admin.id, {
            type: NotificationType.LOW_STOCK,
            title: 'Low stock',
            message: `${event.name} is running low — ${event.stock} left in stock.`,
          }),
        ),
      );
    } catch (err) {
      this.logger.error(`${PRODUCT_STOCK_CHANGED} handler failed: ${(err as Error).message}`);
    }
  }
}
