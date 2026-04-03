import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        subscription: {
          select: {
            planId: true,
            status: true,
            smsUsedThisPeriod: true,
            trialEndsAt: true,
            currentPeriodEnd: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
      },
    });
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Account deleted' };
  }

  async getTeamMembers(userId: string) {
    return this.prisma.teamMember.findMany({
      where: { ownerId: userId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { invitedAt: 'desc' },
    });
  }

  async inviteTeamMember(userId: string, email: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') {
    return this.prisma.teamMember.upsert({
      where: { ownerId_email: { ownerId: userId, email } },
      create: { ownerId: userId, email, role, status: 'PENDING' },
      update: { role },
    });
  }

  async removeTeamMember(userId: string, memberId: string) {
    const member = await this.prisma.teamMember.findFirst({
      where: { id: memberId, ownerId: userId },
    });
    if (!member) throw new NotFoundException('Team member not found');
    await this.prisma.teamMember.delete({ where: { id: memberId } });
    return { message: 'Team member removed' };
  }
}
