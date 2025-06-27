
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { StatusReaction, EmojiReaction } from '@/lib/types';
import localforage from 'localforage';
import { useAuth } from './auth-context';

interface StatusContextType {
  reactions: StatusReaction[];
  addReaction: (payload: { statusId: string; chefId: string; emoji?: EmojiReaction; message?: string }) => Promise<void>;
  getReactionsForStatus: (statusId: string) => StatusReaction[];
  getReactionForUser: (statusId: string, userId: string) => StatusReaction | undefined;
  deleteReactionsForStatus: (statusId: string) => Promise<void>;
  loading: boolean;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<StatusReaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const storedReactions: StatusReaction[] | null = await localforage.getItem('status_reactions');
      setReactions(storedReactions || []);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      localforage.setItem('status_reactions', reactions);
    }
  }, [reactions, loading]);

  const addReaction = async (payload: { statusId: string; chefId: string; emoji?: EmojiReaction; message?: string }) => {
    if (!user) throw new Error("User not logged in");
    if (!payload.emoji && !payload.message) return;

    const newReaction: StatusReaction = {
      id: `reaction_${Date.now()}`,
      statusId: payload.statusId,
      chefId: payload.chefId,
      userId: user.id,
      userName: user.name,
      userImageUrl: user.imageUrl,
      emoji: payload.emoji,
      message: payload.message,
      createdAt: new Date().toISOString(),
    };
    setReactions(prev => [newReaction, ...prev]);
  };

  const getReactionsForStatus = (statusId: string) => {
    return reactions.filter(r => r.statusId === statusId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getReactionForUser = (statusId: string, userId: string) => {
    return reactions.find(r => r.statusId === statusId && r.userId === userId);
  };
  
  const deleteReactionsForStatus = async (statusId: string) => {
      setReactions(prev => prev.filter(r => r.statusId !== statusId));
  }

  return (
    <StatusContext.Provider value={{ reactions, addReaction, getReactionsForStatus, getReactionForUser, deleteReactionsForStatus, loading }}>
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
