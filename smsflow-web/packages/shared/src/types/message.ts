export type MessageStatus = 'PENDING' | 'QUEUED' | 'DISPATCHED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'EXPIRED';
export type MessageDirection = 'INBOUND' | 'OUTBOUND';

export interface Message {
  id: string;
  userId: string;
  deviceId?: string;
  phoneNumber: string;
  body: string;
  status: MessageStatus;
  direction: MessageDirection;
  simSlot?: number;
  templateId?: string;
  bulkBatchId?: string;
  errorCode?: string;
  errorMessage?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
