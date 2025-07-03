

'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ChefCard } from '@/components/chef-card';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import { Users, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { PopularDishesCarousel } from '@/components/popular-dishes-carousel';
import { DiscountedDishesCarousel } from '@/components/discounted-dishes-carousel';
import type { Dish } from '@/lib/types';

export default function Home() {
  const { t } = useTranslation();
  const { dishes, orders, coupons, loading: dishesLoading } = useOrders();
  const { chefs, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const loading = dishesLoading || authLoading;

  const popularDishes = useMemo(() => {
    const dishOrderCounts = new Map<string, number>();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    orders.forEach(order => {
      if (new Date(order.createdAt) < oneWeekAgo) return;
      dishOrderCounts.set(order.dish.id, (dishOrderCounts.get(order.dish.id) || 0) + order.quantity);
    });
  
    // Sort dish IDs by popularity
    const sortedDishIds = Array.from(dishOrderCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
  
    // Take top 5 dishes for the carousel
    return sortedDishIds
      .map(id => dishes.find(dish => dish.id === id))
      .filter((dish): dish is Dish => !!dish)
      .slice(0, 5);
  }, [orders, dishes]);

  const discountedDishes = useMemo(() => {
    const now = new Date();
    const discountsMap = new Map<string, { dish: Dish; originalPrice: number; discountedPrice: number; discountPercentage: number; }>();

    // 1. Process direct discounts on dishes
    dishes.forEach(dish => {
        if (dish.discountPercentage && dish.discountPercentage > 0 && dish.discountEndDate && new Date(dish.discountEndDate) > now) {
            const discountAmount = dish.price * (dish.discountPercentage / 100);
            discountsMap.set(dish.id, {
                dish,
                originalPrice: dish.price,
                discountedPrice: dish.price - discountAmount,
                discountPercentage: dish.discountPercentage,
            });
        }
    });

    // 2. Process coupon-based discounts
    const activeDishCoupons = coupons.filter(c => 
        c.isActive && 
        c.appliesTo === 'specific' && 
        c.applicableDishIds && 
        c.applicableDishIds.length > 0 &&
        new Date(c.endDate) > now &&
        c.timesUsed < c.usageLimit
    );

    activeDishCoupons.forEach(coupon => {
        (coupon.applicableDishIds || []).forEach(dishId => {
            const dish = dishes.find(d => d.id === dishId);
            if (!dish) return;

            let discountAmount = coupon.discountType === 'fixed' 
                ? coupon.discountValue 
                : dish.price * (coupon.discountValue / 100);
            
            discountAmount = Math.min(discountAmount, dish.price);
            
            const existingDiscount = discountsMap.get(dishId);
            const existingDiscountAmount = existingDiscount ? existingDiscount.originalPrice - existingDiscount.discountedPrice : 0;

            if (discountAmount > existingDiscountAmount) {
                const discountPercentage = Math.round((discountAmount / dish.price) * 100);
                discountsMap.set(dishId, {
                    dish,
                    originalPrice: dish.price,
                    discountedPrice: dish.price - discountAmount,
                    discountPercentage: discountPercentage,
                 });
            }
        });
    });

    return Array.from(discountsMap.values()).sort((a, b) => b.discountPercentage - a.discountPercentage);
  }, [coupons, dishes]);


  const chefsWithDishData = useMemo(() => {
    return chefs.map(chef => {
      const chefDishes = dishes.filter(dish => dish.chefId === chef.id && dish.status !== 'hidden');
      const allRatings = chefDishes.flatMap(d => d.ratings?.map(r => r.rating) || []);
      const averageRating = allRatings.length > 0
        ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
        : 0;

      return {
        ...chef,
        dishCount: chefDishes.length,
        averageRating,
      };
    }).filter(chef => chef.dishCount > 0); // Only show chefs with at least one dish
  }, [chefs, dishes]);


  const filteredChefs = searchQuery
    ? chefsWithDishData.filter(chef =>
        chef.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chefsWithDishData;

  if (loading) {
    return (
        <div className="flex flex-col">
          <section className="w-full py-12 md:py-20 lg:py-28">
             <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <Skeleton className="h-16 w-3/4" />
                    <Skeleton className="h-8 w-1/2 mt-2" />
                    <Skeleton className="h-12 w-full max-w-lg mt-4" />
                </div>
             </div>
          </section>
          
          <section className="w-full py-12 md:py-16 lg:py-20 bg-muted/50">
             <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-6 w-3/4 max-w-md" />
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                   <Skeleton className="h-[225px] w-full" />
                   <Skeleton className="h-[225px] w-full hidden sm:block" />
                   <Skeleton className="h-[225px] w-full hidden lg:block" />
                </div>
             </div>
          </section>

          <section className="w-full py-12 md:py-16 lg:py-20 bg-background">
              <div className="container mx-auto px-4 md:px-6">
                  <div className="flex flex-col items-center space-y-4 text-center">
                      <Skeleton className="h-10 w-48" />
                      <Skeleton className="h-6 w-3/4 max-w-md" />
                  </div>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                      <Skeleton className="h-[400px] w-full" />
                      <Skeleton className="h-[400px] w-full hidden sm:block" />
                      <Skeleton className="h-[400px] w-full hidden lg:block" />
                  </div>
              </div>
          </section>

          <section id="chefs" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="mx-auto grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[450px] w-full" />)}
                </div>
            </div>
          </section>
        </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
              {t('discover_best_chefs')}
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              {t('discover_best_chefs_desc')}
            </p>
            <div className="w-full max-w-lg">
               <div className="relative">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-20 pointer-events-none" />
                <Input
                  type="search"
                  placeholder={t('search_placeholder')}
                  className="peer z-10 w-full rounded-full bg-background ps-12 pe-4 py-3 text-lg border-2 border-border focus:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-0 rounded-full border-2 border-primary scale-x-0 peer-focus:scale-x-100 transition-transform duration-500 ease-in-out origin-left rtl:origin-right pointer-events-none z-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {popularDishes.length > 0 && <PopularDishesCarousel dishes={popularDishes} />}
      
      {discountedDishes.length > 0 && <DiscountedDishesCarousel dishes={discountedDishes} />}

      <section id="chefs" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-headline text-3xl font-bold text-primary mb-6 text-center">{t('our_chefs_title', 'Our Talented Chefs')}</h2>
          {filteredChefs.length > 0 ? (
            <div className="mx-auto grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {filteredChefs.map((chef) => (
                <ChefCard key={chef.id} chef={chef} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border-2 border-dashed rounded-lg mt-12">
              <Users className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-medium">
                {searchQuery ? t('no_chefs_match_search') : t('no_chefs_available')}
              </h3>
              <p className="mt-2 text-md text-muted-foreground">
                {searchQuery ? t('try_different_search') : t('wait_for_chefs')}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
