
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { OrderCard } from '@/components/order-card';
import type { Order, Dish } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Utensils, ClipboardList, PlusCircle, Edit, BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChefDashboardPage() {
  const { user, loading } = useAuth();
  const { getOrdersByChefId } = useOrders();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'chef')) {
        router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-10 w-48 mb-4" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
  }
  
  const { updateOrderStatus } = useOrders();
  const chefOrders = getOrdersByChefId(user.id);
  const pendingOrders = chefOrders.filter(o => o.status === 'قيد الانتظار');
  const otherOrders = chefOrders.filter(o => o.status !== 'قيد الانتظار');

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">لوحة تحكم الشيف</h1>
        <p className="font-semibold text-lg">مرحبًا بعودتك، {user.name}!</p>
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
            <div className="text-2xl font-bold">+{chefOrders.filter(o => o.status === 'مؤكد').length}</div>
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

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>إدارة قائمة الطعام</CardTitle>
            <CardDescription>
              أضف أطباقًا جديدة، عدّل الأسعار، وحدّث حالة التوفر من صفحة إدارة القائمة المخصصة.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/chef/menu">
                <BookOpenCheck className="ml-2 h-4 w-4" />
                الانتقال إلى إدارة القائمة
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="font-headline text-2xl font-bold mb-4">طلبات جديدة</h2>
        {pendingOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} isChefView updateOrderStatus={updateOrderStatus}/>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">لا توجد طلبات جديدة في الوقت الحالي.</p>
        )}
      </div>

      <div className="mt-12">
        <h2 className="font-headline text-2xl font-bold mb-4">سجل الطلبات</h2>
         {otherOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">لا يوجد طلبات سابقة.</p>
        )}
      </div>

    </div>
  );
}
