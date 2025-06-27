
'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { OrderProvider } from '@/context/order-context';
import { NotificationProvider } from '@/context/notification-context';
import { ChatProvider } from '@/context/chat-context';
import { StatusProvider } from '@/context/status-context';
import { ThemeProvider } from '@/components/theme-provider';
import I18nProvider from '@/app/i18n-provider';
import { BottomNavBar } from './bottom-nav-bar';

const Header = dynamic(() => import('@/components/layout/header').then((mod) => mod.Header), {
  ssr: false,
});

const Footer = dynamic(() => import('@/components/layout/footer').then((mod) => mod.Footer), {
  ssr: false,
});


function LayoutWrapper({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const showBottomNavForUser = user && user.role === 'customer';
    
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
    
    const showBottomNav = showBottomNavForUser && !isAuthPage;

    return (
        <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className={`flex-1 ${showBottomNav ? 'pb-16 md:pb-0' : ''}`}>
                {children}
            </main>
            {/* Hide footer on all mobile screens to give space for the nav bar */}
            <div className="hidden md:block">
                <Footer />
            </div>
            {showBottomNav && <BottomNavBar />}
        </div>
    );
}

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <I18nProvider>
            <AuthProvider>
            <NotificationProvider>
                <OrderProvider>
                <ChatProvider>
                <StatusProvider>
                    <LayoutWrapper>{children}</LayoutWrapper>
                    <Toaster />
                </StatusProvider>
                </ChatProvider>
                </OrderProvider>
            </NotificationProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
    )
}
