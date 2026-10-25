import { create } from "zustand";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
  appId?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  toasts: NotificationItem[];
  isCenterOpen: boolean;
  unreadCount: number;
  notify: (payload: {
    title: string;
    message: string;
    type?: NotificationType;
    appId?: string;
    duration?: number;
  }) => void;
  dismissToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  toggleCenter: () => void;
  setCenterOpen: (open: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: "welcome-notif",
      title: "Welcome to Dawvix OS",
      message: "Dawvix OS is ready. Press Ctrl+Space anytime to launch apps or find files.",
      type: "info",
      timestamp: Date.now() - 60000,
      read: false,
    },
  ],
  toasts: [],
  isCenterOpen: false,
  unreadCount: 1,

  notify: ({ title, message, type = "info", appId, duration = 4000 }) => {
    const newItem: NotificationItem = {
      id: "notif-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false,
      appId,
    };

    set((state) => ({
      notifications: [newItem, ...state.notifications].slice(0, 50),
      toasts: [newItem, ...state.toasts].slice(0, 5),
      unreadCount: state.unreadCount + 1,
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().dismissToast(newItem.id);
      }, duration);
    }
  },

  dismissToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  markAsRead: (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unread = updated.filter((n) => !n.read).length;
      return { notifications: updated, unreadCount: unread };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearNotification: (id: string) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      const unread = updated.filter((n) => !n.read).length;
      return {
        notifications: updated,
        toasts: state.toasts.filter((t) => t.id !== id),
        unreadCount: unread,
      };
    });
  },

  clearAll: () => {
    set({
      notifications: [],
      toasts: [],
      unreadCount: 0,
    });
  },

  toggleCenter: () => {
    const nextState = !get().isCenterOpen;
    if (nextState) {
      get().markAllAsRead();
    }
    set({ isCenterOpen: nextState });
  },

  setCenterOpen: (open: boolean) => {
    if (open) {
      get().markAllAsRead();
    }
    set({ isCenterOpen: open });
  },
}));
