'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DollarSign, Utensils, Star, BookOpenCheck, Loader2, Upload, User as UserIcon, ArrowUp, ArrowDown, Tag, Circle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/order-card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { format, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CouponManagementTab } from '@/components/coupon-management-tab';
import { useNotifications } from '@/context/notification-context';


export default function ChefDashboardPage() {
  const { user, loading } = useAuth();
  const { dishes, getOrdersByChefId, updateOrderStatus } = useOrders();
  const { createNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'chef')) {
        router.push('/login');
    }
  }, [user, loading, router]);

  const chefOrders = useMemo(() => user ? getOrdersByChefId(user.id) : [], [user, getOrdersByChefId]);
  const chefDishes = useMemo(() => user ? dishes.filter(d => d.chefId === user.id) : [], [user, dishes]);

  const {
    pendingOrders,
    ongoingOrders,
    completedOrders,
    currentMonthRevenue,
    revenuePercentageChange,
    allReviews,
  } = useMemo(() => {
    const pending = chefOrders.filter(o => o.status === 'جارٍ المراجعة' || o.status === 'بانتظار توفر الطاهي');
    const ongoing = chefOrders.filter(o => ['قيد التحضير', 'جاهز للتوصيل'].includes(o.status));
    const completed = chefOrders.filter(o => o.status === 'تم التوصيل');
    
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    const revenueThisMonth = completed
        .filter(o => {
            if (!o.createdAt || isNaN(new Date(o.createdAt).getTime())) return false;
            return isWithinInterval(new Date(o.createdAt), { start: startOfCurrentMonth, end: endOfCurrentMonth });
        })
        .reduce((acc, order) => acc + order.total, 0);

    const revenueLastMonth = completed
        .filter(o => {
            if (!o.createdAt || isNaN(new Date(o.createdAt).getTime())) return false;
            return isWithinInterval(new Date(o.createdAt), { start: startOfLastMonth, end: endOfLastMonth });
        })
        .reduce((acc, order) => acc + order.total, 0);

    let percentageChange = 0;
    if (revenueLastMonth > 0) {
        percentageChange = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
    } else if (revenueThisMonth > 0) {
        percentageChange = 100; 
    }

    const reviews = chefDishes
      .flatMap(dish => dish.ratings?.map(r => ({ ...r, dishName: dish.name })) || [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      pendingOrders: pending,
      ongoingOrders: ongoing,
      completedOrders: completed,
      currentMonthRevenue: revenueThisMonth,
      revenuePercentageChange: percentageChange,
      allReviews: reviews,
    };
  }, [chefOrders, chefDishes]);
  
  const chartData = useMemo(() => {
     const monthlyData: { [key: string]: number } = {};
     const now = new Date();
     
     for (let i = 0; i <= now.getMonth(); i++) {
         const monthName = format(new Date(now.getFullYear(), i, 1), 'MMM', { locale: ar });
         monthlyData[monthName] = 0;
     }
 
     completedOrders.forEach(order => {
        if (order.createdAt && !isNaN(new Date(order.createdAt).getTime())) {
          const orderDate = new Date(order.createdAt);
          if (orderDate.getFullYear() === now.getFullYear()) {
             const month = format(orderDate, 'MMM', { locale: ar });
             if (monthlyData.hasOwnProperty(month)) {
                 monthlyData[month] += order.total;
             }
          }
        }
     });
 
     return Object.entries(monthlyData).map(([name, total]) => ({ name, total }));
  }, [completedOrders]);


  if (loading || !user) {
    return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <Skeleton className="h-12 w-64 mb-8" />
            <Skeleton className="h-10 w-72 mb-4" />
            <Skeleton className="h-[500px] w-full" />
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">لوحة تحكم الشيف</h1>
        <p className="font-semibold text-lg">مرحبًا بعودتك، {user.name}!</p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="dashboard">نظرة عامة</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="menu">قائمة الطعام</TabsTrigger>
            <TabsTrigger value="coupons">القسائم</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 my-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إيرادات هذا الشهر</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentMonthRevenue.toFixed(2)} جنيه</div>
                        <p className={cn(
                            "text-xs text-muted-foreground flex items-center",
                            revenuePercentageChange > 0 && "text-green-600",
                            revenuePercentageChange < 0 && "text-red-600"
                        )}>
                             {revenuePercentageChange > 0 ? <ArrowUp className="h-4 w-4" /> : revenuePercentageChange < 0 ? <ArrowDown className="h-4 w-4" /> : null}
                            {revenuePercentageChange.toFixed(1)}% عن الشهر الماضي
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الطلبات النشطة</CardTitle>
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{ongoingOrders.length}</div>
                        <p className="text-xs text-muted-foreground">قيد التنفيذ حاليًا</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">تقييمات جديدة</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{allReviews.length}</div>
                        <p className="text-xs text-muted-foreground">إجمالي التقييمات على وجباتك</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>نظرة على الإيرادات الشهرية</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ج`} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>أحدث التقييمات</CardTitle>
                        <CardDescription>آخر 5 تقييمات من عملائك.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {allReviews.length > 0 ? (
                            allReviews.slice(0, 5).map((review, index) => (
                                <div key={index} className="flex flex-col gap-1 border-b pb-2">
                                     <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm">{review.dishName}</span>
                                        <div className="flex items-center gap-1" dir="ltr">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">"{review.review || 'لم يترك تعليقًا'}" - <span className="font-medium not-italic">{review.customerName}</span></p>
                                </div>
                            ))
                        ) : (
                           <p className="text-muted-foreground text-center py-8">لا توجد تقييمات بعد.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="orders">
            <Tabs defaultValue="new" className="w-full mt-4">
                 <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="new">طلبات جديدة ({pendingOrders.length})</TabsTrigger>
                    <TabsTrigger value="ongoing">طلبات جارية ({ongoingOrders.length})</TabsTrigger>
                    <TabsTrigger value="completed">طلبات مكتملة ({completedOrders.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="new" className="mt-4">
                     {pendingOrders.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingOrders.map((order) => <OrderCard key={order.id} order={order} isChefView updateOrderStatus={updateOrderStatus}/>)}
                        </div>
                     ) : ( <p className="text-muted-foreground text-center py-8">لا توجد طلبات جديدة.</p> )}
                </TabsContent>
                <TabsContent value="ongoing" className="mt-4">
                     {ongoingOrders.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {ongoingOrders.map((order) => <OrderCard key={order.id} order={order} isChefView updateOrderStatus={updateOrderStatus}/>)}
                        </div>
                     ) : ( <p className="text-muted-foreground text-center py-8">لا توجد طلبات جارية.</p> )}
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                     {completedOrders.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {completedOrders.map((order) => <OrderCard key={order.id} order={order} isChefView />)}
                        </div>
                     ) : ( <p className="text-muted-foreground text-center py-8">لا توجد طلبات مكتملة.</p> )}
                </TabsContent>
            </Tabs>
        </TabsContent>
        
        <TabsContent value="menu">
            <Card className="mt-4">
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
        </TabsContent>
        
        <TabsContent value="coupons">
            <CouponManagementTab />
        </TabsContent>

      </Tabs>
    </div>
  );
}
