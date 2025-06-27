
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, ChefHat } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { dateLocales } from '@/components/language-manager';

export default function DishDetailsPage() {
  const { t, i18n } = useTranslation();
  const params = useParams<{ id: string }>();
  const { dishes, loading: dishesLoading } = useOrders();
  const { users, loading: authLoading } = useAuth();
  
  const dish = dishes.find(d => d.id === params.id);
  const chef = dish ? users.find(u => u.id === dish.chefId) : null;
  
  const loading = dishesLoading || authLoading;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-10 w-3/4 mt-6" />
                <Skeleton className="h-6 w-1/2 mt-2" />
                <Skeleton className="h-24 w-full mt-4" />
            </div>
            <div>
                <Skeleton className="h-10 w-48 mb-6" />
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (!dish || !chef) {
    notFound();
  }
  
  const sortedRatings = dish.ratings?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
  const ratingsCount = sortedRatings.length;
  const averageRating = ratingsCount > 0
    ? sortedRatings.reduce((sum, r) => sum + r.rating, 0) / ratingsCount
    : 0;

  const isChefClosed = chef.availabilityStatus === 'closed';
  const isDishAvailable = dish.status === 'available';
  const canOrder = isDishAvailable && !isChefClosed;

  const getButtonText = () => {
    if (!isDishAvailable) return t('dish_unavailable');
    if (isChefClosed) return t('chef_is_currently_closed');
    if (chef.availabilityStatus === 'busy') return t('order_now_chef_busy');
    return t('order_now');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
        {/* Dish Image and Details */}
        <div className="md:col-span-3">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            width={800}
            height={450}
            className="w-full aspect-video object-cover rounded-xl shadow-lg"
            data-ai-hint="plated food high quality"
          />
          <div className="mt-6">
            <div className="flex justify-between items-start">
              <h1 className="font-headline text-4xl font-bold text-primary">{dish.name}</h1>
              <Badge variant="secondary" className="text-lg">{dish.category}</Badge>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
                <ChefHat className="w-6 h-6 text-muted-foreground" />
                <Link href={`/chefs/${chef.id}`} className="font-semibold text-lg hover:underline">{t('by_chef', { name: chef.name })}</Link>
            </div>
            
            <p className="mt-4 text-lg text-muted-foreground">{dish.description}</p>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="font-bold text-xl mb-3">{t('ingredients')}</h3>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients.map(ingredient => (
                  <Badge key={ingredient} variant="outline">{ingredient}</Badge>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <Button size="lg" asChild className={cn("bg-primary text-primary-foreground hover:bg-primary/90", !canOrder && "bg-muted text-muted-foreground hover:bg-muted")} disabled={!canOrder}>
                    <Link href={`/order?dishId=${dish.id}`}>{getButtonText()}</Link>
                </Button>
                <p className="text-3xl font-bold text-accent">{dish.price.toFixed(2)} {t('currency_egp')}</p>
            </div>
          </div>
        </div>
        
        {/* Customer Reviews */}
        <div className="md:col-span-2">
           <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline">{t('customer_reviews')}</CardTitle>
                 {ratingsCount > 0 && (
                    <div className="flex items-center gap-2 pt-2" dir="ltr">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-xl">{averageRating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({t('review_count_plural', { count: ratingsCount })})</span>
                    </div>
                 )}
            </CardHeader>
            <CardContent>
                {sortedRatings.length > 0 ? (
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pe-2">
                        {sortedRatings.map((review, index) => (
                            <div key={index} className="flex gap-4">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-0.5" dir="ltr">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                                            ))}
                                        </div>
                                        <p className="font-semibold">{review.customerName}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 text-start">
                                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: dateLocales[i18n.language] })}
                                    </p>
                                    {review.review && <p className="mt-2 text-sm text-muted-foreground italic">"{review.review}"</p>}
                                </div>
                                 <Avatar>
                                    <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person avatar"/>
                                    <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">{t('no_reviews_for_dish')}</p>
                    </div>
                )}
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
