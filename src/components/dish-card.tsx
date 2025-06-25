
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Dish } from '@/lib/types';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Badge } from './ui/badge';

interface DishCardProps {
  dish: Dish;
}

export function DishCard({ dish }: DishCardProps) {
  const isAvailable = dish.status === 'متوفرة';

  return (
    <Card className="flex flex-col text-right">
      <CardHeader className="p-0">
        <Image
          alt={dish.name}
          className="aspect-video w-full rounded-t-lg object-cover"
          height="225"
          src={dish.imageUrl}
          data-ai-hint="plated food"
          width="400"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className='flex justify-between items-start'>
            <CardTitle className="font-headline text-xl">{dish.name}</CardTitle>
            <Badge variant="secondary">{dish.category}</Badge>
        </div>
        <CardDescription className="mt-2 text-sm text-muted-foreground min-h-[40px]">{dish.description}</CardDescription>
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mt-2">
            <span>~{dish.prepTime} دقيقة</span>
            <Clock className="w-4 h-4" />
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">{dish.price.toFixed(2)} جنيه</p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:bg-muted disabled:text-muted-foreground" disabled={!isAvailable}>
          <Link href={`/order?dishId=${dish.id}`}>{isAvailable ? 'اطلب الآن' : 'غير متوفر حالياً'}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
