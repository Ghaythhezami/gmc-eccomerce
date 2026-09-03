import { Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my notifications (newest first, paginated)' })
  list(@Req() req: any, @Query() query: ListNotificationsDto) {
    return this.notifications.list(req.user.id, query.skip, query.take);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'How many of my notifications are unread' })
  unreadCount(@Req() req: any) {
    return this.notifications.unreadCount(req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all my notifications as read' })
  markAllRead(@Req() req: any) {
    return this.notifications.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one of my notifications as read' })
  markRead(@Req() req: any, @Param('id') id: string) {
    return this.notifications.markRead(req.user.id, id);
  }
}
