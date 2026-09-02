import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class SubscriptionKeysDto {
  @ApiProperty()
  @IsString()
  p256dh!: string;

  @ApiProperty()
  @IsString()
  auth!: string;
}

export class SubscribeDto {
  @ApiProperty({ description: 'Push service endpoint returned by the browser' })
  @IsString()
  endpoint!: string;

  @ApiProperty({ type: SubscriptionKeysDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SubscriptionKeysDto)
  keys!: SubscriptionKeysDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class UnsubscribeDto {
  @ApiProperty()
  @IsString()
  endpoint!: string;
}

export class BroadcastDto {
  @ApiProperty({ example: 'Flash sale live now' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Up to 50% off across the catalog for the next 4 hours.' })
  @IsString()
  message!: string;

  @ApiPropertyOptional({ description: 'Where the notification click should land', example: '/products' })
  @IsOptional()
  @IsString()
  url?: string;
}
