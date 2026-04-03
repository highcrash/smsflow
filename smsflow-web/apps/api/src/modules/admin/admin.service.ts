import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private assertAdmin(role: string) {
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  async getStats(requesterRole: string) {
    this.assertAdmin(requesterRole);

    const [totalUsers, activeSubscriptions, totalMessages, totalDevices] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.message.count(),
      this.prisma.device.count({ where: { status: 'ONLINE' } }),
    ]);

    return { totalUsers, activeSubscriptions, totalMessages, totalDevices };
  }

  async listUsers(requesterRole: string, page = 1, limit = 20) {
    this.assertAdmin(requesterRole);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { subscription: { select: { status: true, planId: true } } },
      }),
      this.prisma.user.count(),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
