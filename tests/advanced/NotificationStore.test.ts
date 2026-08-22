import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '@/features/notifications/store';

describe('NotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.getState().clearAll();
  });

  it('adds notifications and tracks unread count accurately', () => {
    const store = useNotificationStore.getState();

    store.addNotification({
      title: 'Risk Spike',
      message: 'Vendor score fell below threshold',
      priority: 'high',
      category: 'risk_alert',
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(1);
    expect(useNotificationStore.getState().getUnreadCount()).toBe(1);
  });

  it('marks single notification as read', () => {
    const store = useNotificationStore.getState();

    store.addNotification({
      title: 'Governance Proposal',
      message: 'New multisig vote required',
      priority: 'medium',
      category: 'governance',
    });

    const notifId = useNotificationStore.getState().notifications[0].id;
    useNotificationStore.getState().markAsRead(notifId);

    expect(useNotificationStore.getState().getUnreadCount()).toBe(0);
    expect(useNotificationStore.getState().notifications[0].isRead).toBe(true);
  });

  it('marks all notifications as read', () => {
    const store = useNotificationStore.getState();

    store.addNotification({
      title: 'Alert 1',
      message: 'Message 1',
      priority: 'low',
      category: 'system',
    });
    store.addNotification({
      title: 'Alert 2',
      message: 'Message 2',
      priority: 'high',
      category: 'risk_alert',
    });

    expect(useNotificationStore.getState().getUnreadCount()).toBe(2);
    useNotificationStore.getState().markAllAsRead();
    expect(useNotificationStore.getState().getUnreadCount()).toBe(0);
  });

  it('filters notifications by category', () => {
    const store = useNotificationStore.getState();

    store.addNotification({
      title: 'Risk Alert',
      message: 'Vendor critical',
      priority: 'critical',
      category: 'risk_alert',
    });
    store.addNotification({
      title: 'Gov Alert',
      message: 'Proposal created',
      priority: 'medium',
      category: 'governance',
    });

    const riskNotifs = useNotificationStore.getState().getByCategory('risk_alert');
    expect(riskNotifs).toHaveLength(1);
    expect(riskNotifs[0].title).toBe('Risk Alert');
  });
});
