'use client';

import { useState } from 'react';
import Image from 'next/image';
import { OrderCard } from '@/components/order-card';
import type { Order, Dish } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Utensils, ClipboardList, PlusCircle, Edit } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DishForm } from '@/components/dish-form';

const mockChefOrders: Order[] = [
  {
    id: 'ORD125',
    customerName: 'جين دو',
    customerPhone: '01123456789',
    deliveryAddress: '456 شارع أوك، سبرينغفيلد، مصر',
    dish: { id: 'd5', name: 'كريم بروليه', description: '', price: 115, imageUrl: '' },
    chef: { id: '2', name: 'الشيف أنطوان دوبوا' },
    status: 'قيد الانتظار',
  },
  {
    id: 'ORD126',
    customerName: 'جون سميث',
    customerPhone: '01234567890',
    deliveryAddress: '789 شارع باين، متروفيل، مصر',
    dish: { id: 'd4', name: 'كيكة الشوكولاتة الذائبة', description: '', price: 140.0, imageUrl: '' },
    chef: { id: '2', name: 'الشيف أنطوان دوبوا' },
    status: 'قيد الانتظار',
  },
  {
    id: 'ORD127',
    customerName: 'إيميلي جونسون',
    customerPhone: '01567891234',
    deliveryAddress: '101 طريق ميبل، جوثام، مصر',
    dish: { id: 'd6', name: 'تشكيلة ماكارون', description: '', price: 180.0, imageUrl: '' },
    chef: { id: '2', name: 'الشيف أنطوان دوبوا' },
    status: 'مؤكد',
  },
];

const mockChefDishes: Dish[] = [
    { id: 'd4', name: 'كيكة الشوكولاتة الذائبة', description: 'كيكة شوكولاتة ذائبة غنية مع مركز من كولي التوت.', price: 140.0, imageUrl: 'https://placehold.co/400x225.png' },
    { id: 'd5', name: 'كريم بروليه', description: 'كاسترد غني بحبوب الفانيليا مع طبقة علوية من السكر المكرمل بشكل مثالي.', price: 115.0, imageUrl: 'https://placehold.co/400x225.png' },
    { id: 'd6', name: 'تشكيلة ماكارون', description: 'مجموعة مختارة من ستة قطع ماكارون فرنسية رقيقة بنكهات مختلفة.', price: 180.0, imageUrl: 'https://placehold.co/400x225.png' },
];


export default function ChefDashboardPage() {
  const [isDishDialogOpen, setDishDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const pendingOrders = mockChefOrders.filter(o => o.status === 'قيد الانتظار');
  const otherOrders = mockChefOrders.filter(o => o.status !== 'قيد الانتظار');

  const handleOpenDialog = (dish: Dish | null) => {
    setSelectedDish(dish);
    setDishDialogOpen(true);
  };


  return (
    <>
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">لوحة تحكم الشيف</h1>
        <p className="font-semibold text-lg">مرحبًا بعودتك، شيف أنطوان!</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42,318.90 جنيه</div>
            <p className="text-xs text-muted-foreground">+20.1% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات النشطة</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5</div>
             <p className="text-xs text-muted-foreground">قيد التنفيذ حاليًا</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات جديدة</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingOrders.length} <Badge>قيد الانتظار</Badge>
            </div>
             <p className="text-xs text-muted-foreground">تتطلب تأكيدك</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-headline text-2xl font-bold mb-4">طلبات جديدة</h2>
        {pendingOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} isChefView />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">لا توجد طلبات جديدة في الوقت الحالي.</p>
        )}
      </div>

      <div className="mt-12">
        <h2 className="font-headline text-2xl font-bold mb-4">سجل الطلبات</h2>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>

       <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline text-2xl font-bold">قائمة طعامي</h2>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="ml-2 h-4 w-4" />
              أضف طبق جديد
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockChefDishes.map((dish) => (
              <Card key={dish.id} className="flex flex-col">
                 <Image
                    alt={dish.name}
                    className="aspect-video w-full rounded-t-lg object-cover"
                    height="225"
                    src={dish.imageUrl}
                    data-ai-hint="plated food"
                    width="400"
                  />
                <CardHeader>
                  <CardTitle>{dish.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground min-h-[40px]">{dish.description}</p>
                  <p className="font-bold text-primary mt-2">{dish.price.toFixed(2)} جنيه</p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => handleOpenDialog(dish)}>
                      <Edit className="ml-2 h-4 w-4" />
                      تعديل
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
    </div>
    <Dialog open={isDishDialogOpen} onOpenChange={setDishDialogOpen}>
        <DishForm dish={selectedDish} onFinished={() => setDishDialogOpen(false)} />
    </Dialog>
    </>
  );
}
