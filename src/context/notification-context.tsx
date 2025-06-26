
'use client';

import * as React from 'react';
import type { Notification } from '@/lib/types';

interface NotificationContextType {
  notifications: Notification[];
  notificationsForUser: (userId: string) => Notification[];
  createNotification: (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (userId: string) => void;
  unreadCount: (userId: string) => number;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    try {
      const storedNotifications = localStorage.getItem('chefconnect_notifications');
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
    } catch (error) {
      console.error("Failed to parse notifications from localStorage", error);
    }
  }, []);

  const persistNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem('chefconnect_notifications', JSON.stringify(newNotifications));
  }

  const createNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `NOTIF${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    persistNotifications([newNotification, ...notifications]);
  };
  
  const notificationsForUser = (userId: string) => {
    return notifications
        .filter(n => n.recipientId === userId)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  const unreadCount = (userId: string) => {
    return notifications.filter(n => n.recipientId === userId && !n.isRead).length;
  }

  const markAsRead = (notificationId: string) => {
    const newNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    persistNotifications(newNotifications);
  };
  
  const markAllAsRead = (userId: string) => {
      const newNotifications = notifications.map(n => 
        n.recipientId === userId ? { ...n, isRead: true } : n
      );
      persistNotifications(newNotifications);
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
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
