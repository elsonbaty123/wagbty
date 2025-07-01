
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { Notification } from '@/lib/types';
import * as db from '@/lib/db';

interface NotificationContextType {
  notifications: Notification[];
  notificationsForUser: (userId: string) => Notification[];
  createNotification: (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  unreadCount: (userId: string) => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshNotifications = async () => {
    const freshNotifications = await db.getNotifications();
    setNotifications(freshNotifications);
  }

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      await refreshNotifications();
      setLoading(false);
    };
    loadNotifications();
  }, []);

  const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    await db.createNotification(notificationData);
    await refreshNotifications();
  };
  
  const notificationsForUser = (userId: string) => {
    return notifications
      .filter(n => n.recipientId === userId)
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  const unreadCount = (userId: string) => {
    return notifications.filter(n => n.recipientId === userId && !n.isRead).length;
  }

  const markAsRead = async (notificationId: string) => {
    await db.markNotificationAsRead(notificationId);
    await refreshNotifications();
  };
  
  const markAllAsRead = async (userId: string) => {
    await db.markAllNotificationsAsRead(userId);
    await refreshNotifications();
  }

  const value = {
    notifications,
    notificationsForUser,
    createNotification,
    markAsRead,
    markAllAsRead,
    unreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
