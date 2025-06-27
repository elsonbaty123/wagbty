
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { ChatMessage, User } from '@/lib/types';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
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
    try {
      const storedMessages = localStorage.getItem('chefconnect_chat_messages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error("Failed to parse chat messages from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    localStorage.setItem('chefconnect_chat_messages', JSON.stringify(newMessages));
  };
  
  const validateMessage = (text: string): boolean => {
    if (!text.trim()) {
      toast({ variant: 'destructive', title: t('message_empty') });
      return false;
    }
    // Regex to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?\b)/gi;
    if (urlRegex.test(text)) {
      toast({ variant: 'destructive', title: t('no_links_allowed') });
      return false;
    }
    return true;
  };

  const sendMessage = (text: string) => {
    if (!user || user.role !== 'customer') return;
    if (!validateMessage(text)) return;
    
    const newMessage: ChatMessage = {
      id: `MSG-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userImageUrl: user.imageUrl,
      text: text,
      createdAt: new Date().toISOString(),
    };
    
    persistMessages([ ...messages, newMessage]);
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
