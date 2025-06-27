
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { cn } from '@/lib/utils';
import MainLayout from '@/components/main-layout';


export const metadata: Metadata = {
  title: {
    default: "ChefConnect",
    template: `%s | ChefConnect`,
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
