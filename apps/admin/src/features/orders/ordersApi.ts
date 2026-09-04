import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuthHandling } from '../../store/baseQuery';

export const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Mirrors apps/server/src/orders/order-status.ts so the UI only offers moves the
 * server will accept. The server re-validates every transition - this is only
 * here to keep impossible options out of the dropdown.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export interface AdminOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: { id: string; name: string; slug: string; imageUrl: string | null } | null;
}

export interface AdminOrder {
  id: string;
  status: OrderStatus;
  total: string;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
  user: { id: string; firstName: string; lastName: string; email: string } | null;
}

export interface AdminOrderPage {
  items: AdminOrder[];
  total: number;
  skip: number;
  take: number;
  countsByStatus: Partial<Record<OrderStatus, number>>;
}

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ['Orders'],
  endpoints: (build) => ({
    getOrders: build.query<AdminOrderPage, { status?: OrderStatus; skip?: number; take?: number }>({
      query: ({ status, skip = 0, take = 20 } = {}) => {
        const params = new URLSearchParams({ skip: String(skip), take: String(take) });
        if (status) params.set('status', status);
        return `admin/orders?${params.toString()}`;
      },
      providesTags: ['Orders'],
    }),
    updateOrderStatus: build.mutation<AdminOrder, { id: string; status: OrderStatus }>({
      query: ({ id, status }) => ({ url: `admin/orders/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const { useGetOrdersQuery, useUpdateOrderStatusMutation } = ordersApi;
