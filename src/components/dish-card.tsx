import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Dish } from '@/lib/types';
import Link from 'next/link';

interface DishCardProps {
  dish: Dish;
}

export function DishCard({ dish }: DishCardProps) {
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
        <CardTitle className="font-headline text-xl">{dish.name}</CardTitle>
        <CardDescription className="mt-2 text-sm text-muted-foreground">{dish.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">${dish.price.toFixed(2)}</p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/order?dishId=${dish.id}`}>اطلب الآن</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
