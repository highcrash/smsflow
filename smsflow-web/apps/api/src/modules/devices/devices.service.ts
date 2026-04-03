import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

interface CompletePairingDto {
  token: string;
  device: {
    name: string;
    model: string;
    manufacturer?: string;
    osVersion: string;
    appVersion: string;
    simCount: number;
    sims?: any[];
    fcmToken?: string;
  };
}

interface HeartbeatDto {
  batteryLevel?: number;
  signalStrength?: number;
}

@Injectable()
export class DevicesService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async generatePairingQr(userId: string) {
    // Check device limit based on subscription
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const deviceCount = await this.prisma.device.count({
      where: { userId, isEnabled: true, status: { not: 'PAIRING' } },
    });

    if (subscription && deviceCount >= subscription.deviceLimit) {
      throw new ForbiddenException(
        `Your plan allows a maximum of ${subscription.deviceLimit} device(s). Please upgrade to add more.`,
      );
    }

    const pairingToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const device = await this.prisma.device.create({
      data: {
        userId,
        name: 'Unnamed Device',
        model: 'Unknown',
        osVersion: 'Unknown',
        pairingToken,
        status: 'PAIRING',
      },
    });

    const apiUrl = this.config.get('NEXT_PUBLIC_API_URL', 'http://localhost:3001');

    return {
      deviceId: device.id,
      qrData: {
        v: 1,
        t: pairingToken,
        u: apiUrl,
        e: Math.floor(expiresAt.getTime() / 1000),
      },
    };
  }

  async completePairing(dto: CompletePairingDto) {
    const device = await this.prisma.device.findUnique({
      where: { pairingToken: dto.token },
    });

    if (!device) {
      throw new NotFoundException('Invalid or expired pairing token');
    }

    if (device.status !== 'PAIRING') {
      throw new BadRequestException('This device has already been paired');
    }

    // Generate device-specific access and refresh tokens
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const encryptionKey = crypto.randomBytes(32).toString('hex');

    const accessTokenHash = await bcrypt.hash(accessToken, 10);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const updatedDevice = await this.prisma.device.update({
      where: { id: device.id },
      data: {
        name: dto.device.name,
        model: dto.device.model,
        manufacturer: dto.device.manufacturer,
        osVersion: dto.device.osVersion,
        appVersion: dto.device.appVersion,
        simCount: dto.device.simCount,
        simDetails: dto.device.sims as any,
        fcmToken: dto.device.fcmToken,
        accessTokenHash,
        refreshTokenHash,
        encryptionKey,
        status: 'ONLINE',
        lastSeenAt: new Date(),
      },
    });

    const baseWs = (this.config.get('NEXT_PUBLIC_API_URL') || 'http://localhost:3001')
      .replace('http://', 'ws://').replace('https://', 'wss://');
    const wsUrl = `${baseWs}/ws/devices?deviceId=${updatedDevice.id}&token=${accessToken}`;

    return {
      deviceId: updatedDevice.id,
      accessToken,
      refreshToken,
      encryptionKey,
      wsUrl,
      expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
    };
  }

  async listDevices(userId: string) {
    return this.prisma.device.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        model: true,
        osVersion: true,
        appVersion: true,
        simCount: true,
        simDetails: true,
        status: true,
        lastSeenAt: true,
        batteryLevel: true,
        signalStrength: true,
        isEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getDevice(userId: string, deviceId: string) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, userId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  async updateDevice(userId: string, deviceId: string, data: { name?: string; isEnabled?: boolean }) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, userId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return this.prisma.device.update({
      where: { id: deviceId },
      data,
    });
  }

  async deleteDevice(userId: string, deviceId: string) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, userId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    await this.prisma.device.delete({ where: { id: deviceId } });
    return { message: 'Device removed successfully' };
  }

  async updateHeartbeat(deviceId: string, data: HeartbeatDto) {
    await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        lastSeenAt: new Date(),
        batteryLevel: data.batteryLevel,
        signalStrength: data.signalStrength,
        status: 'ONLINE',
      },
    });
  }

  async setDeviceOffline(deviceId: string) {
    await this.prisma.device.update({
      where: { id: deviceId },
      data: { status: 'OFFLINE' },
    });
  }
}
