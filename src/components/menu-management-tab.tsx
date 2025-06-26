'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { PlusCircle, Utensils } from 'lucide-react';
import type { Dish } from '@/lib/types';
import { DishForm } from './dish-form';
import { DishManagementCard } from './dish-management-card';
import { useTranslation } from 'react-i18next';

export function MenuManagementTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { dishes } = useOrders();
  const [isDishDialogOpen, setDishDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  if (!user) return null;

  const chefDishes = dishes.filter(d => d.chefId === user.id);

  const handleOpenDialog = (dish: Dish | null) => {
    setSelectedDish(dish);
    setDishDialogOpen(true);
  };

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>{t('menu_management')}</CardTitle>
              <CardDescription>
                {t('menu_management_desc')}
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="me-2 h-4 w-4" />
              {t('add_new_dish')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chefDishes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {chefDishes.map((dish) => (
                <DishManagementCard
                  key={dish.id}
                  dish={dish}
                  onEdit={() => handleOpenDialog(dish)}
                />
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
                    <PlusCircle className="me-2 h-4 w-4" />
                    {t('add_your_first_dish')}
                </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDishDialogOpen} onOpenChange={setDishDialogOpen}>
        <DishForm
          dish={selectedDish}
          onFinished={() => setDishDialogOpen(false)}
        />
      </Dialog>
    </>
  );
}
