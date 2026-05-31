import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { CustomersModule } from '../customers/customers.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { QuotesModule } from '../quotes/quotes.module';

@Module({
  imports: [
    PassportModule,
    AuthModule,
    CustomersModule,
    EmailModule,
    QuotesModule,
  ],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, CustomerJwtStrategy],
})
export class CustomerAuthModule {}
