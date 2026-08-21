import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService, private readonly gateway: NotificationsGateway) {}
  async create(userId: string, title: string, message: string) {
    const notification = await this.prisma.notification.create({ data: { userId, title, message } });
    this.gateway.emitCreated(notification);
    return notification;
  }
}
