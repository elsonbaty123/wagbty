
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Utensils, BookMarked, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from 'react-i18next';

export function ChefBottomNavBar() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading || !user || user.role !== 'chef') {
    return null;
  }
  
  const navItems = [
    { href: '/chef/dashboard', icon: LayoutDashboard, labelKey: 'nav_chef_overview' },
    { href: '/chef/orders', icon: Utensils, labelKey: 'nav_chef_orders' },
    { href: '/chef/menu', icon: BookMarked, labelKey: 'nav_chef_menu' },
    { href: '/settings', icon: UserIcon, labelKey: 'nav_account' },
  ];

  return (
    <nav className="fixed bottom-0 z-40 w-full border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-4 items-center">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 hover:scale-110 active:scale-100',
              pathname === item.href ? 'text-primary' : 'text-muted-foreground hover:text-primary'
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
