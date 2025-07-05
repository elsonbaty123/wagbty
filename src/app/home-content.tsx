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
const heroImages = [
  'https://images.unsplash.com/photo-1504674900247-087703934869?q=80&w=2070',
  'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069',
  'https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=1998',
];

interface ChefWithStats extends User {
  dishCount: number;
  averageRating: number;
  experienceYears?: number;
}

export default function HomeContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dishes = [], orders = [], coupons = [], loading: dishesLoading } = useOrders();
  const { chefs = [], loading: authLoading } = useAuth();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const loading = dishesLoading || authLoading;
  const noData = !loading && (!dishes.length || !chefs.length);
  
  // Handle search form submission
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }, [searchQuery, router]);

  // Rest of your component code...
  // [Previous component code continues here]
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
          <div className="text-center max-w-4xl w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            
            <form 
              onSubmit={handleSearch}
              className={`flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('home.search.placeholder')}
                  className="pl-10 pr-4 py-6 text-base rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:border-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div>
              <Button 
                type="submit" 
                className="py-6 px-8 rounded-full text-base font-semibold bg-primary hover:bg-primary/90 transition-colors"
                disabled={isSearching}
              >
                {isSearching ? t('common.searching') : t('common.search')}
              </Button>
            </form>
          </div>
        </div>
        
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${heroImages[currentImageIndex]})`,
              }}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Featured Chefs */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.featured_chefs')}</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : (
            <ChefShowcase chefs={chefs.slice(0, 3)} />
          )}
        </div>
      </section>

      {/* Discounted Dishes */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.discounted_dishes')}</h2>
          <DiscountedDishesCarousel dishes={dishes.filter(dish => dish.discountPercentage > 0)} />
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FeatureHighlights />
        </div>
      </section>
    </div>
  );
}
