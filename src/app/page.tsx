'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChefShowcase } from '@/components/chef-showcase';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import { Search, Users, Clock, Shield, Truck, Utensils, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureHighlights } from '@/components/home/FeatureHighlights';
import { DiscountedDishesCarousel } from '@/components/discounted-dishes-carousel';
import type { Dish, User, UserRole, Coupon } from '@/lib/types';

// Sample hero images (replace with your actual image paths)
const fallbackHeroImages = [
  'https://images.unsplash.com/photo-1504674900247-087703934869?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1498579150354-977475b7f386?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1506368083636-6defb67639b2?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1551348509-953b503ef59b?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1600891964373-8a1e24cc2705?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1544510808-96f01d366116?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1576866209830-aadc3a36db40?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1448907503123-67254d59ca4a?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1457423404272-5a80ae0e1251?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1481931715705-36f1df2d46f2?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1529189451916-c988f0f0a284?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1532768641073-503a250f9754?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1523906834658-6e24ef6b9b96?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1589927986089-35812388d1e7?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1556909158-325220c86715?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1504674900247-087703934869?auto=format&fit=crop&w=2100&q=80',
  'https://images.unsplash.com/photo-1521302084564-659aa84f986d?auto=format&fit=crop&w=2100&q=80',
];

interface ChefWithStats extends User {
  dishCount: number;
  averageRating: number;
  experienceYears?: number;
}

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dishes = [], orders = [], coupons = [], loading: dishesLoading } = useOrders();
  const { chefs = [], loading: authLoading } = useAuth();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(() => {
    return Math.floor(Math.random() * fallbackHeroImages.length);
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Dynamic hero images loaded from /api/hero-images (fallback to Unsplash list)
  const [heroImages, setHeroImages] = useState<string[]>(fallbackHeroImages);
  
  // Fetch images residing in /public/hero on first client render
  useEffect(() => {
    fetch('/api/hero-images')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (Array.isArray(data.images) && data.images.length > 0) {
          setHeroImages(data.images);
        }
      })
      .catch(() => {
        /* Keep fallback list on any error */
      });
  }, []);
  
  const loading = dishesLoading || authLoading;
  const noData = !loading && (!dishes.length || !chefs.length);
  
  // Track which hero images are fully loaded to avoid showing blank frames
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  // Preload hero images whenever list changes
  useEffect(() => {
    if (!heroImages.length) return;

    // Reset loaded array to match new list length
    setImagesLoaded(new Array(heroImages.length).fill(false));

    heroImages.forEach((src, idx) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImagesLoaded((prev) => {
          const updated = [...prev];
          updated[idx] = true;
          return updated;
        });
      };
    });
  }, [heroImages]);

  // Ensure index is valid when heroImages list changes
  useEffect(() => {
    if (heroImages.length) {
      const randomIdx = Math.floor(Math.random() * heroImages.length);
      setCurrentImageIndex(randomIdx);
    }
  }, [heroImages]);
  
  // Handle search form submission
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }, [searchQuery, router]);
  
  // Scroll to section helper
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Auto-rotate hero images randomly (only among loaded ones)
  useEffect(() => {
    if (!heroImages.length) return;

    const timer = setInterval(() => {
      setCurrentImageIndex(prev => {
        // indices of images that are fully loaded
        const loadedIndices = heroImages
          .map((_, idx) => idx)
          .filter(idx => imagesLoaded[idx]);

        if (loadedIndices.length === 0) return prev;

        // Exclude current index if we have more than one candidate
        const candidates = loadedIndices.length > 1
          ? loadedIndices.filter(idx => idx !== prev)
          : loadedIndices;

        const randomIdx = candidates[Math.floor(Math.random() * candidates.length)];
        return randomIdx;
      });
    }, 7000); // 7-second interval

    return () => clearInterval(timer);
  }, [imagesLoaded, heroImages]);
  
  // Get popular dishes (most ordered in the last week)
  const popularDishes = useMemo(() => {
    if (!orders?.length || !dishes?.length) return [];
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const dishOrderCounts = new Map<string, number>();
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate < oneWeekAgo) return;
      
      // Since Order type has a single dish, we'll use that instead of items array
      if (order.dish?.id) {
        dishOrderCounts.set(
          order.dish.id, 
          (dishOrderCounts.get(order.dish.id) || 0) + (order.quantity || 1)
        );
      }
    });
    
    return Array.from(dishOrderCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([dishId]) => dishes.find(dish => dish.id === dishId))
      .filter((dish): dish is Dish => dish !== undefined);
  }, [dishes, orders]);
  
  // Get top-rated dishes
  const topRatedDishes = useMemo(() => {
    return [...dishes]
      .filter(dish => {
        if (!dish.ratings?.length) return false;
        const avgRating = dish.ratings.reduce((sum, r) => sum + r.rating, 0) / dish.ratings.length;
        return avgRating >= 4.5;
      })
      .sort((a, b) => {
        const avgRatingA = a.ratings?.length 
          ? a.ratings.reduce((sum, r) => sum + r.rating, 0) / a.ratings.length 
          : 0;
        const avgRatingB = b.ratings?.length 
          ? b.ratings.reduce((sum, r) => sum + r.rating, 0) / b.ratings.length 
          : 0;
        return avgRatingB - avgRatingA;
      })
      .slice(0, 10);
  }, [dishes]);
  
  // Get discounted dishes with their discount information
  const discountedDishes = useMemo(() => {
    if (!dishes?.length || !coupons?.length) return [];
    
    const now = new Date();
    return dishes
      .map(dish => {
        // Find the best applicable coupon for this dish
        const bestCoupon = coupons
          .filter(coupon => {
            if (!coupon.endDate || !coupon.isActive) return false;
            if (new Date(coupon.endDate) <= now) return false;
            return coupon.appliesTo === 'all' || 
                   (coupon.applicableDishIds && coupon.applicableDishIds.includes(dish.id));
          })
          .sort((a, b) => b.discountValue - a.discountValue)[0];
        
        if (!bestCoupon) return null;
        
        const discountPercentage = bestCoupon.discountType === 'percentage' 
          ? bestCoupon.discountValue 
          : (bestCoupon.discountValue / dish.price) * 100;
        
        const discountedPrice = bestCoupon.discountType === 'percentage'
          ? dish.price * (1 - bestCoupon.discountValue / 100)
          : Math.max(0, dish.price - bestCoupon.discountValue);
        
        return {
          dish,
          originalPrice: dish.price,
          discountedPrice: parseFloat(discountedPrice.toFixed(2)),
          discountPercentage: parseFloat(discountPercentage.toFixed(1))
        };
      })
      .filter((dish): dish is NonNullable<typeof dish> => dish !== null)
      .sort((a, b) => b.discountPercentage - a.discountPercentage);
  }, [dishes, coupons]);
  
  // Get top chefs (based on number of dishes and ratings)
  const topChefs = useMemo(() => {
    return chefs
      .filter(chef => {
        if (chef.role !== 'chef') return false;
        const chefDishes = dishes.filter(dish => dish.chefId === chef.id);
        const totalRatings = chefDishes.flatMap(d => d.ratings || []);
        const avgRating = totalRatings.length > 0 
          ? totalRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings.length 
          : 0;
        return avgRating >= 4.0;
      })
      .map(chef => {
        const chefDishes = dishes.filter(dish => dish.chefId === chef.id);
        const totalRatings = chefDishes.flatMap(d => d.ratings || []);
        const avgRating = totalRatings.length > 0 
          ? totalRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings.length 
          : 0;
          
        return {
          ...chef,
          dishCount: chefDishes.length,
          averageRating: avgRating
        };
      })
      .sort((a, b) => b.averageRating * Math.log(a.dishCount + 1) - a.averageRating * Math.log(b.dishCount + 1))
      .slice(0, 8);
  }, [chefs, dishes]);
  
  // Get chefs with their stats
  const chefsWithStats = useMemo<ChefWithStats[]>(() => {
    return chefs
      .filter((chef): chef is User => chef !== null)
      .map(chef => {
        const chefDishes = dishes.filter(dish => dish.chefId === chef.id);
        const allRatings = chefDishes.flatMap(dish => dish.ratings || []);
        
        const averageRating = allRatings.length > 0 
          ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length 
          : 0;
        
        return {
          ...chef,
          dishCount: chefDishes.length,
          averageRating,
        };
      })
      .filter(chef => chef.dishCount > 0) // Only show chefs with dishes
      .sort((a, b) => b.averageRating - a.averageRating); // Sort by rating
  }, [chefs, dishes]);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // No data state
  if (noData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">
            {t('no_data_available', 'No data available')}
          </h1>
          <p className="text-muted-foreground">
            {t('check_back_later', 'Please check back later')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence>
            <motion.div
              key={currentImageIndex}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${heroImages[currentImageIndex]})`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
          <>
             <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent" />
             <div className="absolute inset-0 bg-gradient-radial from-primary/40 via-transparent to-transparent mix-blend-multiply" />
           </>
        </div>

        <div className="container mx-auto px-4 z-10 text-center text-white">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {t('home.hero.title', 'Delicious Food Delivered To Your Door')}
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('home.hero.subtitle', 'Order from the best restaurants in town and enjoy your meal at home')}
          </motion.p>
          
          <motion.div
            className="max-w-2xl mx-auto relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder={t('search.placeholder', 'Search for dishes, cuisines, or restaurants')}
                className="w-full py-6 px-6 pr-16 rounded-full text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full"
                size="icon"
                disabled={isSearching}
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>

             {/* Call to Action Buttons */}
             <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button
                 size="lg"
                 className="px-8 py-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/40"
                 onClick={() => router.push('/order')}
               >
                 {t('home.order_now', 'اطلب الآن')}
               </Button>
               <Button
                 size="lg"
                 variant="outline"
                 className="px-8 py-4 text-white border-white/70 hover:bg-white/10"
                 onClick={() => scrollToSection('popular-dishes')}
               >
                 {t('home.browse_menu', 'عرض القائمة')}
               </Button>
             </div>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
            onClick={() => scrollToSection('featured')}
            initial={{ y: 0 }}
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="h-8 w-8 text-white" />
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="featured" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <FeatureHighlights />
        </div>
      </section>

      {/* Popular Dishes */}
      <section id="popular-dishes" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {t('home.popular_dishes', 'Popular Dishes')}
          </h2>
          {popularDishes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularDishes.map((dish) => (
                <motion.div
                  key={dish.id}
                  className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  whileHover={{ y: -5 }}
                >
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${dish.imageUrl})` }} />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{dish.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{dish.description}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="font-bold">${dish.price.toFixed(2)}</span>
                      <Button size="sm">
                        {t('common.add_to_cart', 'Add to Cart')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {t('home.no_popular_dishes', 'No popular dishes available at the moment')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Top Chefs */}
      <ChefShowcase 
        chefs={chefsWithStats.slice(0, 4).map(chef => ({
          ...chef,
          dishCount: chef.dishCount,
          averageRating: chef.averageRating,
          experienceYears: chef.experienceYears || 0
        }))}
        title="home.top_chefs"
        subtitle="home.meet_our_chefs"
      />

      {/* Special Offers */}
      {discountedDishes.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {t('home.special_offers', 'Special Offers')}
            </h2>
            <DiscountedDishesCarousel dishes={discountedDishes} />
          </div>
        </section>
      )}
    </div>
  );
}
