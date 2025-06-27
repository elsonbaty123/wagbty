
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Heart, MessageSquare, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from 'react-i18next';

export function BottomNavBar() {
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (loading || !user || user.role !== 'customer') {
    return null;
  }
  
  const isProfilePage = pathname === '/profile';
  const isFavoritesTab = searchParams.get('tab') === 'favorites';
  const isProfileActive = isProfilePage && !isFavoritesTab;

  const navItems = [
    { href: '/', icon: Home, labelKey: 'home', isActive: pathname === '/' },
    { href: '/profile?tab=favorites', icon: Heart, labelKey: 'my_favorites', isActive: isProfilePage && isFavoritesTab },
    { href: '/community', icon: MessageSquare, labelKey: 'community', isActive: pathname === '/community' },
    { href: '/profile', icon: UserIcon, labelKey: 'my_profile', isActive: isProfileActive },
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
            <span>{
                item.labelKey === 'my_favorites' && i18n.language === 'ar' ? 'مفضلتي' : t(item.labelKey)
            }</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
