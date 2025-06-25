
'use client';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { DishCard } from '@/components/dish-card';
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChefProfilePage() {
  const params = useParams<{ id: string }>();
  const { users, loading: authLoading } = useAuth();
  const { dishes, loading: ordersLoading } = useOrders();
  
  const chef = users.find(u => u.id === params.id && u.role === 'chef');
  
  if (authLoading || ordersLoading) {
    return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <Skeleton className="h-8 w-3/4 mt-4" />
                    <Skeleton className="h-6 w-1/2 mt-2" />
                    <Skeleton className="h-20 w-full mt-4" />
                </div>
                <div className="md:col-span-2">
                    <Skeleton className="h-10 w-48 mb-6" />
                    <div className="grid gap-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
      </div>
    );
  }

  if (!chef) {
    notFound();
  }

  const chefDishes = dishes.filter(dish => dish.chefId === chef.id && dish.status !== 'مخفية');
  
  const allRatings = chefDishes.flatMap(d => d.ratings?.map(r => r.rating) || []);
  const chefAverageRating = allRatings.length > 0
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : chef.rating || 0;
  const totalRatingsCount = allRatings.length;

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-24 text-right">
            <Image
              alt={chef.name}
              className="aspect-square w-full rounded-xl object-cover shadow-lg"
              height="400"
              src={chef.imageUrl!}
              data-ai-hint="chef cooking"
              width="400"
            />
            <h1 className="font-headline text-3xl font-bold mt-4">{chef.name}</h1>
            <p className="text-lg text-primary font-semibold mt-1">{chef.specialty}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="text-sm text-muted-foreground">({totalRatingsCount} تقييم)</span>
              <span className="font-bold text-lg">{chefAverageRating.toFixed(1)}</span>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="mt-4 text-muted-foreground">{chef.bio}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="font-headline text-3xl font-bold text-primary mb-6 text-right">قائمة الطعام</h2>
          <div className="grid gap-6">
            {chefDishes.length > 0 ? (
                chefDishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} chefName={chef.name} />
                ))
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">هذا الطاهي لم يضف أي أطباق بعد.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
