
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { ChatMessage } from '@/lib/types';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';


interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "chat_messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
        } as ChatMessage);
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chat messages: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const validateMessage = (text: string): boolean => {
    if (!text.trim()) {
      toast({ variant: 'destructive', title: t('message_empty') });
      return false;
    }
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?\b)/gi;
    if (urlRegex.test(text)) {
      toast({ variant: 'destructive', title: t('no_links_allowed') });
      return false;
    }
    return true;
  };

  const sendMessage = async (text: string) => {
    if (!user || user.role !== 'customer') return;
    if (!db) throw new Error("Firebase is not configured. Please add your credentials to a .env.local file and restart the server.");
    if (!validateMessage(text)) return;
    
    const newMessage = {
      userId: user.id,
      userName: user.name,
      userImageUrl: user.imageUrl,
      text: text,
      createdAt: serverTimestamp(),
    };
    
    await addDoc(collection(db, "chat_messages"), newMessage);
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, loading }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
