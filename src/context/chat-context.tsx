
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { ChatMessage } from '@/lib/types';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import * as db from '@/lib/db';
import { containsProfanity } from '@/lib/profanity-filter';

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMessages = async () => {
      const freshMessages = await db.getChatMessages();
      setMessages(freshMessages);
  }

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      await refreshMessages();
      setLoading(false);
    };
    loadMessages();
  }, []);
  
  const validateMessage = (text: string): boolean => {
    if (!text.trim()) {
      toast({ variant: 'destructive', title: t('message_empty') });
      return false;
    }

    if (containsProfanity(text)) {
      toast({
        variant: 'destructive',
        title: i18n.language === 'ar' ? 'تم رصد لغة غير لائقة' : 'Inappropriate Language Detected',
        description: i18n.language === 'ar' ? 'لم نتمكن من إرسال رسالتك. الرجاء احترام إرشادات المجتمع.' : 'Your message could not be sent. Please respect our community guidelines.',
      });
      return false;
    }
    
    const urlRegex = /(https?:\/\/|www\.|\.[a-z]{2,}\/)/i;
    if (urlRegex.test(text.toLowerCase())) {
      toast({ variant: 'destructive', title: t('no_links_allowed') });
      return false;
    }
    return true;
  };

  const sendMessage = async (text: string) => {
    if (!user || user.role !== 'customer') return;
    if (!validateMessage(text)) return;
    
    const newMessageData = {
      userId: user.id,
      userName: user.name,
      userImageUrl: user.imageUrl,
      text: text,
    };
    
    await db.createChatMessage(newMessageData);
    await refreshMessages();
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
