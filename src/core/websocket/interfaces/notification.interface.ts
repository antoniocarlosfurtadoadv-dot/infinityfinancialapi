export interface NotificationPayload {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface RoomInfo {
  userId?: string;
  companyId?: string;
  teamId?: string;
}
