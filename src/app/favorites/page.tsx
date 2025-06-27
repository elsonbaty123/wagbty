
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DishCard } from '@/components/dish-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FavoritesPage() {
    const { t } = useTranslation();
    const { user, chefs, loading } = useAuth();
    const { dishes, loading: ordersLoading } = useOrders();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'customer')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || ordersLoading || !user) {
        return (
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-12 w-48" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[420px] w-full" />)}
                </div>
            </div>
        );
    }
    
    if (user.role !== 'customer') {
        return null;
    }

    const favoriteDishes = dishes.filter(dish => user.favoriteDishIds?.includes(dish.id));

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">{t('my_favorites')}</h1>
                <p className="text-muted-foreground">{t('your_favorite_dishes_desc')}</p>
            </div>

            {favoriteDishes.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {favoriteDishes.map((dish) => {
                        const chef = chefs.find(c => c.id === dish.chefId);
                        return chef ? <DishCard key={dish.id} dish={dish} chefName={chef.name} chefStatus={chef.availabilityStatus} /> : null;
                    })}
                </div>
            ) : (
                <div className="text-center py-24 border-2 border-dashed rounded-lg mt-12">
                    <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-medium">{t('no_favorites_yet')}</h3>
                    <p className="mt-2 text-md text-muted-foreground">
                        {t('no_favorites_yet_desc')}
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/">{t('browse_dishes')}</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
