import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { BroadcastDto, SubscribeDto, UnsubscribeDto } from './dto/subscribe.dto';

interface AuthedRequest {
  user: { id: string; email: string; role: Role };
}

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly push: PushService,
  ) {}

  @Get('vapid-public-key')
  @ApiOperation({ summary: 'VAPID public key the browser needs to subscribe (public)' })
  vapidPublicKey() {
    return { publicKey: this.push.publicKey, enabled: this.push.isEnabled };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  @ApiOperation({ summary: 'Register this browser for web push' })
  subscribe(@Req() req: AuthedRequest, @Body() dto: SubscribeDto) {
    return this.push.subscribe(req.user.id, dto, dto.userAgent);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('subscribe')
  @ApiOperation({ summary: 'Remove this browser from web push' })
  unsubscribe(@Req() req: AuthedRequest, @Body() dto: UnsubscribeDto) {
    return this.push.unsubscribe(req.user.id, dto.endpoint);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'My 50 most recent notifications' })
  list(@Req() req: AuthedRequest) {
    return this.notifications.listForUser(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  @ApiOperation({ summary: 'How many of my notifications are unread' })
  unreadCount(@Req() req: AuthedRequest) {
    return this.notifications.unreadCount(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all of my notifications read' })
  markAllRead(@Req() req: AuthedRequest) {
    return this.notifications.markAllRead(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one notification read' })
  markRead(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.notifications.markRead(req.user.id, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('broadcast')
  @ApiOperation({ summary: 'Send a push notification to every user (admin)' })
  broadcast(@Body() dto: BroadcastDto) {
    return this.notifications.broadcast(dto.title, dto.message, dto.url);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('manage/recent')
  @ApiOperation({ summary: 'Recently sent notifications (admin)' })
  recent() {
    return this.notifications.recentBroadcastable();
  }
}
