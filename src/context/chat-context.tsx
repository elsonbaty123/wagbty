
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { ChatMessage } from '@/lib/types';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import localforage from 'localforage';

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

  // Load messages from local storage on initial render
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      const storedMessages: ChatMessage[] | null = await localforage.getItem('chat_messages');
      setMessages(storedMessages || []);
      setLoading(false);
    };
    loadMessages();
  }, []);

  // Persist messages to local storage whenever they change
  useEffect(() => {
    if (!loading) {
      localforage.setItem('chat_messages', messages);
    }
  }, [messages, loading]);
  
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
    if (!validateMessage(text)) return;
    
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userImageUrl: user.imageUrl,
      text: text,
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
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
