
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { StatusReaction, ViewedStatus } from '@/lib/types';
import * as db from '@/lib/db';
import { useAuth } from './auth-context';
import { useNotifications } from './notification-context';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { containsProfanity } from '@/lib/profanity-filter';

interface StatusContextType {
  reactions: StatusReaction[];
  viewedStatuses: ViewedStatus[];
  addReaction: (reaction: { statusId: string; chefId: string; emoji?: string; message?: string }) => Promise<void>;
  getReactionsForStatus: (statusId: string) => StatusReaction[];
  getUserReactionForStatus: (statusId: string, userId: string) => StatusReaction | undefined;
  markAsViewed: (statusId: string) => Promise<void>;
  isStoryViewed: (statusId: string, userId: string) => boolean;
  loading: boolean;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [reactions, setReactions] = useState<StatusReaction[]>([]);
  const [viewedStatuses, setViewedStatuses] = useState<ViewedStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStatusData = async () => {
      const [freshReactions, freshViews] = await Promise.all([
          db.getStatusReactions(),
          db.getViewedStatuses()
      ]);
      setReactions(freshReactions);
      setViewedStatuses(freshViews);
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await refreshStatusData();
      setLoading(false);
    };
    loadData();
  }, []);

  const addReaction = async (reaction: { statusId: string; chefId: string; emoji?: string; message?: string }) => {
    if (!user) throw new Error("User not logged in");
    
    if (reaction.message && containsProfanity(reaction.message)) {
        toast({
            variant: 'destructive',
            title: t('inappropriate_language_detected'),
            description: t('your_comment_could_not_be_sent'),
        });
        throw new Error('Profanity detected in comment');
    }

    const existingReaction = reactions.find(r => r.statusId === reaction.statusId && r.userId === user.id);
    if (existingReaction) {
        console.warn("User has already reacted to this status.");
        return;
    }
    
    await db.createStatusReaction({
        statusId: reaction.statusId,
        userId: user.id,
        userName: user.name,
        userImageUrl: user.imageUrl,
        emoji: reaction.emoji,
        message: reaction.message,
    });
    await refreshStatusData();

    if (user.id !== reaction.chefId) {
      createNotification({
          recipientId: reaction.chefId,
          titleKey: 'new_reaction_on_status_title',
          messageKey: reaction.emoji && reaction.message ? 'new_reaction_on_status_desc_both' : reaction.emoji ? 'new_reaction_on_status_desc_emoji' : 'new_reaction_on_status_desc_message',
          params: { userName: user.name, emoji: reaction.emoji, message: reaction.message },
          link: '/chef/status',
      })
    }
  };
  
  const getReactionsForStatus = (statusId: string) => {
      return reactions.filter(r => r.statusId === statusId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  const getUserReactionForStatus = (statusId: string, userId: string) => {
      return reactions.find(r => r.statusId === statusId && r.userId === userId);
  }

  const markAsViewed = async (statusId: string) => {
      if (!user) return;
      const alreadyViewed = viewedStatuses.some(v => v.statusId === statusId && v.userId === user.id);
      if (alreadyViewed) return;
      
      await db.createViewedStatus({ statusId, userId: user.id });
      await refreshStatusData();
  }

  const isStoryViewed = (statusId: string, userId: string): boolean => {
      if (!userId) return false;
      return viewedStatuses.some(v => v.statusId === statusId && v.userId === userId);
  }

  return (
    <StatusContext.Provider value={{ 
        reactions, 
        viewedStatuses,
        addReaction,
        getReactionsForStatus,
        getUserReactionForStatus,
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
