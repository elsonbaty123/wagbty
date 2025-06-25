
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function OrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const dishId = searchParams.get('dishId');
  
  const { dishes, loading: dishesLoading } = useOrders();
  const { users, user, loading: authLoading } = useAuth();
  const { createOrder } = useOrders();

  const dish = useMemo(() => dishes.find(d => d.id === dishId), [dishId, dishes]);
  
  const [quantity, setQuantity] = useState(1);

  if (authLoading || dishesLoading) {
      return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid gap-12 md:grid-cols-2">
                <div>
                    <Skeleton className="h-10 w-72 mb-6" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
      );
  }
  
  if (!dish) {
    notFound();
  }

  const chef = users.find(u => u.id === dish.chefId);

  const subtotal = dish.price * quantity;
  const deliveryFee = 50.0;
  const total = subtotal + deliveryFee;

  const handleConfirmOrder = () => {
    if (!user || !chef) return;

    createOrder({
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone || 'N/A',
      deliveryAddress: '456 شارع الجزيرة، الزمالك، القاهرة', // Mock address
      dish: dish,
      chef: { id: chef.id, name: chef.name },
      quantity: quantity,
    });

    toast({
      title: 'تم تأكيد الطلب بنجاح!',
      description: `طلبك لـ ${quantity}x ${dish.name} قيد المراجعة.`,
    });

    router.push('/profile');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/chefs/${dish.chefId}`}>
            العودة لصفحة الشيف
            <ArrowRight className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary mb-6">أكمل طلبك</h1>
          {!user ? (
             <Card>
              <CardHeader>
                <CardTitle>مطلوب تسجيل الدخول</CardTitle>
                <CardDescription>
                  يجب عليك تسجيل الدخول أو إنشاء حساب جديد لتتمكن من إكمال طلبك.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={`/login?redirect=/order?dishId=${dishId}`}>تسجيل الدخول</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/signup?redirect=/order?dishId=${dishId}`}>إنشاء حساب جديد</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>معلومات التوصيل</CardTitle>
                <CardDescription>هذا هو عنوان التوصيل المسجل في حسابك.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="font-semibold">{user.name}</p>
                 <p>456 شارع الجزيرة، الزمالك، القاهرة</p>
                 <p>{user.phone || 'لم يتم تقديم رقم هاتف'}</p>
                 <Button variant="outline">تغيير العنوان</Button>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-6">
           <h2 className="font-headline text-2xl font-bold">ملخص الطلب</h2>
            <Card>
                <CardContent className="p-6 flex items-center gap-4">
                    <Image
                      alt={dish.name}
                      className="rounded-md object-cover"
                      height="80"
                      src={dish.imageUrl}
                      data-ai-hint="food item"
                      width="80"
                    />
                    <div className="grid gap-1 flex-1">
                        <h3 className="font-semibold">{dish.name}</h3>
                        <p className="text-sm text-muted-foreground">{dish.description}</p>
                        <p className="font-bold text-primary">{dish.price.toFixed(2)} جنيه</p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <span className="font-medium">الكمية:</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q-1))}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input type="number" value={quantity} readOnly className="w-16 h-8 text-center" />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q+1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>تفاصيل الدفع</CardTitle>
                </CardHeader>
                 <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">المجموع الفرعي</span>
                        <span>{subtotal.toFixed(2)} جنيه</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">رسوم التوصيل</span>
                        <span>{deliveryFee.toFixed(2)} جنيه</span>
                    </div>
                     <div className="flex items-center justify-between font-bold text-lg">
                        <span className="text-primary">المجموع الكلي</span>
                        <span>{total.toFixed(2)} جنيه</span>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleConfirmOrder} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={!user}>
                    تأكيد الطلب
                  </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
