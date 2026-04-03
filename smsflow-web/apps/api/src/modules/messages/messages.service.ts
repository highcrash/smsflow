import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DevicesGateway } from '../../gateway/ws.gateway';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: '+12125551234' }) @IsString() phoneNumber: string;
  @ApiProperty({ example: 'Hello from SMSFlow!' }) @IsString() body: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deviceId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() simSlot?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() templateId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() scheduledAt?: string;
}

export class SendBulkDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() recipients: { phoneNumber: string; variables?: Record<string, string> }[];
  @ApiPropertyOptional() @IsOptional() @IsString() body?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() templateId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deviceId?: string;
}

export interface MessageFilters {
  status?: string;
  direction?: string;
  deviceId?: string;
  from?: Date;
  to?: Date;
  search?: string;
}

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private wsGateway: DevicesGateway,
  ) {}

  async sendMessage(userId: string, dto: SendMessageDto) {
    // Check SMS limit
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (subscription && subscription.smsUsedThisPeriod >= subscription.smsLimit) {
      throw new ForbiddenException(
        `You have reached your monthly SMS limit of ${subscription.smsLimit}. Please upgrade your plan.`,
      );
    }

    // Find available device
    let deviceId = dto.deviceId;
    if (!deviceId) {
      const device = await this.prisma.device.findFirst({
        where: { userId, status: 'ONLINE', isEnabled: true },
        orderBy: { lastSeenAt: 'desc' },
      });

      if (!device) {
        throw new BadRequestException('No online device available. Please connect a device.');
      }
      deviceId = device.id;
    } else {
      const device = await this.prisma.device.findFirst({
        where: { id: deviceId, userId, isEnabled: true },
      });

      if (!device) {
        throw new NotFoundException('Device not found');
      }
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        userId,
        deviceId,
        phoneNumber: dto.phoneNumber,
        body: dto.body,
        status: 'PENDING',
        direction: 'OUTBOUND',
        simSlot: dto.simSlot,
        templateId: dto.templateId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });

    // If scheduled, return immediately
    if (dto.scheduledAt && new Date(dto.scheduledAt) > new Date()) {
      return message;
    }

    // Dispatch via WebSocket
    const dispatched = this.wsGateway.sendSmsToDevice(deviceId, {
      messageId: message.id,
      to: dto.phoneNumber,
      body: dto.body,
      simSlot: dto.simSlot,
    });

    // Update status
    const updatedMessage = await this.prisma.message.update({
      where: { id: message.id },
      data: {
        status: dispatched ? 'DISPATCHED' : 'QUEUED',
      },
    });

    // Increment SMS counter
    await this.prisma.subscription.update({
      where: { userId },
      data: { smsUsedThisPeriod: { increment: 1 } },
    });

    return updatedMessage;
  }

  async sendBulk(userId: string, dto: SendBulkDto) {
    // Check SMS limit
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const remaining = subscription
      ? subscription.smsLimit - subscription.smsUsedThisPeriod
      : 0;

    if (dto.recipients.length > remaining) {
      throw new ForbiddenException(
        `Bulk send would exceed your monthly SMS limit. You have ${remaining} SMS remaining.`,
      );
    }

    // Create batch
    const batch = await this.prisma.bulkBatch.create({
      data: {
        userId,
        name: dto.name,
        totalCount: dto.recipients.length,
        templateId: dto.templateId,
        status: 'PENDING',
      },
    });

    // Create all messages
    const messages = await this.prisma.message.createMany({
      data: dto.recipients.map((r) => ({
        userId,
        deviceId: dto.deviceId,
        phoneNumber: r.phoneNumber,
        body: dto.body || '',
        status: 'QUEUED' as const,
        direction: 'OUTBOUND' as const,
        templateId: dto.templateId,
        bulkBatchId: batch.id,
        metadata: r.variables ? { variables: r.variables } : undefined,
      })),
    });

    // Update batch status
    await this.prisma.bulkBatch.update({
      where: { id: batch.id },
      data: { status: 'PROCESSING' },
    });

    return {
      batchId: batch.id,
      totalCount: dto.recipients.length,
      status: 'PROCESSING',
    };
  }

  async listMessages(
    userId: string,
    filters: MessageFilters,
    pagination: { page: number; limit: number },
  ) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (filters.status) where.status = filters.status;
    if (filters.direction) where.direction = filters.direction;
    if (filters.deviceId) where.deviceId = filters.deviceId;
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }
    if (filters.search) {
      where.OR = [
        { phoneNumber: { contains: filters.search } },
        { body: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { device: { select: { name: true, model: true } } },
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, userId },
      include: { device: { select: { name: true, model: true } } },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }
}
