'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/order-card';
import { useTranslation } from 'react-i18next';

export default function ChefOrdersPage() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { getOrdersByChefId, updateOrderStatus } = useOrders();

    const chefOrders = useMemo(() => user ? getOrdersByChefId(user.id) : [], [user, getOrdersByChefId]);
    
    const {
        pendingOrders,
        ongoingOrders,
        completedOrders,
    } = useMemo(() => {
        const pending = chefOrders.filter(o => o.status === 'pending_review' || o.status === 'waiting_for_chef');
        const ongoing = chefOrders.filter(o => ['preparing', 'ready_for_delivery', 'out_for_delivery'].includes(o.status));
        const completed = chefOrders.filter(o => o.status === 'delivered' || o.status === 'rejected' || o.status === 'not_delivered');
        
        return {
            pendingOrders: pending,
            ongoingOrders: ongoing,
            completedOrders: completed,
        };
    }, [chefOrders]);

    const orderTabs = [
        { value: 'new', labelKey: 'new_orders', orders: pendingOrders },
        { value: 'ongoing', labelKey: 'ongoing_orders', orders: ongoingOrders },
        { value: 'completed', labelKey: 'completed_orders', orders: completedOrders },
    ];
    const renderedOrderTabs = i18n.dir() === 'rtl' ? [...orderTabs].reverse() : orderTabs;

    return (
        <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-1 gap-2 text-center sm:grid-cols-3">
                {renderedOrderTabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {t(tab.labelKey)} ({tab.orders.length})
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value="new" className="mt-4">
                {pendingOrders.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pendingOrders.map((order) => <OrderCard key={order.id} order={order} isChefView updateOrderStatus={updateOrderStatus}/>)}
                    </div>
                ) : ( <p className="text-muted-foreground text-center py-8">{t('no_new_orders')}</p> )}
            </TabsContent>
            <TabsContent value="ongoing" className="mt-4">
                {ongoingOrders.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {ongoingOrders.map((order) => <OrderCard key={order.id} order={order} isChefView updateOrderStatus={updateOrderStatus}/>)}
                    </div>
                ) : ( <p className="text-muted-foreground text-center py-8">{t('no_ongoing_orders')}</p> )}
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
                {completedOrders.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {completedOrders.map((order) => <OrderCard key={order.id} order={order} isChefView />)}
                    </div>
                ) : ( <p className="text-muted-foreground text-center py-8">{t('no_completed_orders')}</p> )}
            </TabsContent>
        </Tabs>
    );
}
