'use client';

import { motion } from 'framer-motion';
import { Star, Utensils, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
// Context imports removed since they're not being used
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { User } from '@/lib/types';
import React from 'react';

interface ChefShowcaseProps {
  chefs: (User & { 
    dishCount: number; 
    averageRating: number; 
    experienceYears?: number;
    bio?: string;
    coverImage?: string;
    status?: {
      id: string;
      type: 'image' | 'video';
      imageUrl: string;
      caption?: string;
      createdAt: string;
    };
  })[];
  title: string;
  subtitle: string;
  showViewAll?: boolean;
}

export function ChefShowcase({ 
  chefs, 
  title = 'Our Top Chefs', 
  subtitle = 'Meet our talented chefs',
  showViewAll = true
}: ChefShowcaseProps) {
  // Remove useTranslations since we're not using it anymore
  // All text will be passed as props from the parent component

  if (!chefs?.length) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-accent/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <motion.div 
          className="text-center mb-12 md:mb-16 lg:mb-20 relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          <motion.span 
            className="inline-block mb-3 text-sm font-semibold text-primary tracking-wider uppercase"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span>{title || 'Our Team'}</span>
          </motion.span>
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {title}
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {chefs.map((chef, index) => (
            <motion.div
              key={chef.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }
              }}
            >
              <ChefCard chef={chef} index={index} />
            </motion.div>
          ))}
        </motion.div>

        {showViewAll && (
          <motion.div 
            className="mt-12 md:mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link 
              href="/chefs"
              className="group inline-flex items-center px-8 py-3.5 text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-primary to-amber-600 hover:from-amber-600 hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/80 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="relative">
                <span className="absolute -inset-1 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span>
                  <span>View All Chefs</span>
                </span>
              </span>
              <svg className="ml-3 -mr-1 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

interface ChefCardProps {
  chef: User & { 
    dishCount: number; 
    averageRating: number; 
    experienceYears?: number;
    bio?: string;
    coverImage?: string;
    status?: {
      id: string;
      type: 'image' | 'video';
      imageUrl: string;
      caption?: string;
      createdAt: string;
    };
  };
  index: number;
}

function ChefCard({ chef, index }: ChefCardProps) {
  // Simplified status handling since we don't have the full context
  const hasUnreadStatus = false;

  const getStatusInfo = () => {
    if (!chef.status) return { 
      text: 'Available', 
      color: 'bg-green-100 text-green-800',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    };
    
    const statusText = chef.status.caption?.toLowerCase() || '';
    
    if (statusText.includes('busy')) {
      return { 
        text: 'Busy', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      };
    }
    
    if (statusText.includes('closed') || statusText.includes('offline')) {
      return { 
        text: 'Closed', 
        color: 'bg-red-100 text-red-800',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      };
    }
    
    // Default to available
    return { 
      text: 'Available', 
      color: 'bg-green-100 text-green-800',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    };
  };
  
  const statusInfo = getStatusInfo();
  const isStatusActive = chef.status && (new Date().getTime() - new Date(chef.status.createdAt).getTime()) < 24 * 60 * 60 * 1000;
  // Simplified status handling - in a real app, you'd want to implement proper status tracking
  const showStatusIndicator = isStatusActive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: index * 0.07,
        duration: 0.5 
      }}
      className="group h-full"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 border-border/50 hover:shadow-lg hover:shadow-primary/5 relative group-hover:border-primary/30">
        {/* Header with chef image */}
        <div className="relative h-48 bg-muted/30 overflow-hidden group-hover:bg-muted/10 transition-colors duration-300">
          <Image
            src={chef.coverImage || '/images/chef-cover.jpg'}
            alt={chef.name}
            width={400}
            height={200}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          
          {/* Status Badge */}
          {statusInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              title={statusInfo.text}
            >
              <Badge className={cn(
                "absolute top-3 right-3 border-none font-medium flex items-center gap-1.5 px-3 py-1.5",
                statusInfo.color,
                "shadow-md"
              )}>
                {statusInfo.icon}
                <span className="text-xs">{statusInfo.text}</span>
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Chef Avatar */}
        <div className="px-6 -mt-12 relative z-10 transform transition-transform duration-500 group-hover:-translate-y-1">
          <div className="flex justify-center">
            {isStatusActive ? (
              <Dialog>
                <DialogTrigger asChild>
                  <div className={cn(
                    "relative cursor-pointer rounded-full border-4 border-background bg-background",
                    "transition-transform duration-300 hover:scale-105",
                    showStatusIndicator ? "ring-2 ring-green-500 ring-offset-2" : ""
                  )}>
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={chef.imageUrl} alt={chef.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {chef.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {showStatusIndicator && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                </DialogTrigger>
                <div>Status Viewer Placeholder</div>
              </Dialog>
            ) : (
              <Link href={`/chefs/${chef.id}`} className="block">
                <Avatar className="h-20 w-20 border-4 border-background hover:scale-105 transition-transform">
                  <AvatarImage src={chef.imageUrl} alt={chef.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {chef.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        </div>

        {/* Chef Info */}
        <CardContent className="pt-4 pb-6 px-6 text-center transition-colors duration-300 group-hover:bg-muted/5">
          <Link href={`/chefs/${chef.id}`} className="inline-block">
            <h3 className="text-xl font-bold mb-1 text-foreground hover:text-primary transition-colors">
              {chef.name}
            </h3>
          </Link>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="ml-1">{statusInfo.text}</span>
          </span>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
            {chef.bio || 'Passionate about creating delicious meals'}
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-medium text-sm text-amber-800 dark:text-amber-200">
                {chef.averageRating > 0 ? chef.averageRating.toFixed(1) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/5 text-primary px-2 py-1 rounded-md">
              <Utensils className="h-4 w-4" />
              <span className="text-sm font-medium">{chef.dishCount} dishes</span>
            </div>
            {(chef.experienceYears && chef.experienceYears > 0) && (
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-md">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{chef.experienceYears}+ years</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/50 px-6 py-4 bg-muted/20 group-hover:bg-muted/30 transition-colors">
          <Link 
            href={`/chefs/${chef.id}`}
            className="w-full py-2.5 px-4 text-center text-sm font-medium bg-primary/5 hover:bg-primary/10 text-primary rounded-md transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3 group-hover:bg-primary/10 group-hover:text-primary/90"
          >
            <span>View Profile</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
