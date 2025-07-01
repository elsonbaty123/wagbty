
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useOrders } from "@/context/order-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Search, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Order, OrderStatus } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvoiceDialog } from '@/components/invoice-dialog';

const statusMap: Record<OrderStatus, { labelKey: string, variant: "default" | "secondary" | "outline" | "destructive" | null | undefined }> = {
    'pending_review': { labelKey: 'order_status_pending_review', variant: 'secondary' },
    'preparing': { labelKey: 'order_status_preparing', variant: 'default' },
    'ready_for_delivery': { labelKey: 'order_status_ready_for_delivery', variant: 'default' },
    'out_for_delivery': { labelKey: 'order_status_out_for_delivery', variant: 'default' },
    'delivered': { labelKey: 'order_status_delivered', variant: 'outline' },
    'rejected': { labelKey: 'order_status_rejected', variant: 'destructive' },
    'not_delivered': { labelKey: 'order_status_not_delivered', variant: 'destructive' },
    'waiting_for_chef': { labelKey: 'order_status_waiting_for_chef', variant: 'secondary' },
};

export default function AdminOrdersPage() {
    const { t } = useTranslation();
    const { users, chefs, deliveryUsers, loading: authLoading } = useAuth();
    const { orders, loading: ordersLoading } = useOrders();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [customerFilter, setCustomerFilter] = useState('all');
    const [chefFilter, setChefFilter] = useState('all');

    const loading = authLoading || ordersLoading;

    const customers = useMemo(() => users.filter(u => u.role === 'customer'), [users]);
    
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const searchMatch = searchQuery === '' || 
                                o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                o.dish.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            const statusMatch = statusFilter === 'all' || o.status === statusFilter;
            const customerMatch = customerFilter === 'all' || o.customerId === customerFilter;
            const chefMatch = chefFilter === 'all' || o.chef.id === chefFilter;

            return searchMatch && statusMatch && customerMatch && chefMatch;
        });
    }, [orders, searchQuery, statusFilter, customerFilter, chefFilter]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
        <CardHeader>
            <CardTitle>{t('order_monitoring', 'Order Monitoring')}</CardTitle>
            <CardDescription>{t('order_monitoring_desc', 'Monitor all orders in the system.')}</CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-4">
                <div className="relative lg:col-span-1">
                    <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('search_by_order_or_dish', 'Search by Order ID or Dish...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ps-8 w-full"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
                    <SelectTrigger><SelectValue placeholder={t('filter_by_status', 'Filter by status...')} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('all_statuses', 'All Statuses')}</SelectItem>
                        {Object.keys(statusMap).map(status => (
                            <SelectItem key={status} value={status}>{t(statusMap[status as OrderStatus].labelKey)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={customerFilter} onValueChange={setCustomerFilter}>
                    <SelectTrigger><SelectValue placeholder={t('filter_by_customer', 'Filter by customer...')} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('all_customers', 'All Customers')}</SelectItem>
                        {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={chefFilter} onValueChange={setChefFilter}>
                    <SelectTrigger><SelectValue placeholder={t('filter_by_chef', 'Filter by chef...')} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('all_chefs', 'All Chefs')}</SelectItem>
                        {chefs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>{t('order_id', 'Order ID')}</TableHead>
                <TableHead>{t('customer')}</TableHead>
                <TableHead>{t('chef')}</TableHead>
                <TableHead>{t('dish')}</TableHead>
                <TableHead>{t('total')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.id.slice(-6)}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.chef.name}</TableCell>
                        <TableCell>{order.dish.name}</TableCell>
                        <TableCell>{order.total.toFixed(2)} {t('currency_egp')}</TableCell>
                        <TableCell>
                            <Badge variant={statusMap[order.status].variant}>
                                {t(statusMap[order.status].labelKey)}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-end">
                            <InvoiceDialog order={order}>
                                <Button variant="ghost" size="icon">
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">{t('view_invoice', 'View Invoice')}</span>
                                </Button>
                            </InvoiceDialog>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                           {t('no_orders_found', 'No orders found.')}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
    </Card>
  )
}
