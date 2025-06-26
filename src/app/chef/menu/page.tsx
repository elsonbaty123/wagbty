
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, Utensils } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { DishForm } from '@/components/dish-form';
import { DishManagementCard } from '@/components/dish-management-card';
import type { Dish } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

export default function ChefMenuPage() {
    const { t } = useTranslation();
    const { user, loading } = useAuth();
    const { dishes } = useOrders();
    const router = useRouter();

    const [isDishDialogOpen, setDishDialogOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'chef')) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    if (loading || !user) {
        return (
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-12 w-72" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    const chefDishes = dishes.filter(d => d.chefId === user.id);
    
    const handleOpenDialog = (dish: Dish | null) => {
        setSelectedDish(dish);
        setDishDialogOpen(true);
    };

    return (
        <>
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">{t('menu_management')}</h1>
                    <Button onClick={() => handleOpenDialog(null)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <PlusCircle className="ms-2 h-4 w-4" />
                        {t('add_new_dish')}
                    </Button>
                </div>

                {chefDishes.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {chefDishes.map((dish) => (
                            <DishManagementCard key={dish.id} dish={dish} onEdit={() => handleOpenDialog(dish)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 border-2 border-dashed rounded-lg">
                        <Utensils className="mx-auto h-16 w-16 text-muted-foreground" />
                        <h3 className="mt-4 text-xl font-medium">{t('your_menu_is_empty')}</h3>
                        <p className="mt-2 text-md text-muted-foreground">
                            {t('your_menu_is_empty_desc')}
                        </p>
                        <Button onClick={() => handleOpenDialog(null)} className="mt-6">
                            <PlusCircle className="ms-2 h-4 w-4" />
                            {t('add_your_first_dish')}
                        </Button>
                  </div>
                )}
            </div>

            <Dialog open={isDishDialogOpen} onOpenChange={setDishDialogOpen}>
                <DishForm dish={selectedDish} onFinished={() => setDishDialogOpen(false)} />
            </Dialog>
        </>
    )
}
