import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WebSocketServer as WsServer } from 'ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));
  app.setGlobalPrefix('api/v1');

  await app.listen(3001);
  console.log(`SMSFlow API running on port 3001`);

  // Plain WebSocket server for Android device connections
  const httpServer = app.getHttpServer();
  const wss = new WsServer({ server: httpServer, path: '/ws/devices' });
  const { DevicesGateway } = await import('./gateway/ws.gateway');
  const devicesGateway = app.get(DevicesGateway);
  const { PrismaService } = await import('./prisma/prisma.service');
  const prisma = app.get(PrismaService);

  // deviceId -> ws
  const deviceSockets = new Map<string, import('ws').WebSocket>();

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token') ||
      req.headers['authorization']?.replace('Bearer ', '');
    const deviceId = url.searchParams.get('deviceId');

    if (!deviceId || !token) {
      ws.close(4001, 'Missing deviceId or token');
      return;
    }

    // Verify device exists
    try {
      const device = await prisma.device.findUnique({ where: { id: deviceId } });
      if (!device) { ws.close(4004, 'Device not found'); return; }

      await prisma.device.update({
        where: { id: deviceId },
        data: { status: 'ONLINE', lastSeenAt: new Date() },
      });
      deviceSockets.set(deviceId, ws);
      console.log(`[WS] Device connected: ${deviceId}`);

      ws.on('message', async (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === 'HEARTBEAT') {
            await prisma.device.update({
              where: { id: deviceId },
              data: {
                status: 'ONLINE',
                lastSeenAt: new Date(),
                batteryLevel: msg.payload?.batteryLevel,
                signalStrength: msg.payload?.signalStrength,
              },
            });
            ws.send(JSON.stringify({ type: 'PONG', id: msg.id, timestamp: Date.now() }));
          } else if (msg.type === 'STATUS_UPDATE' && msg.payload?.messageId) {
            const updateData: Record<string, unknown> = { status: msg.payload.status };
            if (msg.payload.status === 'SENT') updateData.sentAt = new Date();
            if (msg.payload.status === 'DELIVERED') updateData.deliveredAt = new Date();
            if (msg.payload.status === 'FAILED') {
              updateData.failedAt = new Date();
              updateData.errorCode = msg.payload.errorCode;
              updateData.errorMessage = msg.payload.errorMessage;
            }
            await prisma.message.update({ where: { id: msg.payload.messageId }, data: updateData as any });
          } else if (msg.type === 'SMS_RECEIVED' && msg.payload) {
            await prisma.message.create({
              data: {
                userId: device.userId,
                deviceId,
                phoneNumber: msg.payload.from,
                body: msg.payload.body,
                status: 'DELIVERED',
                direction: 'INBOUND',
                simSlot: msg.payload.simSlot,
                deliveredAt: new Date(),
              },
            });
          }
        } catch (e) {
          console.error('[WS] Message error:', e);
        }
      });

      ws.on('close', async () => {
        deviceSockets.delete(deviceId);
        try {
          await prisma.device.update({ where: { id: deviceId }, data: { status: 'OFFLINE' } });
        } catch {}
        console.log(`[WS] Device disconnected: ${deviceId}`);
      });

    } catch (e) {
      ws.close(4000, 'Server error');
    }
  });

  console.log(`Plain WebSocket for devices at ws://localhost:3001/ws/devices`);
}
bootstrap();
