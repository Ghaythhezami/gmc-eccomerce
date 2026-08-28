import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List catalog products' })
  findAll() {
    return this.products.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one product' })
  findOne(@Param('id') id: string) {
    return this.products.findOne(id);
  }
}
