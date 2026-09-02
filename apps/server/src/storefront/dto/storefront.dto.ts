import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

/** Normalise before validating, so " Player@Example.com " is accepted. */
const normaliseEmail = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));

export class SubscribeNewsletterDto {
  @ApiProperty({ example: 'player@example.com' })
  @normaliseEmail()
  @IsEmail({}, { message: 'Enter a valid email address' })
  email!: string;

  @ApiPropertyOptional({ description: 'Where the sign-up came from', example: 'home-footer' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  source?: string;
}

export class UnsubscribeNewsletterDto {
  @ApiProperty()
  @normaliseEmail()
  @IsEmail()
  email!: string;
}

export class UpdateFlashSaleDto {
  @ApiProperty({ description: 'Show the flash sale strip on the storefront' })
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({ example: 'Flash Sale' })
  @IsString()
  @MaxLength(60)
  headline!: string;

  @ApiPropertyOptional({ description: 'ISO timestamp the countdown runs down to' })
  @IsOptional()
  @IsISO8601()
  endsAt?: string;
}
