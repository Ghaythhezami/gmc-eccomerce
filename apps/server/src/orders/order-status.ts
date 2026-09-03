import { OrderStatus } from '@prisma/client';

/**
 * Legal order-status moves (from the FEATURE-005 handoff):
 *   PENDING    -> PAID | CANCELLED
 *   PAID       -> PROCESSING | CANCELLED
 *   PROCESSING -> SHIPPED | CANCELLED
 *   SHIPPED    -> DELIVERED
 *   DELIVERED / CANCELLED -> terminal
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.PAID, OrderStatus.CANCELLED],
  PAID: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
