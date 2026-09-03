import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeNewsletterDto, UpdateFlashSaleDto } from './dto/storefront.dto';

const FLASH_SALE_KEY = 'flashSale';

export interface FlashSaleConfig {
  enabled: boolean;
  headline: string;
  endsAt: string | null;
}

const DEFAULT_FLASH_SALE: FlashSaleConfig = { enabled: true, headline: 'Flash Sale', endsAt: null };

@Injectable()
export class StorefrontService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Newsletter -----------------------------------------------------------

  /**
   * Idempotent by design: signing up twice is a no-op, and signing up after
   * unsubscribing clears the unsubscribe stamp instead of erroring.
   */
  async subscribe(dto: SubscribeNewsletterDto) {
    const email = dto.email.trim().toLowerCase();
    await this.prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, source: dto.source },
      update: { unsubscribedAt: null },
    });
    return { email, subscribed: true };
  }

  async unsubscribe(email: string) {
    const normalised = email.trim().toLowerCase();
    const { count } = await this.prisma.newsletterSubscriber.updateMany({
      where: { email: normalised, unsubscribedAt: null },
      data: { unsubscribedAt: new Date() },
    });
    return { email: normalised, unsubscribed: count > 0 };
  }

  async listSubscribers() {
    const [subscribers, active] = await this.prisma.$transaction([
      this.prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
      this.prisma.newsletterSubscriber.count({ where: { unsubscribedAt: null } }),
    ]);
    return { subscribers, active, total: subscribers.length };
  }

  // ---- Flash sale -----------------------------------------------------------

  async getFlashSale(): Promise<FlashSaleConfig> {
    const row = await this.prisma.setting.findUnique({ where: { key: FLASH_SALE_KEY } });
    if (!row) return DEFAULT_FLASH_SALE;
    try {
      return { ...DEFAULT_FLASH_SALE, ...(JSON.parse(row.value) as Partial<FlashSaleConfig>) };
    } catch {
      // A malformed setting must not take the storefront down.
      return DEFAULT_FLASH_SALE;
    }
  }

  async updateFlashSale(dto: UpdateFlashSaleDto): Promise<FlashSaleConfig> {
    const config: FlashSaleConfig = {
      enabled: dto.enabled,
      headline: dto.headline,
      endsAt: dto.endsAt ?? null,
    };
    const value = JSON.stringify(config);
    await this.prisma.setting.upsert({
      where: { key: FLASH_SALE_KEY },
      create: { key: FLASH_SALE_KEY, value },
      update: { value },
    });
    return config;
  }
}
