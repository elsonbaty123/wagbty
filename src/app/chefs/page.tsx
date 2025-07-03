'use client';

import { ChefShowcase } from '@/components/chef-showcase';
import { getChefs } from '@/lib/actions/chef.actions';
import { User, StatusObject } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

// Define the chef type with additional properties
interface ChefWithStats extends User {
  dishCount: number;
  averageRating: number;
  experienceYears: number;
  bio?: string;
  coverImage?: string;
  status?: StatusObject;
}



export default function ChefsPage() {
  // Use a default value for translations to avoid errors
  const t = (key: string, defaultValue: string = '') => {
    try {
      const translations = require('next-intl').useTranslations('home');
      return translations(key) || defaultValue;
    } catch (e) {
      return defaultValue || key;
    }
  };
  const [chefs, setChefs] = useState<ChefWithStats[]>([] as ChefWithStats[]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        const chefsData = await getChefs();
        console.log('Fetched chefs:', chefsData); // Debug log
        setChefs(chefsData as ChefWithStats[]);
        setError(null);
      } catch (error) {
        console.error('Error loading chefs:', error);
        setError('Failed to load chefs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChefs();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!chefs || chefs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('home.top_chefs')}</h1>
        <p className="text-muted-foreground">No chefs available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-4">{t('home.top_chefs', 'Our Top Chefs')}</h1>
      <p className="text-muted-foreground text-center mb-12">{t('home.meet_our_chefs', 'Meet our talented chefs')}</p>
      
      <ChefShowcase 
        chefs={chefs} 
        title={t('home.top_chefs')}
        subtitle={t('home.meet_our_chefs')}
        showViewAll={false}
      />
    </div>
  );
}
