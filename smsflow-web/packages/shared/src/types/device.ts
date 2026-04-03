export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'PAIRING' | 'ERROR';

export interface Device {
  id: string;
  userId: string;
  name: string;
  model?: string;
  osVersion?: string;
  appVersion?: string;
  simCount: number;
  status: DeviceStatus;
  batteryLevel?: number;
  signalStrength?: number;
  lastSeenAt?: Date;
  isEnabled: boolean;
  createdAt: Date;
}
