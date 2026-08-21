import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ExportModule } from './modules/export/export.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { PackagesModule } from './modules/packages/packages.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { CareersModule } from './modules/careers/careers.module';
import { TeamModule } from './modules/team/team.module';
import { HomeContentModule } from './modules/home-content/home-content.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CustomerAuthModule } from './modules/customer-auth/customer-auth.module';
import { AdsModule } from './modules/ads/ads.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    CommonModule,
    DatabaseModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    LeadsModule,
    ExportModule,
    WhatsAppModule,
    PackagesModule,
    AnalyticsModule,
    SettingsModule,
    DestinationsModule,
    QuotesModule,
    BlogsModule,
    CareersModule,
    TeamModule,
    HomeContentModule,
    CustomersModule,
    CustomerAuthModule,
    AdsModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // enable rate limiting globally
    },
  ],
})
export class AppModule {}