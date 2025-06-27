
'use client';

import { useState, useMemo } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { User, EmojiReaction } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { dateLocales } from './language-manager';
import { Clock, Send, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useStatus } from '@/context/status-context';
import { containsProfanity } from '@/lib/profanity-filter';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


interface StatusViewerProps {
  chef: User;
}

const EMOJI_REACTIONS: EmojiReaction[] = ['❤️', '😍', '👍', '🔥', '🤤'];

export function StatusViewer({ chef }: StatusViewerProps) {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const { addReaction, getReactionForUser, loading: statusLoading } = useStatus();
  const { toast } = useToast();

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  if (!chef.status) {
    return null;
  }
  
  const existingReaction = useMemo(() => {
    if (!user || !chef.status) return undefined;
    return getReactionForUser(chef.status.id, user.id);
  }, [user, chef.status, getReactionForUser, statusLoading]);
  

  const statusAltText = chef.status.caption || t('status_from_chef', { name: chef.name });

  const handleSendReaction = async (emoji?: EmojiReaction) => {
    if (!user || !chef.status) return;
    if (existingReaction) return;
    if (!emoji && !message.trim()) return;
    if (message.trim() && containsProfanity(message)) {
      toast({
        variant: 'destructive',
        title: t('inappropriate_language_detected'),
        description: t('inappropriate_language_detected_desc'),
      });
      return;
    }

    setSubmitting(true);
    try {
      await addReaction({
        statusId: chef.status.id,
        chefId: chef.id,
        emoji: emoji,
        message: message.trim() || undefined,
      });
      toast({ title: t('reaction_sent') });
      if (!emoji) {
        setMessage('');
      }
    } catch (error) {
      toast({ variant: 'destructive', title: t('error'), description: t('failed_to_send_reaction') });
    } finally {
      setSubmitting(false);
    }
  };

  const renderInteractionUI = () => {
    if (user?.role !== 'customer') return null;

    if (existingReaction) {
      return (
        <div className="text-center text-white text-sm p-4 bg-black/50">
          {t('you_reacted')}
        </div>
      );
    }
    
    return (
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-center gap-2 mb-3">
          {EMOJI_REACTIONS.map((emoji) => (
            <Button key={emoji} variant="ghost" size="icon" className="rounded-full text-2xl bg-black/30 hover:bg-black/50" onClick={() => handleSendReaction(emoji)} disabled={submitting}>
              {emoji}
            </Button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSendReaction(); }} className="flex gap-2">
            <Input 
              placeholder={t('send_comment')} 
              className="bg-black/50 border-white/30 text-white placeholder:text-neutral-300"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={submitting}
            />
            <Button type="submit" size="icon" disabled={submitting || !message.trim()}>
              {submitting && !message.trim() ? <Loader2 className="animate-spin"/> : <Send />}
            </Button>
        </form>
      </div>
    );
  };

  return (
    <DialogContent className="p-0 max-w-lg w-full bg-black border-0">
       <DialogHeader className="sr-only">
         <DialogTitle>{statusAltText}</DialogTitle>
         {chef.status.caption && <DialogDescription>{chef.status.caption}</DialogDescription>}
      </DialogHeader>
      <div className="relative aspect-[9/16] w-full">
        <Image
          src={chef.status.imageUrl}
          alt={statusAltText}
          layout="fill"
          objectFit="contain"
          className="rounded-lg"
        />
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={chef.imageUrl} alt={chef.name} />
                    <AvatarFallback>{chef.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold text-white">{chef.name}</p>
                    <p className="text-xs text-neutral-300 flex items-center gap-1">
                        <Clock className="w-3 h-3"/>
                        {formatDistanceToNow(new Date(chef.status.createdAt), { addSuffix: true, locale: dateLocales[i18n.language] })}
                    </p>
                </div>
            </div>
            <DialogClose className="text-white/70 hover:text-white transition-colors">
                <X className="w-6 h-6"/>
            </DialogClose>
        </div>
        
        {chef.status.caption && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 text-center">
            <p className="text-white text-2xl font-bold drop-shadow-lg bg-black/30 px-4 py-2 rounded-md">{chef.status.caption}</p>
          </div>
        )}

        {renderInteractionUI()}
      </div>
    </DialogContent>
  );
}

