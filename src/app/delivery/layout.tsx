
'use client';

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'delivery')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'delivery') {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-12 w-1/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary rtl:text-right">{t('delivery_dashboard_title', 'Delivery Dashboard')}</h1>
            <p className="font-semibold text-lg rtl:text-right">{t('welcome_back', {name: user.name})}</p>
        </div>
        {children}
    </div>
  );
}
