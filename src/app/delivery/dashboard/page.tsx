
'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/order-card';
import { useTranslation } from 'react-i18next';
import { Bike, PackageCheck } from 'lucide-react';

export default function DeliveryDashboardPage() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { orders, assignOrderToDelivery, updateOrderStatus } = useOrders();

    const {
        availableOrders,
        myDeliveries,
    } = useMemo(() => {
        const available = orders.filter(o => o.status === 'ready_for_delivery');
        const my = orders.filter(o => o.deliveryPersonId === user?.id && o.status === 'out_for_delivery');
        
        return {
            availableOrders: available,
            myDeliveries: my,
        };
    }, [orders, user]);

    const orderTabs = [
        { value: 'available', labelKey: 'available_for_pickup', orders: availableOrders, icon: <PackageCheck className="h-4 w-4 me-2" /> },
        { value: 'ongoing', labelKey: 'my_deliveries', orders: myDeliveries, icon: <Bike className="h-4 w-4 me-2" /> },
    ];
    const renderedOrderTabs = i18n.dir() === 'rtl' ? [...orderTabs].reverse() : orderTabs;

    return (
        <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-1 gap-2 text-center sm:grid-cols-2">
                {renderedOrderTabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value} className="flex items-center">
                        {tab.icon}
                        {t(tab.labelKey)} ({tab.orders.length})
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value="available" className="mt-4">
                {availableOrders.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {availableOrders.map((order) => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                isDeliveryView 
                                assignOrderToDelivery={assignOrderToDelivery}
                            />
                        ))}
                    </div>
                ) : ( <p className="text-muted-foreground text-center py-8">{t('no_orders_for_pickup', 'No orders available for pickup right now.')}</p> )}
            </TabsContent>
            <TabsContent value="ongoing" className="mt-4">
                {myDeliveries.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {myDeliveries.map((order) => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                isDeliveryView 
                                updateOrderStatus={updateOrderStatus}
                            />
                        ))}
                    </div>
                ) : ( <p className="text-muted-foreground text-center py-8">{t('no_ongoing_deliveries', 'You have no ongoing deliveries.')}</p> )}
            </TabsContent>
        </Tabs>
    );
}
