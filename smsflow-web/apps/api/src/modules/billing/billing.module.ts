import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { BillingController } from './billing.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [StripeService],
  controllers: [BillingController],
  exports: [StripeService],
})
export class BillingModule {}
