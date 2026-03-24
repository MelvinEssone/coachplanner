"use client";

import { create } from "zustand";
import { Notification } from "@/types";
import { notificationsApi } from "@/lib/api";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotifications = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const response = await notificationsApi.getAll({ limit: 20 });
      set({
        notifications: response.data.data,
        unreadCount: response.data.unreadCount,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (id: string) => {
    await notificationsApi.markRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, lu: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await notificationsApi.markAllRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, lu: true })),
      unreadCount: 0,
    }));
  },
}));
