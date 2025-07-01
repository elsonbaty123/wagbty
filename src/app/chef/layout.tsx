'use client';

import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const ChefNav = () => {
    const { t, i18n } = useTranslation();
    const pathname = usePathname();

    const navItems = [
      { href: '/chef/dashboard', labelKey: 'overview' },
      { href: '/chef/orders', labelKey: 'orders' },
      { href: '/chef/menu', labelKey: 'menu' },
      { href: '/chef/status', labelKey: 'status' },
      { href: '/chef/coupons', labelKey: 'coupons' },
    ];
    const renderedNavItems = i18n.dir() === 'rtl' ? [...navItems].reverse() : navItems;

    return (
        <div className={cn("flex mb-6", i18n.dir() === 'rtl' ? "justify-end" : "justify-start")}>
            <div className="grid h-auto grid-cols-2 p-1 sm:flex sm:flex-nowrap gap-1 bg-muted rounded-md text-muted-foreground overflow-x-auto">
                {renderedNavItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            pathname === item.href ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50'
                        )}
                    >
                        {t(item.labelKey)}
                    </Link>
                ))}
            </div>
        </div>
    );
};


export default function ChefLayout({ children }: { children: React.ReactNode; }) {
    const { t } = useTranslation();
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'chef')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'chef') {
        return (
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
                <Skeleton className="h-12 w-64 mb-8" />
                <Skeleton className="h-10 w-full max-w-lg mb-6" />
                <Skeleton className="h-[500px] w-full" />
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary rtl:text-right">{t('chef_dashboard_title')}</h1>
                <p className="font-semibold text-lg rtl:text-right">{t('welcome_back', {name: user.name})}</p>
            </div>
            <ChefNav />
            {children}
        </div>
    );
}
