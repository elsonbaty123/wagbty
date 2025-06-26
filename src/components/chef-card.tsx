'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/lib/types';
import { Star, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

// The chef object passed here will be augmented with dishCount and averageRating
interface ChefCardProps {
  chef: User & { dishCount: number; averageRating: number; };
}

export function ChefCard({ chef }: ChefCardProps) {
  const { t } = useTranslation();
  const statusMap: { [key: string]: { labelKey: string; className: string; } } = {
    available: { labelKey: 'status_available', className: 'bg-green-500 text-white hover:bg-green-500/90' },
    busy: { labelKey: 'status_busy', className: 'bg-yellow-500 text-white hover:bg-yellow-500/90' },
    closed: { labelKey: 'status_closed', className: 'bg-red-500 text-white hover:bg-red-500/90' },
  };
  const statusInfo = chef.availabilityStatus ? statusMap[chef.availabilityStatus] : null;

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={`/chefs/${chef.id}`}>
          <Image
            alt={chef.name}
            className="aspect-[4/3] w-full object-cover"
            height="300"
            src={chef.imageUrl!}
            data-ai-hint="chef portrait"
            width="400"
          />
        </Link>
        {statusInfo && (
          <Badge className={cn('absolute top-3 end-3 border-none', statusInfo.className)}>
            {t(statusInfo.labelKey)}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/chefs/${chef.id}`} className="hover:text-primary transition-colors">
            <CardTitle className="font-headline text-2xl">{chef.name}</CardTitle>
        </Link>
        <CardDescription className="text-primary font-semibold mt-1">{chef.specialty}</CardDescription>
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
