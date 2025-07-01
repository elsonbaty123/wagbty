
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from 'react-i18next';

export function DeliveryBottomNavBar() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading || !user || user.role !== 'delivery') {
    return null;
  }
  
  const navItems = [
    { href: '/delivery/dashboard', icon: LayoutDashboard, labelKey: 'nav_delivery_dashboard', isActive: pathname.startsWith('/delivery') },
    { href: '/settings', icon: UserIcon, labelKey: 'nav_account', isActive: pathname === '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 z-40 w-full border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-2 items-center">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 hover:scale-110 active:scale-100',
              item.isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{t(item.labelKey, item.labelKey.replace('nav_',''))}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
