import type { OrderStatus } from '@prisma/client';

/** In-process domain event names. Keep these stable — listeners subscribe by string. */
export const ORDER_CREATED = 'order.created';
export const ORDER_STATUS_CHANGED = 'order.status.changed';
export const PRODUCT_STOCK_CHANGED = 'product.stock.changed';

export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  userId: string;
  from: OrderStatus;
  to: OrderStatus;
}

export interface ProductStockChangedEvent {
  productId: string;
  name: string;
  stock: number;
  previousStock: number;
}
