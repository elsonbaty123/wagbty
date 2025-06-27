
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageSquare, User as UserIcon, Settings, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from 'react-i18next';

export function BottomNavBar() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading || !user || user.role !== 'customer') {
    return null;
  }
  
  const navItems = [
    { href: '/', icon: Home, labelKey: 'nav_home', isActive: pathname === '/' },
    { href: '/favorites', icon: Heart, labelKey: 'nav_favorites', isActive: pathname === '/favorites' },
    { href: '/community', icon: MessageSquare, labelKey: 'nav_community', isActive: pathname === '/community' },
    { href: '/profile', icon: Utensils, labelKey: 'nav_orders', isActive: pathname === '/profile' },
    { href: '/settings', icon: UserIcon, labelKey: 'nav_account', isActive: pathname === '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 z-40 w-full border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-5 items-center">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
              item.isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{t(item.labelKey)}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
