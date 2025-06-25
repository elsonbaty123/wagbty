
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Dish } from '@/lib/types';
import Link from 'next/link';
import { Clock, ChefHat, Star } from 'lucide-react';
import { Badge } from './ui/badge';

interface DishCardProps {
  dish: Dish;
  chefName: string;
}

export function DishCard({ dish, chefName }: DishCardProps) {
  const isAvailable = dish.status === 'متوفرة';

  const ratingsCount = dish.ratings?.length || 0;
  const averageRating = ratingsCount > 0
    ? dish.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingsCount
    : 0;

  return (
    <Card className="flex flex-col text-right overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/dishes/${dish.id}`}>
          <Image
            alt={dish.name}
            className="aspect-video w-full rounded-t-lg object-cover"
            height="225"
            src={dish.imageUrl}
            data-ai-hint="plated food"
            width="400"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className='flex justify-between items-start'>
          <Link href={`/dishes/${dish.id}`} className="hover:text-primary transition-colors">
            <CardTitle className="font-headline text-xl">{dish.name}</CardTitle>
          </Link>
          <Badge variant="secondary">{dish.category}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-2 justify-end">
            <span className="text-sm text-muted-foreground">بواسطة الشيف: {chefName}</span>
            <ChefHat className="w-4 h-4 text-muted-foreground" />
        </div>
        <CardDescription className="mt-2 text-sm text-muted-foreground min-h-[40px]">{dish.description}</CardDescription>
        
        <div className="flex items-center justify-between mt-2">
            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <span>~{dish.prepTime} دقيقة</span>
                <Clock className="w-4 h-4" />
            </div>
            {ratingsCount > 0 && (
                 <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">({ratingsCount})</span>
                    <span className="font-bold text-sm">{averageRating.toFixed(1)}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center bg-muted/50 mt-auto">
        <p className="text-lg font-bold text-primary">{dish.price.toFixed(2)} جنيه</p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:bg-muted disabled:text-muted-foreground" disabled={!isAvailable}>
          <Link href={`/order?dishId=${dish.id}`}>{isAvailable ? 'اطلب الآن' : 'غير متوفر حالياً'}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
