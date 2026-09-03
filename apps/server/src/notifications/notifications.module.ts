import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsGateway, NotificationsService, PushService],
  exports: [NotificationsService, PushService],
})
export class NotificationsModule {}
