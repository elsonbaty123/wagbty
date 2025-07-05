"use client";

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

type Benefit = {
  icon: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
};

const BENEFITS: Benefit[] = [
  {
    icon: "🍽️",
    title: "تجربة طعام استثنائية",
    description: "استمتع بألذ الأطباق المحضرة بأيدي أمهر الطهاة",
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  {
    icon: "⚡",
    title: "سرعة في التوصيل",
    description: "نضمن وصول طلبك ساخنًا وطازجًا في أسرع وقت",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    icon: "🎁",
    title: "عروض حصرية",
    description: "احصل على خصومات وعروض خاصة لأعضائنا الكرام",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  }
];

export default function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [startY, setStartY] = useState(0);
  const { theme } = useTheme();

  // Handle touch events for better mobile interaction
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const scrollContainer = e.currentTarget as HTMLElement;
    const scrolledToBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 1;
    
    // Allow normal scrolling within the container
    if (scrollContainer.scrollTop > 0 || !scrolledToBottom) {
      return;
    }
    
    const y = touch.clientY;
    const diff = y - startY;
    
    // Only prevent default when at the top and trying to scroll down
    if (diff > 0 && scrollContainer.scrollTop <= 0) {
      e.preventDefault();
    }
    
    // Swipe down to dismiss when at the top
    if (diff > 50 && scrollContainer.scrollTop === 0) {
      handleGetStarted();
    }
  }, [startY]);

  // Auto-scroll to top when navigating between slides
  const scrollContainerRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      node.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const hasSeen = localStorage.getItem("wagbty_seen_welcome");
    if (!hasSeen) {
      setIsMounted(true);
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGetStarted = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wagbty_seen_welcome", "true");
    }
    setIsVisible(false);
    setTimeout(() => setIsMounted(false), 500);
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] overflow-y-auto bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 text-center transition-colors duration-300"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          ref={scrollContainerRef}
        >
          <div className="min-h-screen flex flex-col items-center pt-16 pb-16 px-4 md:px-6">
            {/* Theme Toggle for testing - can be removed in production */}
            <div className="fixed top-4 left-4 z-50">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => document.documentElement.classList.toggle('dark')}
                className="text-xs p-2 h-8"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </Button>
            </div>
            {/* Logo */}
            {/* Logo */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 w-full flex justify-center"
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <img
                  src="/logo.svg"
                  alt="شعار وجبتي"
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
            </motion.div>

            {/* Welcome Message */}
            {/* Welcome Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="w-full text-center mb-12"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-4">
                مرحباً بك في <span className="text-primary">وجبتي</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-md mx-auto">
                اكتشف عالمًا من النكهات الشهية بين يديك
              </p>
            </motion.div>

          {/* Benefits */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.3
                }
              }
            }}
            className="w-full max-w-5xl mx-auto mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={index}
                role="button"
                tabIndex={0}
                aria-label={`ميزة ${benefit.title}`}
                variants={{
                  hidden: { 
                    y: 40, 
                    opacity: 0,
                    scale: 0.8
                  },
                  visible: {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    transition: {
                      type: "spring",
                      damping: 15,
                      stiffness: 100
                    }
                  },
                  hover: {
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    transition: {
                      duration: 0.3
                    }
                  },
                  tap: {
                    scale: 0.96,
                    boxShadow: "0 5px 15px -5px rgba(0, 0, 0, 0.1)",
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }
                  }
                }}
                whileHover="hover"
                whileTap="tap"
                className={`rounded-2xl p-6 shadow-sm transition-all dark:bg-opacity-20 ${benefit.bgColor} transform duration-300 cursor-pointer select-none active:outline-none focus:outline-none`}
                onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                  // Add ripple effect
                  const button = document.getElementById(`benefit-${index}`);
                  if (button) {
                    const ripple = document.createElement('span');
                    const rect = button.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = event.clientX - rect.left - size / 2;
                    const y = event.clientY - rect.top - size / 2;
                    
                    ripple.style.width = ripple.style.height = `${size}px`;
                    ripple.style.left = `${x}px`;
                    ripple.style.top = `${y}px`;
                    ripple.style.opacity = '0.3';
                    ripple.style.borderRadius = '50%';
                    ripple.style.position = 'absolute';
                    ripple.style.background = 'rgba(255, 255, 255, 0.7)';
                    ripple.style.transform = 'scale(0)';
                    ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
                    
                    button.appendChild(ripple);
                    
                    setTimeout(() => {
                      ripple.style.transform = 'scale(4)';
                      ripple.style.opacity = '0';
                    }, 10);
                    
                    setTimeout(() => {
                      ripple.remove();
                    }, 600);
                  }
                }}
                id={`benefit-${index}`}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.5 + (index * 0.1),
                    type: "spring",
                    stiffness: 200,
                    damping: 10
                  }}
                  className={`mb-4 text-5xl ${benefit.color}`}
                >
                  {benefit.icon}
                </motion.div>
                <motion.h3 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + (index * 0.1) }}
                  className={`mb-3 font-headline text-xl font-bold ${benefit.color}`}
                >
                  {benefit.title}
                </motion.h3>
                <motion.p 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + (index * 0.1) }}
                  className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base"
                >
                  {benefit.description}
                </motion.p>
              </motion.div>
            ))}
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-4"
          >
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="h-14 rounded-full bg-gradient-to-r from-primary to-primary/90 dark:from-primary/90 dark:to-primary/80 px-10 text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
            >
              ابدأ رحلتك الآن
            </Button>
          </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
