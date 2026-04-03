import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

export const WEBHOOK_EVENTS = [
  'message.sent',
  'message.delivered',
  'message.failed',
  'message.received',
  'device.online',
  'device.offline',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.webhook.findMany({
      where: { userId },
      include: {
        _count: { select: { logs: true } },
        logs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, url: string, events: string[]) {
    const secret = crypto.randomBytes(24).toString('hex');
    return this.prisma.webhook.create({
      data: { userId, url, secret, events },
    });
  }

  async get(userId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, userId } });
    if (!webhook) throw new NotFoundException('Webhook not found');
    return webhook;
  }

  async update(userId: string, id: string, data: { url?: string; events?: string[]; isActive?: boolean }) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, userId } });
    if (!webhook) throw new NotFoundException('Webhook not found');
    return this.prisma.webhook.update({ where: { id }, data });
  }

  async delete(userId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, userId } });
    if (!webhook) throw new NotFoundException('Webhook not found');
    await this.prisma.webhook.delete({ where: { id } });
    return { message: 'Webhook deleted' };
  }

  async regenerateSecret(userId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, userId } });
    if (!webhook) throw new NotFoundException('Webhook not found');
    const secret = crypto.randomBytes(24).toString('hex');
    await this.prisma.webhook.update({ where: { id }, data: { secret } });
    return { secret };
  }

  async getLogs(userId: string, webhookId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const webhook = await this.prisma.webhook.findFirst({ where: { id: webhookId, userId } });
    if (!webhook) throw new NotFoundException('Webhook not found');

    const [logs, total] = await Promise.all([
      this.prisma.webhookLog.findMany({
        where: { webhookId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.webhookLog.count({ where: { webhookId } }),
    ]);

    return { data: logs, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async testDelivery(userId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, userId } });
    if (!webhook) throw new NotFoundException('Webhook not found');

    const payload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook delivery from SMSFlow.' },
    };

    const result = await this.deliverWebhook(webhook, 'test', payload);
    return result;
  }

  async deliverToUser(userId: string, event: string, data: unknown) {
    const webhooks = await this.prisma.webhook.findMany({
      where: { userId, isActive: true, events: { has: event } },
    });

    await Promise.allSettled(
      webhooks.map((wh) => this.deliverWebhook(wh, event, data)),
    );
  }

  private signPayload(secret: string, body: string): string {
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
  }

  private async deliverWebhook(
    webhook: { id: string; url: string; secret: string; userId: string },
    event: string,
    data: unknown,
  ) {
    const payload = JSON.stringify({ event, timestamp: new Date().toISOString(), data });
    const signature = this.signPayload(webhook.secret, payload);

    let statusCode: number | null = null;
    let response: string | null = null;
    let success = false;

    try {
      const res = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SMSFlow-Signature': `sha256=${signature}`,
          'X-SMSFlow-Event': event,
        },
        body: payload,
        signal: AbortSignal.timeout(10000),
      });
      statusCode = res.status;
      response = await res.text().catch(() => null);
      success = res.ok;
    } catch (e: any) {
      response = e.message;
    }

    await this.prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        userId: webhook.userId,
        event,
        payload: data as any,
        statusCode,
        response,
        success,
      },
    });

    return { success, statusCode };
  }
}
