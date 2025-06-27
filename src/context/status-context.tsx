
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { StatusLike, ViewedStatus } from '@/lib/types';
import localforage from 'localforage';
import { useAuth } from './auth-context';
import { useNotifications } from './notification-context';

interface StatusContextType {
  likes: StatusLike[];
  viewedStatuses: ViewedStatus[];
  toggleLike: (statusId: string, chefId: string) => Promise<void>;
  getLikesForStatus: (statusId: string) => StatusLike[];
  isStoryLiked: (statusId: string, userId: string) => boolean;
  markAsViewed: (statusId: string) => Promise<void>;
  isStoryViewed: (statusId: string, userId: string) => boolean;
  loading: boolean;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [likes, setLikes] = useState<StatusLike[]>([]);
  const [viewedStatuses, setViewedStatuses] = useState<ViewedStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [storedLikes, storedViews] = await Promise.all([
          localforage.getItem<StatusLike[]>('status_likes'),
          localforage.getItem<ViewedStatus[]>('viewed_statuses')
      ]);
      setLikes(storedLikes || []);
      setViewedStatuses(storedViews || []);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      localforage.setItem('status_likes', likes);
    }
  }, [likes, loading]);

  useEffect(() => {
    if (!loading) {
      localforage.setItem('viewed_statuses', viewedStatuses);
    }
  }, [viewedStatuses, loading]);

  const toggleLike = async (statusId: string, chefId: string) => {
    if (!user) throw new Error("User not logged in");
    
    const existingLike = likes.find(l => l.statusId === statusId && l.userId === user.id);

    if (existingLike) {
      // Unlike
      setLikes(prev => prev.filter(l => l.id !== existingLike.id));
    } else {
      // Like
      const newLike: StatusLike = {
        id: `like_${Date.now()}`,
        statusId,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };
      setLikes(prev => [newLike, ...prev]);

      // Notify the chef, but only if it's not the chef liking their own status
      if (user.id !== chefId) {
        createNotification({
            recipientId: chefId,
            titleKey: 'new_like_on_status_title',
            messageKey: 'new_like_on_status_desc',
            params: { userName: user.name },
            link: '/chef/dashboard?tab=status',
        })
      }
    }
  };
  
  const getLikesForStatus = (statusId: string) => {
      return likes.filter(l => l.statusId === statusId);
  }

  const isStoryLiked = (statusId: string, userId: string) => {
      return likes.some(l => l.statusId === statusId && l.userId === userId);
  }

  const markAsViewed = async (statusId: string) => {
      if (!user) return;
      const alreadyViewed = viewedStatuses.some(v => v.statusId === statusId && v.userId === user.id);
      if (alreadyViewed) return;

      const newView: ViewedStatus = {
          id: `view_${Date.now()}`,
          statusId,
          userId: user.id,
          createdAt: new Date().toISOString(),
      };
      setViewedStatuses(prev => [...prev, newView]);
  }

  const isStoryViewed = (statusId: string, userId: string): boolean => {
      if (!userId) return false;
      return viewedStatuses.some(v => v.statusId === statusId && v.userId === userId);
  }

  return (
    <StatusContext.Provider value={{ 
        likes, 
        viewedStatuses,
        toggleLike,
        getLikesForStatus,
        isStoryLiked,
        markAsViewed,
        isStoryViewed,
        loading 
    }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
};
