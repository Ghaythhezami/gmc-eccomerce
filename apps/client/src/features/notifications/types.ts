export type NotificationType = 'ORDER_STATUS' | 'LOW_STOCK' | 'PROMO';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  items: AppNotification[];
  total: number;
  unread: number;
  skip: number;
  take: number;
}
