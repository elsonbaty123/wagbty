
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { Notification } from '@/lib/types';
import localforage from 'localforage';
import { useAuth } from './auth-context';

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
  const { user } = useAuth();

  // Load notifications from local storage on initial render
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      const storedNotifications: Notification[] | null = await localforage.getItem('notifications');
      setNotifications(storedNotifications || []);
      setLoading(false);
    };
    loadNotifications();
  }, []);

  // Persist notifications to local storage whenever they change
  useEffect(() => {
    if (!loading) {
      localforage.setItem('notifications', notifications);
    }
  }, [notifications, loading]);

  const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
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
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };
  
  const markAllAsRead = async (userId: string) => {
    setNotifications(prev => prev.map(n => n.recipientId === userId ? { ...n, isRead: true } : n));
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
