'use client';

import { useState, useEffect, useRef } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { dateLocales } from './language-manager';
import { Clock, Send, X, Loader2, Heart, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useStatus } from '@/context/status-context';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';

interface StatusViewerProps {
  chef: User;
}

export function StatusViewer({ chef }: StatusViewerProps) {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const { markAsViewed, addReaction, getUserReactionForStatus } = useStatus();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // New state for video control
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user && chef.status) {
        markAsViewed(chef.status.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chef.status?.id, user?.id]);


  // Effect for video event listeners
  useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
          if (video.duration > 0) {
              setProgress((video.currentTime / video.duration) * 100);
          }
      };
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      
      // Auto-play when component mounts
      video.play().catch(console.error);
      setIsPlaying(true);

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
      };
  }, []);

  if (!chef.status) {
    return null;
  }
  
  const userReaction = user ? getUserReactionForStatus(chef.status.id, user.id) : undefined;
  const isStatusActive = chef.status && (new Date().getTime() - new Date(chef.status.createdAt).getTime()) < 24 * 60 * 60 * 1000;
  const canInteract = isStatusActive && user && user.role === 'customer' && !userReaction;

  const handleSendReaction = async () => {
    if (!canInteract) return;
    setIsSubmitting(true);
    try {
        await addReaction({
            statusId: chef.status!.id,
            chefId: chef.id
        });
        toast({ title: t('reaction_sent') });
    } catch (error) {
        toast({ variant: 'destructive', title: t('error'), description: t('failed_to_send_reaction') });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
  };
  
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents click from bubbling up to other handlers like play/pause or closing the dialog
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const statusAltText = chef.status.caption || t('status_from_chef', { name: chef.name });

  const renderInteractionUI = () => {
    if (!user || user.role !== 'customer') return null;
    
    if (!isStatusActive) {
      return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center">
            <p className="text-sm text-white/80">{t('status_expired')}</p>
        </div>
      );
    }
    
    if (userReaction) {
        return (
             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center">
                <div className="flex items-center gap-2 bg-black/30 text-white px-4 py-2 rounded-full">
                    <Heart className="h-5 w-5 fill-red-500 text-red-500"/>
                    <p>{t('you_loved_this')}</p>
                </div>
            </div>
        );
    }

    return (
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-3">
        <Button 
            onClick={handleSendReaction}
            variant="ghost" 
            size="lg" 
            className={cn("rounded-full h-14 w-auto px-6 bg-black/30 hover:bg-black/50 text-xl hover:scale-105 transition-transform transform text-white")}
            aria-label={t('love_reaction')}
            disabled={isSubmitting}
        >
            {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : <Heart className="me-2 h-6 w-6" />}
            {t('love_reaction')}
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
         {chef.status.type === 'video' ? (
          <video
            ref={videoRef}
            src={chef.status.imageUrl}
            className="w-full h-full object-cover rounded-lg cursor-pointer"
            autoPlay
            muted
            playsInline
            loop
            onClick={handleTogglePlay}
          />
        ) : (
          <Image
            src={chef.status.imageUrl}
            alt={statusAltText}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        )}
        <div className="absolute top-0 left-0 right-0 p-4 pt-6 bg-gradient-to-b from-black/60 to-transparent z-10">
            {chef.status.type === 'video' && (
                <div className="absolute top-2.5 left-4 right-4">
                    <div className="h-1 rounded-full bg-white/30 overflow-hidden">
                        <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={chef.imageUrl || 'https://placehold.co/400x400.png'} alt={chef.name} data-ai-hint="chef portrait"/>
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
                <div className="flex items-center gap-2">
                    {chef.status.type === 'video' && (
                        <button onClick={handleToggleMute} className="text-white/70 hover:text-white transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white">
                            {isMuted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
                            <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
                        </button>
                    )}
                    <DialogClose className="text-white/70 hover:text-white transition-colors">
                        <X className="w-6 h-6"/>
                    </DialogClose>
                </div>
            </div>
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
