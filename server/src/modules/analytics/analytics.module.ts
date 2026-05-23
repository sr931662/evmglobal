import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { LeadSchema } from '../leads/schemas/lead.schema';
import { QuoteSchema } from '../quotes/schemas/quote.schema';
import { PackageSchema } from '../packages/schemas/package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Lead',    schema: LeadSchema },
      { name: 'Quote',   schema: QuoteSchema },
      { name: 'Package', schema: PackageSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
