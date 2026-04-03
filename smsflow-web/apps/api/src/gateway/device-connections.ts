import { Injectable } from '@nestjs/common';
import type { WebSocket } from 'ws';

@Injectable()
export class DeviceConnectionManager {
  // deviceId -> WebSocket (plain ws connections from Android)
  private connections = new Map<string, WebSocket>();

  register(deviceId: string, ws: WebSocket) {
    this.connections.set(deviceId, ws);
  }

  unregister(deviceId: string) {
    this.connections.delete(deviceId);
  }

  sendToDevice(deviceId: string, data: unknown): boolean {
    const ws = this.connections.get(deviceId);
    if (!ws || ws.readyState !== 1) return false;
    ws.send(JSON.stringify(data));
    return true;
  }

  isConnected(deviceId: string): boolean {
    const ws = this.connections.get(deviceId);
    return !!ws && ws.readyState === 1;
  }
}
