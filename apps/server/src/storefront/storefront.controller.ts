import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StorefrontService } from './storefront.service';
import { SubscribeNewsletterDto, UnsubscribeNewsletterDto, UpdateFlashSaleDto } from './dto/storefront.dto';

@ApiTags('Storefront')
@Controller()
export class StorefrontController {
  constructor(private readonly storefront: StorefrontService) {}

  @Post('newsletter/subscribe')
  @ApiOperation({ summary: 'Join the newsletter (public)' })
  subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.storefront.subscribe(dto);
  }

  @Post('newsletter/unsubscribe')
  @ApiOperation({ summary: 'Leave the newsletter (public)' })
  unsubscribe(@Body() dto: UnsubscribeNewsletterDto) {
    return this.storefront.unsubscribe(dto.email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('newsletter/manage')
  @ApiOperation({ summary: 'List newsletter subscribers (admin)' })
  listSubscribers() {
    return this.storefront.listSubscribers();
  }

  @Get('storefront/flash-sale')
  @ApiOperation({ summary: 'Flash sale banner configuration (public)' })
  getFlashSale() {
    return this.storefront.getFlashSale();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('storefront/flash-sale')
  @ApiOperation({ summary: 'Configure the flash sale banner (admin)' })
  updateFlashSale(@Body() dto: UpdateFlashSaleDto) {
    return this.storefront.updateFlashSale(dto);
  }
}
