
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { cn } from '@/lib/utils';
import MainLayout from '@/components/main-layout';


export const metadata: Metadata = {
  title: {
    default: "Wagbty",
    template: `%s | Wagbty`,
  },
  description: "Discover the best homemade food prepared just for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const lang = cookieStore.get('i18next')?.value || 'ar';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='hsl(28 95% 53%)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='m16 2-2.3 2.3a3 3 0 0 0 0 4.2l5.4 5.4a3 3 0 0 0 4.2 0L22 13.5V6H8.5L5 2.5V2'/%3e%3cpath d='m16.5 11.5-2-2'/%3e%3cpath d='m2 16 2.3-2.3a3 3 0 0 1 4.2 0l5.4 5.4a3 3 0 0 1 0 4.2L11.5 22H6l-4-4Z'/%3e%3c/svg%3e" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Alegreya:wght@400;700&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
