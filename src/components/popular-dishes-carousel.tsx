'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from "embla-carousel-autoplay";
import { useTranslation } from 'react-i18next';

import type { Dish } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

interface PopularDishesCarouselProps {
  dishes: Dish[];
}

export function PopularDishesCarousel({ dishes }: PopularDishesCarouselProps) {
  const { t, i18n } = useTranslation();
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );
  
  const carouselDirection = i18n.dir() === 'rtl' ? 'rtl' : 'ltr';

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-primary">
            {t('popular_dishes_title', 'Our Most Popular Dishes')}
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            {t('popular_dishes_desc', 'Discover the plates that our customers love the most, crafted with passion by our talented chefs.')}
          </p>
        </div>
        <div className="mt-8">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                    direction: carouselDirection,
                    speed: 15,
                }}
                plugins={[plugin.current]}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                className="w-full max-w-4xl mx-auto"
            >
                <CarouselContent>
                    {dishes.map((dish) => (
                    <CarouselItem key={dish.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Link href={`/dishes/${dish.id}`}>
                              <Card className="overflow-hidden group">
                                <CardContent className="relative flex aspect-video items-center justify-center p-0">
                                  <Image
                                    src={dish.imageUrl}
                                    alt={dish.name}
                                    width={400}
                                    height={225}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint="plated food"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                  <h3 className="absolute bottom-4 start-4 text-xl font-bold text-white font-headline drop-shadow-md">
                                    {dish.name}
                                  </h3>
                                </CardContent>
                              </Card>
                          </Link>
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
