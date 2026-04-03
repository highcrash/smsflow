import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

const PLAN_CONFIGS: Record<string, { smsLimit: number; deviceLimit: number }> = {
  STARTER: { smsLimit: 500, deviceLimit: 1 },
  PRO: { smsLimit: 5000, deviceLimit: 3 },
  BUSINESS: { smsLimit: 25000, deviceLimit: 10 },
};

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger('StripeService');

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY', ''), {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(userId: string, planId: string, interval: 'monthly' | 'yearly' = 'monthly') {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const priceKey = `STRIPE_PRICE_${planId.toUpperCase()}`;
    const priceId = this.config.get(priceKey);

    if (!priceId) {
      throw new BadRequestException(`No price configured for plan: ${planId}`);
    }

    const appUrl = this.config.get('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');

    const session = await this.stripe.checkout.sessions.create({
      customer: subscription.stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/billing?success=true&plan=${planId}`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      metadata: { userId, planId },
      subscription_data: {
        metadata: { userId, planId },
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  async createPortalSession(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const appUrl = this.config.get('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');

    const session = await this.stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    return { url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET', '');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err}`);
    }

    this.logger.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handlePaymentSucceeded(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handlePaymentFailed(invoice);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(sub);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(sub);
        break;
      }
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { userId, planId } = session.metadata || {};
    if (!userId || !planId) return;

    const planConfig = PLAN_CONFIGS[planId];
    if (!planConfig) return;

    const stripeSubId = session.subscription as string;
    const stripeSub = await this.stripe.subscriptions.retrieve(stripeSubId);

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        stripeSubscriptionId: stripeSubId,
        planId,
        status: 'ACTIVE',
        smsLimit: planConfig.smsLimit,
        deviceLimit: planConfig.deviceLimit,
        smsUsedThisPeriod: 0,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      },
    });
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!subscription) return;

    // Record invoice
    await this.prisma.invoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      create: {
        subscriptionId: subscription.id,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'paid',
        invoiceUrl: invoice.hosted_invoice_url || undefined,
        paidAt: new Date(),
      },
      update: {
        status: 'paid',
        paidAt: new Date(),
      },
    });

    // Reset SMS usage on period renewal
    if (invoice.billing_reason === 'subscription_cycle') {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          smsUsedThisPeriod: 0,
        },
      });
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    await this.prisma.subscription.updateMany({
      where: { stripeCustomerId: customerId },
      data: { status: 'PAST_DUE' },
    });
  }

  private async handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: stripeSub.id },
      data: { status: 'CANCELED', stripeSubscriptionId: null },
    });
  }

  private async handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSub.id },
    });

    if (!sub) return;

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
    });
  }
}
