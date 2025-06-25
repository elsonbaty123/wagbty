
'use client';
import Image from 'next/image';
import { Star, Clock } from 'lucide-react';
import { DishCard } from '@/components/dish-card';
import { allChefs, allDishes } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';

export default function ChefProfilePage() {
  const params = useParams<{ id: string }>();
  const chef = allChefs.find(c => c.id === params.id);
  
  if (!chef) {
    notFound();
  }

  const chefDishes = allDishes.filter(dish => dish.chefId === chef.id && dish.status !== 'مخفية');

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-24 text-right">
            <Image
              alt={chef.name}
              className="aspect-square w-full rounded-xl object-cover shadow-lg"
              height="400"
              src={chef.imageUrl}
              data-ai-hint="chef cooking"
              width="400"
            />
            <h1 className="font-headline text-3xl font-bold mt-4">{chef.name}</h1>
            <p className="text-lg text-primary font-semibold mt-1">{chef.specialty}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="text-sm text-muted-foreground">(24 تقييم)</span>
              <span className="font-bold text-lg">{chef.rating}</span>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="mt-4 text-muted-foreground">{chef.bio}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="font-headline text-3xl font-bold text-primary mb-6 text-right">قائمة الطعام</h2>
          <div className="grid gap-6">
            {chefDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
