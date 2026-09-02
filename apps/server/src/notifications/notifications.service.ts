import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { PushService } from './push.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
    private readonly push: PushService,
  ) {}

  /**
   * Records a notification, mirrors it to any open socket, and pushes it to the
   * user's registered browsers. Push failures never surface to the caller.
   */
  async create(userId: string, title: string, message: string, url?: string) {
    const notification = await this.prisma.notification.create({ data: { userId, title, message } });
    this.gateway.emitCreated(notification);
    await this.push.sendToUser(userId, { title, message, url });
    return notification;
  }

  async listForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, readAt: null } });
    return { count };
  }

  async markRead(userId: string, id: string) {
    // Scoped by userId so one user cannot mark another user's notification.
    const { count } = await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
    if (count === 0) {
      const exists = await this.prisma.notification.findFirst({ where: { id, userId }, select: { id: true } });
      if (!exists) throw new NotFoundException('Notification not found');
    }
    return { id, read: true };
  }

  async markAllRead(userId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: count };
  }

  /** Admin broadcast: one stored notification per user, one push per device. */
  async broadcast(title: string, message: string, url?: string) {
    const users = await this.prisma.user.findMany({ select: { id: true } });
    if (users.length) {
      await this.prisma.notification.createMany({
        data: users.map((user) => ({ userId: user.id, title, message })),
      });
    }
    this.gateway.emitCreated({ title, message, broadcast: true });
    const result = await this.push.sendToAll({ title, message, url });
    return { recipients: users.length, ...result };
  }

  async recentBroadcastable() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: { user: { select: { email: true } } },
    });
  }
}
