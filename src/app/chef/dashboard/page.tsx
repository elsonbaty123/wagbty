'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Utensils, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { format, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { dateLocales } from '@/components/language-manager';

export default function ChefDashboardPage() {
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  const { dishes, getOrdersByChefId } = useOrders();

  const chefOrders = useMemo(() => user ? getOrdersByChefId(user.id) : [], [user, getOrdersByChefId]);
  const chefDishes = useMemo(() => user ? dishes.filter(d => d.chefId === user.id) : [], [user, dishes]);
  
  const {
    ongoingOrders,
    currentMonthRevenue,
    revenuePercentageChange,
    allReviews,
  } = useMemo(() => {
    const ongoing = chefOrders.filter(o => ['preparing', 'ready_for_delivery', 'out_for_delivery'].includes(o.status));
    
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    const revenueThisMonth = chefOrders
        .filter(o => o.status === 'delivered' && o.createdAt && !isNaN(new Date(o.createdAt).getTime()) && isWithinInterval(new Date(o.createdAt), { start: startOfCurrentMonth, end: endOfCurrentMonth }))
        .reduce((acc, order) => acc + (order.subtotal - order.discount), 0);

    const revenueLastMonth = chefOrders
        .filter(o => o.status === 'delivered' && o.createdAt && !isNaN(new Date(o.createdAt).getTime()) && isWithinInterval(new Date(o.createdAt), { start: startOfLastMonth, end: endOfLastMonth }))
        .reduce((acc, order) => acc + (order.subtotal - order.discount), 0);

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
      ongoingOrders: ongoing,
      currentMonthRevenue: revenueThisMonth,
      revenuePercentageChange: percentageChange,
      allReviews: reviews,
    };
  }, [chefOrders, chefDishes]);
  
  const chartData = useMemo(() => {
     const monthlyData: { [key: string]: number } = {};
     const now = new Date();
     
     for (let i = 0; i <= now.getMonth(); i++) {
         const monthName = format(new Date(now.getFullYear(), i, 1), 'MMM', { locale: dateLocales[i18n.language] });
         monthlyData[monthName] = 0;
     }
 
     chefOrders.filter(o => o.status === 'delivered').forEach(order => {
        if (order.createdAt && !isNaN(new Date(order.createdAt).getTime())) {
          const orderDate = new Date(order.createdAt);
          if (orderDate.getFullYear() === now.getFullYear()) {
             const month = format(orderDate, 'MMM', { locale: dateLocales[i18n.language] });
             if (monthlyData.hasOwnProperty(month)) {
                 monthlyData[month] += (order.subtotal - order.discount);
             }
          }
        }
     });
 
     const data = Object.entries(monthlyData).map(([name, total]) => ({ name, total }));
     return i18n.dir() === 'rtl' ? data.reverse() : data;
  }, [chefOrders, i18n.language, i18n.dir]);

  if (loading || !user) {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('revenue_this_month')}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentMonthRevenue.toFixed(2)} {t('currency_egp')}</div>
                    <p className={cn(
                        "text-xs text-muted-foreground flex items-center gap-1",
                        revenuePercentageChange >= 0 && "text-green-600",
                        revenuePercentageChange < 0 && "text-red-600"
                    )}>
                         {revenuePercentageChange > 0 ? <ArrowUp className="h-4 w-4" /> : revenuePercentageChange < 0 ? <ArrowDown className="h-4 w-4" /> : null}
                         <span>{t('revenue_change_from_last_month', { percentage: revenuePercentageChange.toFixed(1) })}</span>
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('active_orders')}</CardTitle>
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{ongoingOrders.length}</div>
                    <p className="text-xs text-muted-foreground">{t('currently_in_progress')}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('new_ratings')}</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{allReviews.length}</div>
                    <p className="text-xs text-muted-foreground">{t('total_ratings_on_your_dishes')}</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t('monthly_revenue_overview')}</CardTitle>
                </CardHeader>
                <CardContent className="ps-2">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} reversed={i18n.dir() === 'rtl'} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ${t('currency_egp')}`} orientation={i18n.dir() === 'rtl' ? 'right' : 'left'} />
                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t('latest_reviews')}</CardTitle>
                    <CardDescription>{t('last_5_reviews')}</CardDescription>
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
                                <p className="text-sm text-muted-foreground italic">"{review.review || t('no_comment_left')}" - <span className="font-medium not-italic">{review.customerName}</span></p>
                            </div>
                        ))
                    ) : (
                       <p className="text-muted-foreground text-center py-8">{t('no_reviews_yet')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
