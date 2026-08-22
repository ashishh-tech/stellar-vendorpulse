export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export type NotificationCategory =
  | 'vendor_event'
  | 'governance'
  | 'risk_alert'
  | 'system'
  | 'transaction';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: number;
  actionUrl?: string;
  metadata?: Record<string, any>;
}
