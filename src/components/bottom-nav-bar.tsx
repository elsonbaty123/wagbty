
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Heart, Package, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from 'react-i18next';

export function BottomNavBar() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (loading || !user || user.role !== 'customer') {
    return null;
  }
  
  const isFavoritesActive = pathname === '/profile' && searchParams.get('tab') === 'favorites';
  const isOrdersActive = pathname === '/profile' && searchParams.get('tab') !== 'favorites';

  const navItems = [
    { href: '/', icon: Home, labelKey: 'home', isActive: pathname === '/' },
    { href: '/profile?tab=favorites', icon: Heart, labelKey: 'my_favorites', isActive: isFavoritesActive },
    { href: '/profile', icon: Package, labelKey: 'my_orders', isActive: isOrdersActive },
    { href: '/settings', icon: UserIcon, labelKey: 'account_settings', isActive: pathname === '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 z-40 w-full border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-4 items-center">
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
