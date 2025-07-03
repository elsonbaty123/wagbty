
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/lib/types';
import { Star, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/auth-context';
import { useStatus } from '@/context/status-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { StatusViewer } from '@/components/status-viewer';

// The chef object passed here will be augmented with dishCount and averageRating
interface ChefCardProps {
  chef: User & { dishCount: number; averageRating: number; };
}

export function ChefCard({ chef }: ChefCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isStoryViewed } = useStatus();

  const isStatusActive = chef.status && (new Date().getTime() - new Date(chef.status.createdAt).getTime()) < 24 * 60 * 60 * 1000;
  
  // Show indicator if status is active AND (user is not logged in OR user has not viewed it)
    const hasUnreadStatus = isStatusActive && chef.status && (!user || !isStoryViewed(chef.status.id!, user.id));

  const statusMap: { [key: string]: { labelKey: string; className: string; } } = {
    available: { labelKey: 'status_available', className: 'bg-green-500 text-white hover:bg-green-500/90' },
    busy: { labelKey: 'status_busy', className: 'bg-yellow-500 text-white hover:bg-yellow-500/90' },
    closed: { labelKey: 'status_closed', className: 'bg-red-500 text-white hover:bg-red-500/90' },
  };
  const statusInfo = chef.availabilityStatus ? statusMap[chef.availabilityStatus] : null;

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-4 flex-row items-center gap-4 bg-muted/30">
        {isStatusActive ? (
          <Dialog>
            <DialogTrigger asChild>
              <Avatar className={cn(
                "h-16 w-16 shadow-sm cursor-pointer ring-2 ring-offset-2 ring-offset-background",
                hasUnreadStatus ? "ring-green-500" : "ring-gray-400"
              )}>
                <AvatarImage src={chef.imageUrl || 'https://placehold.co/100x100.png'} alt={chef.name} />
                <AvatarFallback>{chef.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </DialogTrigger>
            <StatusViewer chef={chef} />
          </Dialog>
        ) : (
          <Link href={`/chefs/${chef.id}`}>
              <Avatar className="h-16 w-16 shadow-sm">
                <AvatarImage src={chef.imageUrl || 'https://placehold.co/100x100.png'} alt={chef.name} />
                <AvatarFallback>{chef.name.charAt(0)}</AvatarFallback>
              </Avatar>
          </Link>
        )}
        <div className="flex-1">
          <Link href={`/chefs/${chef.id}`} className="hover:text-primary transition-colors">
            <CardTitle className="font-headline text-xl">{chef.name}</CardTitle>
          </Link>
          <CardDescription className="text-primary font-semibold text-sm">{chef.specialty}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        {statusInfo && (
          <Badge className={cn('mb-2 border-none', statusInfo.className)}>
            {t(statusInfo.labelKey)}
          </Badge>
        )}
        <p className="mt-2 text-sm text-muted-foreground min-h-[40px] line-clamp-2">{chef.bio}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center bg-muted/50 mt-auto">
        {chef.averageRating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-sm">{chef.averageRating.toFixed(1)}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{chef.dishCount} {t('dishes')}</span>
            <Utensils className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardFooter>
    </Card>
  );
}
