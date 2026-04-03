import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const [sentToday, totalMessages, delivered, failed, activeDevices, subscription] =
      await Promise.all([
        this.prisma.message.count({
          where: { userId, direction: 'OUTBOUND', createdAt: { gte: startOfToday, lte: endOfToday } },
        }),
        this.prisma.message.count({ where: { userId, direction: 'OUTBOUND' } }),
        this.prisma.message.count({
          where: { userId, direction: 'OUTBOUND', status: 'DELIVERED', createdAt: { gte: startOfToday } },
        }),
        this.prisma.message.count({
          where: { userId, direction: 'OUTBOUND', status: 'FAILED', createdAt: { gte: startOfToday } },
        }),
        this.prisma.device.count({ where: { userId, status: 'ONLINE', isEnabled: true } }),
        this.prisma.subscription.findUnique({ where: { userId } }),
      ]);

    const deliveryRate = sentToday > 0 ? Math.round((delivered / sentToday) * 100) : 0;

    return {
      sentToday,
      totalMessages,
      deliveryRate,
      failedToday: failed,
      activeDevices,
      smsBalance: subscription
        ? subscription.smsLimit - subscription.smsUsedThisPeriod
        : 0,
      smsUsed: subscription?.smsUsedThisPeriod || 0,
      smsLimit: subscription?.smsLimit || 0,
    };
  }

  async getMessageChart(userId: string, days = 7) {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const start = startOfDay(date);
      const end = endOfDay(date);

      const [sent, delivered, failed] = await Promise.all([
        this.prisma.message.count({
          where: { userId, direction: 'OUTBOUND', createdAt: { gte: start, lte: end } },
        }),
        this.prisma.message.count({
          where: { userId, direction: 'OUTBOUND', status: 'DELIVERED', createdAt: { gte: start, lte: end } },
        }),
        this.prisma.message.count({
          where: { userId, direction: 'OUTBOUND', status: 'FAILED', createdAt: { gte: start, lte: end } },
        }),
      ]);

      data.push({
        date: format(date, 'MMM dd'),
        sent,
        delivered,
        failed,
      });
    }
    return data;
  }
}
