
'use client';

import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const AdminNav = () => {
    const { t } = useTranslation();
    const pathname = usePathname();

    const navItems = [
      { href: '/admin/dashboard', labelKey: 'user_management' },
      { href: '/admin/approvals', labelKey: 'account_approvals' },
    ];

    return (
        <div className="border-b">
            <nav className="flex -mb-px space-x-8 rtl:space-x-reverse" aria-label="Tabs">
                {navItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            pathname === item.href
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                        )}
                    >
                        {t(item.labelKey)}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <Skeleton className="h-12 w-1/4 mb-4" />
        <Skeleton className="h-4 w-3/4 mb-8" />
        <Skeleton className="h-10 w-full max-w-sm mb-6" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">{t('admin_dashboard')}</h1>
          <p className="text-muted-foreground mb-8">{t('admin_dashboard_desc', 'Manage users and review new account applications.')}</p>
          <AdminNav />
          <div className="mt-6">
              {children}
          </div>
      </div>
  );
}
