export type WsMessageType =
  | 'SEND_SMS' | 'STATUS_UPDATE' | 'HEARTBEAT' | 'SMS_RECEIVED'
  | 'PING' | 'PONG' | 'CONFIG_UPDATE'
  | 'DEVICE_STATUS' | 'MESSAGE_UPDATE' | 'NEW_RECEIVED_SMS' | 'STATS_UPDATE';

export interface WsEnvelope<T = unknown> {
  id: string;
  type: WsMessageType;
  timestamp: number;
  payload: T;
}

export interface SendSmsPayload {
  messageId: string;
  phoneNumber: string;
  body: string;
  simSlot?: number;
}

export interface StatusUpdatePayload {
  messageId: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  errorCode?: string;
  sentAt?: number;
  deliveredAt?: number;
}

export interface HeartbeatPayload {
  battery: number;
  signal: number;
  queueDepth: number;
  uptime: number;
}
