
'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { OrderProvider } from '@/context/order-context';
import { NotificationProvider } from '@/context/notification-context';
import { ChatProvider } from '@/context/chat-context';
import { ThemeProvider } from '@/components/theme-provider';
import I18nProvider from '@/app/i18n-provider';

const Header = dynamic(() => import('@/components/layout/header').then((mod) => mod.Header), {
  ssr: false,
});

const Footer = dynamic(() => import('@/components/layout/footer').then((mod) => mod.Footer), {
  ssr: false,
});

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
                    <div className="relative flex min-h-screen flex-col">
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                    <Toaster />
                </ChatProvider>
                </OrderProvider>
            </NotificationProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
    )
}
