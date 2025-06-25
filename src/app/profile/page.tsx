
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/order-card';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils } from 'lucide-react';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const { getOrdersByCustomerId, addReviewToOrder } = useOrders();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    if (loading || !user) {
        return (
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
                <Skeleton className="h-12 w-48 mb-8" />
                <Skeleton className="h-10 w-72 mb-4" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (user.role !== 'customer') {
        router.push('/login');
        return null;
    }

    const myOrders = getOrdersByCustomerId(user.id);
    const ongoingOrders = myOrders.filter(o => o.status !== 'تم التوصيل' && o.status !== 'مرفوض');
    const completedOrders = myOrders.filter(o => o.status === 'تم التوصيل' || o.status === 'مرفوض');

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-8">طلباتي</h1>
        <Tabs defaultValue="ongoing" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="ongoing">طلبات جارية</TabsTrigger>
                <TabsTrigger value="completed">طلبات مكتملة</TabsTrigger>
            </TabsList>
            <TabsContent value="ongoing">
                <Card>
                    <CardHeader>
                        <CardTitle>الطلبات الجارية</CardTitle>
                        <CardDescription>تتبع طلباتك الحالية.</CardDescription>
                    </CardHeader>
                    <CardContent>
                            {ongoingOrders.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {ongoingOrders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground py-8 text-center">لا توجد طلبات جارية حاليًا.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="completed">
                <Card>
                    <CardHeader>
                        <CardTitle>الطلبات المكتملة</CardTitle>
                        <CardDescription>عرض سجل طلباتك السابقة وتقييمها.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {completedOrders.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {completedOrders.map((order) => (
                                <OrderCard key={order.id} order={order} addReview={addReviewToOrder}/>
                            ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <Utensils className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">لا توجد طلبات بعد</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    يبدو أنك لم تقم بأي طلب بعد. تصفح الأطباق وابدأ الطلب!
                                </p>
                                <Button asChild className="mt-6">
                                    <a href="/">تصفح الأطباق</a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
