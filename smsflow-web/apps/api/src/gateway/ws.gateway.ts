import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

interface StatusUpdatePayload {
  messageId: string;
  status: string;
  errorCode?: string;
  errorMessage?: string;
  timestamp: string;
}

interface HeartbeatPayload {
  deviceId: string;
  batteryLevel?: number;
  signalStrength?: number;
}

interface SmsReceivedPayload {
  deviceId: string;
  from: string;
  body: string;
  simSlot?: number;
  receivedAt: string;
}

// /dashboard namespace — browser clients
@WebSocketGateway({
  namespace: '/dashboard',
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('DashboardGateway');

  handleConnection(client: Socket) {
    const userId = client.handshake.auth['userId'] as string;
    if (userId) {
      void client.join(`user:${userId}`);
      this.logger.log(`Dashboard client connected: ${client.id}, user: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Dashboard client disconnected: ${client.id}`);
  }

  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}

// /devices namespace — Android app connections
@WebSocketGateway({
  namespace: '/devices',
  cors: {
    origin: '*',
  },
})
export class DevicesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('DevicesGateway');

  // Map socket.id → deviceId
  private socketToDevice = new Map<string, string>();
  // Map deviceId → socket.id
  private deviceToSocket = new Map<string, string>();

  constructor(
    private prisma: PrismaService,
    private dashboardGateway: DashboardGateway,
  ) {}

  async handleConnection(client: Socket) {
    const deviceId = client.handshake.auth['deviceId'] as string;
    if (!deviceId) {
      client.disconnect();
      return;
    }

    this.socketToDevice.set(client.id, deviceId);
    this.deviceToSocket.set(deviceId, client.id);

    // Mark device ONLINE
    try {
      const device = await this.prisma.device.update({
        where: { id: deviceId },
        data: { status: 'ONLINE', lastSeenAt: new Date() },
      });

      this.dashboardGateway.emitToUser(device.userId, 'DEVICE_STATUS', {
        deviceId,
        status: 'ONLINE',
        lastSeenAt: new Date().toISOString(),
      });

      this.logger.log(`Device connected: ${deviceId}`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const deviceId = this.socketToDevice.get(client.id);
    if (!deviceId) return;

    this.socketToDevice.delete(client.id);
    this.deviceToSocket.delete(deviceId);

    try {
      const device = await this.prisma.device.update({
        where: { id: deviceId },
        data: { status: 'OFFLINE' },
      });

      this.dashboardGateway.emitToUser(device.userId, 'DEVICE_STATUS', {
        deviceId,
        status: 'OFFLINE',
        lastSeenAt: new Date().toISOString(),
      });

      this.logger.log(`Device disconnected: ${deviceId}`);
    } catch {
      // Device may have been deleted
    }
  }

  @SubscribeMessage('STATUS_UPDATE')
  async handleStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: StatusUpdatePayload,
  ) {
    const deviceId = this.socketToDevice.get(client.id);
    if (!deviceId) return;

    const updateData: Record<string, unknown> = {
      status: payload.status,
    };

    if (payload.status === 'SENT') updateData.sentAt = new Date(payload.timestamp);
    if (payload.status === 'DELIVERED') updateData.deliveredAt = new Date(payload.timestamp);
    if (payload.status === 'FAILED') {
      updateData.failedAt = new Date(payload.timestamp);
      updateData.errorCode = payload.errorCode;
      updateData.errorMessage = payload.errorMessage;
    }

    try {
      const message = await this.prisma.message.update({
        where: { id: payload.messageId },
        data: updateData as any,
      });

      this.dashboardGateway.emitToUser(message.userId, 'MESSAGE_UPDATE', {
        messageId: payload.messageId,
        status: payload.status,
        ...updateData,
      });
    } catch (err) {
      this.logger.error(`Failed to update message ${payload.messageId}: ${err}`);
    }
  }

  @SubscribeMessage('HEARTBEAT')
  async handleHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: HeartbeatPayload,
  ) {
    const deviceId = this.socketToDevice.get(client.id);
    if (!deviceId) return;

    try {
      const device = await this.prisma.device.update({
        where: { id: deviceId },
        data: {
          lastSeenAt: new Date(),
          batteryLevel: payload.batteryLevel,
          signalStrength: payload.signalStrength,
          status: 'ONLINE',
        },
      });

      this.dashboardGateway.emitToUser(device.userId, 'DEVICE_STATUS', {
        deviceId,
        status: 'ONLINE',
        batteryLevel: payload.batteryLevel,
        signalStrength: payload.signalStrength,
        lastSeenAt: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.error(`Heartbeat error for device ${deviceId}: ${err}`);
    }
  }

  @SubscribeMessage('SMS_RECEIVED')
  async handleSmsReceived(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SmsReceivedPayload,
  ) {
    const deviceId = this.socketToDevice.get(client.id);
    if (!deviceId) return;

    try {
      const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
      if (!device) return;

      const message = await this.prisma.message.create({
        data: {
          userId: device.userId,
          deviceId,
          phoneNumber: payload.from,
          body: payload.body,
          status: 'DELIVERED',
          direction: 'INBOUND',
          simSlot: payload.simSlot,
          deliveredAt: new Date(payload.receivedAt),
        },
      });

      this.dashboardGateway.emitToUser(device.userId, 'NEW_RECEIVED_SMS', {
        message,
      });
    } catch (err) {
      this.logger.error(`SMS_RECEIVED error: ${err}`);
    }
  }

  sendSmsToDevice(deviceId: string, messageData: unknown): boolean {
    const socketId = this.deviceToSocket.get(deviceId);
    if (!socketId) return false;

    this.server.to(socketId).emit('SEND_SMS', messageData);
    return true;
  }
}

// Module wrapper
import { Module } from '@nestjs/common';

@Module({
  providers: [DashboardGateway, DevicesGateway],
  exports: [DashboardGateway, DevicesGateway],
})
export class WsGatewayModule {}
