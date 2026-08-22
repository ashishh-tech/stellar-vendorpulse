import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppNotification, NotificationCategory } from './types';

interface NotificationStoreState {
  notifications: AppNotification[];
  isOpen: boolean;

  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  getUnreadCount: () => number;
  getByCategory: (category: NotificationCategory) => AppNotification[];
}

// Seed initial demo notifications
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ntf_1',
    title: 'Vendor Risk Alert',
    message: 'Starlight Cloud Systems risk score elevated to HIGH (62/100). Review recommended.',
    priority: 'high',
    category: 'risk_alert',
    isRead: false,
    createdAt: Date.now() - 1800000,
    actionUrl: '/risk',
  },
  {
    id: 'ntf_2',
    title: 'Multi-Sig Proposal Pending',
    message: 'MSP-002: Reputation threshold adjustment requires 1 more signature for quorum.',
    priority: 'medium',
    category: 'governance',
    isRead: false,
    createdAt: Date.now() - 3600000,
    actionUrl: '/advanced',
  },
  {
    id: 'ntf_3',
    title: 'New Vendor Registered',
    message: 'Apex Global Logistics has been registered as a Logistics & Shipping vendor.',
    priority: 'low',
    category: 'vendor_event',
    isRead: true,
    createdAt: Date.now() - 7200000,
    actionUrl: '/dashboard',
  },
  {
    id: 'ntf_4',
    title: 'Fee Sponsorship Active',
    message: 'Gasless transaction sponsorship is active. 3 transactions sponsored today.',
    priority: 'low',
    category: 'system',
    isRead: true,
    createdAt: Date.now() - 14400000,
    actionUrl: '/advanced',
  },
  {
    id: 'ntf_5',
    title: 'Review Submitted',
    message: 'Multi-axis review (92/100) submitted for Apex Global Logistics. Score updated on-chain.',
    priority: 'medium',
    category: 'transaction',
    isRead: false,
    createdAt: Date.now() - 5400000,
    actionUrl: '/timeline',
  },
];

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      isOpen: false,

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              createdAt: Date.now(),
              isRead: false,
            },
            ...state.notifications,
          ].slice(0, 50),
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      getUnreadCount: () => get().notifications.filter((n) => !n.isRead).length,

      getByCategory: (category) =>
        get().notifications.filter((n) => n.category === category),
    }),
    {
      name: 'vendorpulse-notifications',
    }
  )
);
