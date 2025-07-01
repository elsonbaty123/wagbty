
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import type { Dish } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DiscountedDish {
    dish: Dish;
    originalPrice: number;
    discountedPrice: number;
    discountPercentage: number;
}

interface DiscountedDishesCarouselProps {
  dishes: DiscountedDish[];
}

export function DiscountedDishesCarousel({ dishes }: DiscountedDishesCarouselProps) {
  const { t, i18n } = useTranslation();
  const carouselDirection = i18n.dir() === 'rtl' ? 'rtl' : 'ltr';

  if (!dishes || dishes.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-accent">
            {t('special_offers_title', 'عروض خاصة')}
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            {t('special_offers_desc', 'لا تفوّت هذه الصفقات محدودة الوقت من أفضل الطهاة لدينا!')}
          </p>
        </div>
        <div className="mt-8">
            <Carousel
                opts={{
                    align: "start",
                    loop: dishes.length > 2,
                    direction: carouselDirection,
                }}
                className="w-full max-w-5xl mx-auto"
            >
                <CarouselContent>
                    {dishes.map(({ dish, originalPrice, discountedPrice, discountPercentage }) => (
                    <CarouselItem key={dish.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1 h-full">
                          <Card className="overflow-hidden group h-full flex flex-col">
                            <Link href={`/dishes/${dish.id}`} className="block relative">
                              <CardContent className="relative flex aspect-video items-center justify-center p-0">
                                <Image
                                  src={dish.imageUrl}
                                  alt={dish.name}
                                  width={400}
                                  height={225}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  data-ai-hint="plated food"
                                />
                                <Badge variant="destructive" className="absolute top-2 end-2 text-base">
                                    -{discountPercentage}%
                                </Badge>
                              </CardContent>
                            </Link>
                            <div className="p-4 flex-grow flex flex-col">
                                <h3 className="font-headline text-xl font-bold text-primary group-hover:underline">
                                    <Link href={`/dishes/${dish.id}`}>{dish.name}</Link>
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-grow">{dish.description}</p>
                            </div>
                            <CardFooter className="p-4 bg-muted/30 flex justify-between items-center mt-auto">
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold text-accent">{discountedPrice.toFixed(2)}</p>
                                    <p className="text-md font-medium text-muted-foreground line-through">{originalPrice.toFixed(2)}</p>
                                    <p className="sr-only">{t('currency_egp')}</p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={`/order?dishId=${dish.id}`}>{t('order_now', 'اطلب الآن')}</Link>
                                </Button>
                            </CardFooter>
                          </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </div>
      </div>
    </section>
  );
}
