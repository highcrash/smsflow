import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  RawBodyRequest,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateCheckoutDto {
  @ApiProperty({ example: 'PRO' }) @IsString() @IsIn(['STARTER', 'PRO', 'BUSINESS']) planId: string;
  @ApiPropertyOptional({ example: 'monthly' }) @IsOptional() @IsString() interval?: 'monthly' | 'yearly';
}

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a Stripe Checkout session to upgrade plan' })
  async createCheckout(@Request() req: any, @Body() dto: CreateCheckoutDto) {
    return this.stripeService.createCheckoutSession(req.user.id, dto.planId, dto.interval);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a Stripe Billing Portal session to manage subscription' })
  async createPortal(@Request() req: any) {
    return this.stripeService.createPortalSession(req.user.id);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook endpoint (raw body required)' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody as Buffer;
    return this.stripeService.handleWebhook(rawBody, signature);
  }
}
