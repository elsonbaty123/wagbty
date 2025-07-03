'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { EmblaCarouselType } from 'embla-carousel';

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
  const [emblaApi, setEmblaApi] = React.useState<EmblaCarouselType | null>(null);
  const inactivityTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const autoplayPlugin = React.useRef<ReturnType<typeof Autoplay> | null>(null);
  
  // Function to start inactivity timer
  const startInactivityTimer = React.useCallback(() => {
    // Clear any existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    
    // Only set timer if we have slides
    if (dishes.length > 0) {
      inactivityTimerRef.current = setTimeout(() => {
        try {
          if (autoplayPlugin.current && emblaApi) {
            autoplayPlugin.current.play();
          }
        } catch (error) {
          console.error('Error starting autoplay:', error);
        }
      }, 2000);
    }
  }, [dishes.length, emblaApi]);
  
  // Initialize autoplay plugin only once when component mounts
  React.useEffect(() => {
    let isMounted = true;
    
    const initializeAutoplay = () => {
      if (dishes.length === 0) return;
      
      try {
        if (isMounted) {
          autoplayPlugin.current = Autoplay({ 
            delay: 4000, 
            stopOnInteraction: false, 
            stopOnMouseEnter: true,
            playOnInit: false // We'll start it manually
          });
          console.log('Autoplay plugin initialized');
        }
      } catch (error) {
        console.error('Failed to initialize autoplay plugin:', error);
        autoplayPlugin.current = null;
      }
    };
    
    // Initialize with a small delay to ensure DOM is ready
    const initTimer = setTimeout(initializeAutoplay, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      
      if (autoplayPlugin.current) {
        try {
          autoplayPlugin.current.stop();
        } catch (error) {
          console.error('Error stopping autoplay on cleanup:', error);
        } finally {
          autoplayPlugin.current = null;
        }
      }
    };
  }, [dishes.length]);
  
  // Setup embla events and autoplay
  // Setup embla events and autoplay
  React.useEffect(() => {
    if (!emblaApi) return;
    
    // Start autoplay if we have the plugin and slides
    const startAutoplay = () => {
      if (autoplayPlugin.current && dishes.length > 0) {
        try {
          autoplayPlugin.current.play();
        } catch (error) {
          console.error('Error starting autoplay on mount:', error);
        }
      }
    };

    const onPointerDown = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
    
    const onSettle = () => {
      try {
        startInactivityTimer();
      } catch (error) {
        console.error('Error in onSettle handler:', error);
      }
    };

    // Initial setup
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("settle", onSettle);
    
    // Start the autoplay after a small delay to ensure everything is ready
    const autoplayTimeout = setTimeout(() => {
      startAutoplay();
      // Initial start of the timer
      startInactivityTimer();
    }, 500);

    // Cleanup function
    return () => {
      // Clear any pending timeouts
      clearTimeout(autoplayTimeout);
      
      // Remove event listeners
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("settle", onSettle);
      
      // Clear inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      // Stop autoplay if it's running
      if (autoplayPlugin.current) {
        try {
          autoplayPlugin.current.stop();
        } catch (error) {
          console.error('Error stopping autoplay on cleanup:', error);
        }
      }
    };
  }, [emblaApi, startInactivityTimer, dishes.length]);
  
  const carouselDirection = i18n.dir() === 'rtl' ? 'rtl' : 'ltr';

  if (!dishes || dishes.length === 0) {
    return null;
  }
  
  const plugins = [];
  if (autoplayPlugin.current) {
    plugins.push(autoplayPlugin.current);
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
                setApi={setEmblaApi}
                opts={{
                    align: "start",
                    loop: dishes.length > 2,
                    direction: carouselDirection,
                }}
                plugins={plugins}
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
