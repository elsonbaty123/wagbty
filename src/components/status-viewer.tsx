
'use client';

import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { dateLocales } from './language-manager';
import { Clock } from 'lucide-react';

interface StatusViewerProps {
  chef: User;
}

export function StatusViewer({ chef }: StatusViewerProps) {
  const { i18n, t } = useTranslation();

  if (!chef.status) {
    return null;
  }

  const statusAltText = chef.status.caption || t('status_from_chef', { name: chef.name });

  return (
    <DialogContent className="p-0 max-w-lg w-full bg-black border-0">
      <DialogHeader className="sr-only">
        <DialogTitle>{statusAltText}</DialogTitle>
        {chef.status.caption && (
          <DialogDescription>{chef.status.caption}</DialogDescription>
        )}
      </DialogHeader>
      <div className="relative aspect-[9/16] w-full">
        <Image
          src={chef.status.imageUrl}
          alt={statusAltText}
          layout="fill"
          objectFit="contain"
          className="rounded-lg"
        />
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
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
        </div>
        {chef.status.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 text-center bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-white text-base drop-shadow-md">{chef.status.caption}</p>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
