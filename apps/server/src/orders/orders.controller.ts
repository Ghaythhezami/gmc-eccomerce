import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create an order (prices + total computed server-side)' })
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.orders.create(req.user.id, dto);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'My order history' })
  findMine(@Req() req: any) {
    return this.orders.findMine(req.user.id);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'One of my orders (404 if not mine)' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.orders.findOneForUser(req.user.id, id);
  }

  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: every order, newest first' })
  findAllForAdmin(@Query() query: QueryOrdersDto) {
    return this.orders.findAllForAdmin(query);
  }

  @Get('admin/orders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: one order, with customer and product details' })
  findOneForAdmin(@Param('id') id: string) {
    return this.orders.findOneForAdmin(id);
  }

  @Patch('admin/orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: change order status (validated transition)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }
}
