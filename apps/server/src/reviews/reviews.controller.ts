import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Paginated reviews for a product + average rating' })
  list(@Param('productId') productId: string, @Query() query: ListReviewsDto) {
    return this.reviews.listForProduct(productId, query.skip, query.take);
  }

  @Get('me/eligibility')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Whether the current user may review this product' })
  async eligibility(@Req() req: any, @Param('productId') productId: string) {
    return { eligible: await this.reviews.hasPurchased(req.user.id, productId) };
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create or update my review (purchase required)' })
  create(@Req() req: any, @Param('productId') productId: string, @Body() dto: CreateReviewDto) {
    return this.reviews.create(req.user.id, productId, dto);
  }
}
