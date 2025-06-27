
'use client';

import { useState, useMemo, useEffect } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { dateLocales } from './language-manager';
import { Clock, Heart, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useStatus } from '@/context/status-context';
import { cn } from '@/lib/utils';


interface StatusViewerProps {
  chef: User;
}

export function StatusViewer({ chef }: StatusViewerProps) {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const { isStoryLiked, toggleLike, markAsViewed } = useStatus();

  useEffect(() => {
    if (user && chef.status) {
        markAsViewed(chef.status.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chef.status?.id, user?.id]);

  if (!chef.status) {
    return null;
  }
  
  const isLiked = user ? isStoryLiked(chef.status.id, user.id) : false;
  const isStatusActive = chef.status && (new Date().getTime() - new Date(chef.status.createdAt).getTime()) < 24 * 60 * 60 * 1000;

  const handleLikeClick = () => {
    if (!user || !chef.status || !isStatusActive) return;
    toggleLike(chef.status.id, chef.id);
  };
  
  const statusAltText = chef.status.caption || t('status_from_chef', { name: chef.name });

  const renderInteractionUI = () => {
    if (user?.role !== 'customer') return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
        <Button 
            onClick={handleLikeClick}
            variant="ghost" 
            size="icon" 
            className="rounded-full h-14 w-14 bg-black/30 hover:bg-black/50 hover:scale-110 transition-transform transform"
            disabled={!isStatusActive}
            aria-label={t('like')}
        >
            <Heart className={cn("h-7 w-7 text-white transition-all", isLiked && "fill-red-500 text-red-500")} />
        </Button>
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
