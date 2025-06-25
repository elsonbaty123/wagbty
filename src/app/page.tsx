
'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ChefCard } from '@/components/chef-card';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import { Users, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/types';

export default function Home() {
  const { dishes, loading: dishesLoading } = useOrders();
  const { chefs, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const loading = dishesLoading || authLoading;

  const chefsWithDishData = useMemo(() => {
    return chefs.map(chef => {
      const chefDishes = dishes.filter(dish => dish.chefId === chef.id && dish.status !== 'مخفية');
      const allRatings = chefDishes.flatMap(d => d.ratings?.map(r => r.rating) || []);
      const averageRating = allRatings.length > 0
        ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
        : chef.rating || 0; // fallback to chef's base rating

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

  return (
    <div className="flex flex-col">
      <section className="w-full py-12 md:py-20 lg:py-28 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
              اكتشف أفضل الطهاة في منطقتك
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              تصفح مجموعة من الطهاة الموهوبين واستكشف وجباتهم المميزة.
            </p>
            <div className="w-full max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="ابحث عن طاهٍ أو تخصص..."
                  className="w-full rounded-full bg-background pl-10 pr-4 py-2 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="chefs" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
            <div className="mx-auto grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[450px] w-full" />)}
            </div>
          ) : filteredChefs.length > 0 ? (
            <div className="mx-auto grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {filteredChefs.map((chef) => (
                <ChefCard key={chef.id} chef={chef} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border-2 border-dashed rounded-lg mt-12">
              <Users className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-medium">
                {searchQuery ? 'لا يوجد طهاة مطابقون لبحثك' : 'لا يوجد طهاة متاحون حالياً'}
              </h3>
              <p className="mt-2 text-md text-muted-foreground">
                {searchQuery ? 'جرّب كلمات بحث أخرى.' : 'انتظر طهاتنا المبدعين للانضمام!'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
