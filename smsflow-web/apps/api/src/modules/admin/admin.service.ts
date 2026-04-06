import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private assertAdmin(role: string) {
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  // ─── Stats ───────────────────────────────────────────────

  async getStats(requesterRole: string) {
    this.assertAdmin(requesterRole);

    const [totalUsers, activeSubscriptions, totalMessages, totalDevices, onlineDevices, trialUsers] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        this.prisma.message.count(),
        this.prisma.device.count(),
        this.prisma.device.count({ where: { status: 'ONLINE' } }),
        this.prisma.subscription.count({ where: { status: 'TRIAL' } }),
      ]);

    return { totalUsers, activeSubscriptions, totalMessages, totalDevices, onlineDevices, trialUsers };
  }

  // ─── Users ───────────────────────────────────────────────

  async listUsers(requesterRole: string, page = 1, limit = 20, search?: string) {
    this.assertAdmin(requesterRole);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          subscription: {
            select: {
              status: true,
              planId: true,
              smsLimit: true,
              smsUsedThisPeriod: true,
              deviceLimit: true,
              trialEndsAt: true,
            },
          },
          _count: { select: { devices: true, messages: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getUser(requesterRole: string, userId: string) {
    this.assertAdmin(requesterRole);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        subscription: true,
        _count: { select: { devices: true, messages: true, contacts: true, templates: true, apiKeys: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserRole(requesterRole: string, userId: string, role: string) {
    this.assertAdmin(requesterRole);

    if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async updateUserSubscription(
    requesterRole: string,
    userId: string,
    dto: { planId?: string; status?: string; smsLimit?: number; deviceLimit?: number },
  ) {
    this.assertAdmin(requesterRole);

    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new NotFoundException('Subscription not found');

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        ...(dto.planId && { planId: dto.planId }),
        ...(dto.status && { status: dto.status as any }),
        ...(dto.smsLimit !== undefined && { smsLimit: dto.smsLimit }),
        ...(dto.deviceLimit !== undefined && { deviceLimit: dto.deviceLimit }),
      },
    });
  }

  async deleteUser(requesterRole: string, userId: string) {
    this.assertAdmin(requesterRole);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'SUPER_ADMIN') throw new ForbiddenException('Cannot delete a super admin');

    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'User deleted' };
  }

  // ─── Impersonation ──────────────────────────────────────

  async impersonate(requesterRole: string, targetUserId: string) {
    this.assertAdmin(requesterRole);

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, emailVerified: true },
    });

    if (!targetUser) throw new NotFoundException('User not found');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: targetUser.id, type: 'access', impersonated: true },
        { secret: this.config.get('JWT_SECRET'), expiresIn: '1h' },
      ),
      this.jwtService.signAsync(
        { sub: targetUser.id, type: 'refresh' },
        { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: '1h' },
      ),
    ]);

    return { accessToken, refreshToken, user: targetUser };
  }

  // ─── Plans ──────────────────────────────────────────────

  async listPlans(requesterRole: string) {
    this.assertAdmin(requesterRole);
    return this.prisma.plan.findMany({ orderBy: { price: 'asc' } });
  }

  async createPlan(requesterRole: string, dto: {
    id: string;
    name: string;
    stripePriceId: string;
    price: number;
    interval?: string;
    smsLimit: number;
    deviceLimit: number;
    contactLimit: number;
    templateLimit: number;
    webhookLimit: number;
    teamLimit: number;
    features: any;
  }) {
    this.assertAdmin(requesterRole);

    return this.prisma.plan.create({
      data: {
        id: dto.id,
        name: dto.name,
        stripePriceId: dto.stripePriceId,
        price: dto.price,
        interval: dto.interval || 'month',
        smsLimit: dto.smsLimit,
        deviceLimit: dto.deviceLimit,
        contactLimit: dto.contactLimit,
        templateLimit: dto.templateLimit,
        webhookLimit: dto.webhookLimit,
        teamLimit: dto.teamLimit,
        features: dto.features || {},
      },
    });
  }

  async updatePlan(requesterRole: string, planId: string, dto: {
    name?: string;
    stripePriceId?: string;
    price?: number;
    interval?: string;
    smsLimit?: number;
    deviceLimit?: number;
    contactLimit?: number;
    templateLimit?: number;
    webhookLimit?: number;
    teamLimit?: number;
    features?: any;
    isActive?: boolean;
  }) {
    this.assertAdmin(requesterRole);

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    return this.prisma.plan.update({
      where: { id: planId },
      data: dto,
    });
  }

  async deletePlan(requesterRole: string, planId: string) {
    this.assertAdmin(requesterRole);

    const subCount = await this.prisma.subscription.count({ where: { planId } });
    if (subCount > 0) {
      throw new BadRequestException(`Cannot delete plan with ${subCount} active subscriptions. Deactivate it instead.`);
    }

    await this.prisma.plan.delete({ where: { id: planId } });
    return { message: 'Plan deleted' };
  }
}
