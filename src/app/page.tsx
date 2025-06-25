
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { DishCard } from '@/components/dish-card';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import { Utensils, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { dishes, loading: dishesLoading } = useOrders();
  const { users, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const loading = dishesLoading || authLoading;

  const availableDishes = dishes.filter(d => d.status === 'متوفرة');

  const filteredDishes = searchQuery
    ? availableDishes.filter(dish =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getChefName(dish.chefId).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableDishes;

  function getChefName(chefId: string) {
    const chef = users.find(u => u.id === chefId);
    return chef ? chef.name : 'طاهٍ غير معروف';
  }

  return (
    <div className="flex flex-col">
      <section className="w-full py-12 md:py-20 lg:py-28 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
              ابحث عن وجبتك المفضلة
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              استكشف مجموعة متنوعة من الأطباق الشهية التي أعدها أفضل الطهاة في منطقتك.
            </p>
            <div className="w-full max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="ابحث عن طبق، وصف، أو حتى اسم طاهٍ..."
                  className="w-full rounded-full bg-background pl-10 pr-4 py-2 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dishes" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
            <div className="mx-auto grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
          ) : filteredDishes.length > 0 ? (
            <div className="mx-auto grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {filteredDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} chefName={getChefName(dish.chefId)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border-2 border-dashed rounded-lg mt-12">
              <Utensils className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-medium">
                {searchQuery ? 'لا توجد نتائج بحث مطابقة' : 'لا توجد أطباق متاحة حالياً'}
              </h3>
              <p className="mt-2 text-md text-muted-foreground">
                {searchQuery ? 'جرّب كلمات بحث أخرى.' : 'يرجى التحقق مرة أخرى قريباً!'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
