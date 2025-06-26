
'use client';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { DishCard } from '@/components/dish-card';
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function ChefProfilePage() {
  const { t, i18n } = useTranslation();
  const params = useParams<{ id: string }>();
  const { users, loading: authLoading } = useAuth();
  const { dishes, loading: ordersLoading } = useOrders();
  
  const chef = users.find(u => u.id === params.id && u.role === 'chef');
  
  const loading = authLoading || ordersLoading;

  const { chefDishes, chefAverageRating, totalRatingsCount } = useMemo(() => {
    if (!chef) {
      return { chefDishes: [], chefAverageRating: 0, totalRatingsCount: 0 };
    }
    const filteredDishes = dishes.filter(dish => dish.chefId === chef.id && dish.status !== 'hidden');
    const allRatings = filteredDishes.flatMap(d => d.ratings?.map(r => r.rating) || []);
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : chef.rating || 0;
    
    return {
      chefDishes: filteredDishes,
      chefAverageRating: averageRating,
      totalRatingsCount: allRatings.length,
    };
  }, [chef, dishes]);
  
  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                <div className="md:col-span-1">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <Skeleton className="h-8 w-3/4 mt-4" />
                    <Skeleton className="h-6 w-1/2 mt-2" />
                    <Skeleton className="h-20 w-full mt-4" />
                </div>
                <div className="md:col-span-2">
                    <Skeleton className="h-10 w-48 mb-6" />
                    <div className="grid gap-6 md:grid-cols-2">
                        <Skeleton className="h-[420px] w-full" />
                        <Skeleton className="h-[420px] w-full" />
                    </div>
                </div>
            </div>
      </div>
    );
  }

  if (!chef) {
    notFound();
  }
  
  const statusMap: { [key: string]: { labelKey: string; className: string; } } = {
    available: { labelKey: 'status_available', className: 'bg-green-500 text-white hover:bg-green-500/90' },
    busy: { labelKey: 'status_busy', className: 'bg-yellow-500 text-white hover:bg-yellow-500/90' },
    closed: { labelKey: 'status_closed', className: 'bg-red-500 text-white hover:bg-red-500/90' },
  };
  const statusInfo = chef.availabilityStatus ? statusMap[chef.availabilityStatus] : null;

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <Image
              alt={chef.name}
              className="aspect-square w-full rounded-xl object-cover shadow-lg"
              height="400"
              src={chef.imageUrl!}
              data-ai-hint="chef cooking"
              width="400"
            />
            <h1 className="font-headline text-3xl font-bold mt-4">{chef.name}</h1>
            {statusInfo && (
                <Badge className={cn('mt-2 border-none', statusInfo.className)}>
                    {t(statusInfo.labelKey)}
                </Badge>
            )}
            <p className="text-lg text-primary font-semibold mt-1">{chef.specialty}</p>
            <div className="flex items-center justify-start gap-2 mt-2" dir="ltr">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-lg">{chefAverageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({t('review_count_plural', { count: totalRatingsCount })})</span>
            </div>
            <p className="mt-4 text-muted-foreground">{chef.bio}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="font-headline text-3xl font-bold text-primary mb-6">{t('menu')}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {chefDishes.length > 0 ? (
                chefDishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} chefName={chef.name} chefStatus={chef.availabilityStatus} />
                ))
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                    <p className="text-muted-foreground">{t('this_chef_has_no_dishes')}</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
