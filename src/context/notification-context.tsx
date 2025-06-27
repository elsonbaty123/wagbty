
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { Notification } from '@/lib/types';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc, 
  updateDoc, 
  doc,
  writeBatch,
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
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
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !db) {
        setNotifications([]);
        return;
    };

    const q = query(
        collection(db, "notifications"), 
        where("recipientId", "==", user.id),
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifs: Notification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifs.push({
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
        } as Notification);
      });
      setNotifications(notifs);
    }, (error) => {
        console.error("Error fetching notifications: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    if (!db) return; // Firebase not configured
    const newNotificationData = {
      ...notificationData,
      createdAt: serverTimestamp(),
      isRead: false,
    };
    await addDoc(collection(db, 'notifications'), newNotificationData);
  };
  
  const notificationsForUser = (userId: string) => {
    return notifications.filter(n => n.recipientId === userId);
  }
  
  const unreadCount = (userId: string) => {
    return notifications.filter(n => n.recipientId === userId && !n.isRead).length;
  }

  const markAsRead = async (notificationId: string) => {
    if (!db) return; // Firebase not configured
    const notifDocRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifDocRef, { isRead: true });
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };
  
  const markAllAsRead = async (userId: string) => {
    if (!db) return; // Firebase not configured
    const batch = writeBatch(db);
    const unreadNotifs = notifications.filter(n => n.recipientId === userId && !n.isRead);
    
    unreadNotifs.forEach(notification => {
        const notifDocRef = doc(db, 'notifications', notification.id);
        batch.update(notifDocRef, { isRead: true });
    });

    await batch.commit();

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
