
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderStatus } from '@/lib/types';
import { Home, Phone, User, Star, Tag, Clock, PackageCheck, Check, X, Truck, Utensils, XCircle, MessageSquare, FileText, Bike } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTrigger } from './ui/dialog';
import { NotDeliveredForm } from './not-delivered-form';
import { InvoiceDialog } from './invoice-dialog';

interface OrderCardProps {
  order: Order;
  isChefView?: boolean;
  isDeliveryView?: boolean;
  updateOrderStatus?: (orderId: string, status: Order['status']) => void;
  assignOrderToDelivery?: (orderId: string) => void;
  addReview?: (orderId: string, rating: number, review: string) => void;
}

export function OrderCard({ order, isChefView = false, isDeliveryView = false, updateOrderStatus, assignOrderToDelivery, addReview }: OrderCardProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [rating, setRating] = useState(order.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(order.review || '');
  const [isNotDeliveredDialogOpen, setNotDeliveredDialogOpen] = useState(false);

  const statusMap: Record<OrderStatus, { labelKey: string, variant: "default" | "secondary" | "outline" | "destructive" | null | undefined, icon?: React.ReactNode }> = {
    'pending_review': { labelKey: 'order_status_pending_review', variant: 'secondary' },
    'preparing': { labelKey: 'order_status_preparing', variant: 'default', icon: <Utensils className="me-2 h-4 w-4" /> },
    'ready_for_delivery': { labelKey: 'order_status_ready_for_delivery', variant: 'default', icon: <PackageCheck className="me-2 h-4 w-4" /> },
    'out_for_delivery': { labelKey: 'order_status_out_for_delivery', variant: 'default', icon: <Truck className="me-2 h-4 w-4" /> },
    'delivered': { labelKey: 'order_status_delivered', variant: 'outline' },
    'rejected': { labelKey: 'order_status_rejected', variant: 'destructive' },
    'not_delivered': { labelKey: 'order_status_not_delivered', variant: 'destructive', icon: <XCircle className="me-2 h-4 w-4" /> },
    'waiting_for_chef': { labelKey: 'order_status_waiting_for_chef', variant: 'secondary', icon: <Clock className="me-2 h-4 w-4" /> },
  };

  const handleStatusChange = (status: OrderStatus) => {
    if (updateOrderStatus) {
      const translatedStatus = t(statusMap[status].labelKey);
      updateOrderStatus(order.id, status);
      const orderIdentifier = order.dailyDishOrderNumber ?? order.id.slice(-6);
      toast({
        title: t('order_status_updated_toast'),
        description: t('order_status_updated_toast_desc', { id: orderIdentifier, status: translatedStatus }),
      });
    }
  };

  const handleSubmitReview = () => {
    if (rating > 0 && addReview) {
      addReview(order.id, rating, reviewText);
      toast({ title: t('review_submitted_toast'), description: t('review_submitted_toast_desc') });
    }
  };

  const currentStatus = statusMap[order.status];
  const isCustomerView = !isChefView && !isDeliveryView;

  const dailyOrderNumberText = order.dailyDishOrderNumber
    ? i18n.language === 'ar'
      ? `طلب اليوم #${order.dailyDishOrderNumber}`
      : `Daily Order #${order.dailyDishOrderNumber}`
    : t('order_#', { id: order.id.slice(-6) });
    
    const actionTexts = {
      reject_order: t('reject_order'),
      accept_order: t('accept_order'),
      mark_as_prepared: t('mark_as_prepared'),
      mark_as_out_for_delivery: t('mark_as_out_for_delivery'),
      mark_as_delivered: t('mark_as_delivered'),
      report_not_delivered: t('report_not_delivered'),
    };

    const renderChefActions = () => {
        if (!isChefView || !updateOrderStatus) return null;
        switch (order.status) {
            case 'pending_review':
            case 'waiting_for_chef':
                return <div className="grid grid-cols-2 gap-2 w-full"><Button variant="destructive" onClick={() => handleStatusChange('rejected')}><X className="me-2 h-4 w-4" />{actionTexts.reject_order}</Button><Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusChange('preparing')}><Check className="me-2 h-4 w-4" />{actionTexts.accept_order}</Button></div>;
            case 'preparing':
                return <Button className="w-full" onClick={() => handleStatusChange('ready_for_delivery')}><PackageCheck className="me-2 h-4 w-4" />{actionTexts.mark_as_prepared}</Button>;
            default: return null;
        }
    };
    
    const renderDeliveryActions = () => {
        if (!isDeliveryView) return null;
        
        // Case 1: Order is in the pool, not yet accepted by anyone.
        if (!order.deliveryPersonId && assignOrderToDelivery) {
            return <Button className="w-full" onClick={() => assignOrderToDelivery(order.id)}><Bike className="me-2 h-4 w-4" />{t('accept_delivery', 'Accept Delivery')}</Button>;
        }
        
        // Case 2: Order is assigned to the current driver.
        if (order.deliveryPersonId) {
            switch (order.status) {
                case 'preparing':
                    return <Badge variant="outline" className="w-full justify-center"><Clock className="me-2 h-4 w-4" />{t('order_status_preparing_delivery', 'Waiting for chef')}</Badge>;
                case 'ready_for_delivery':
                    if (updateOrderStatus) {
                        return <Button className="w-full" onClick={() => handleStatusChange('out_for_delivery')}><PackageCheck className="me-2 h-4 w-4" />{t('i_have_the_order', 'I have the order')}</Button>;
                    }
                    return null;
                case 'out_for_delivery':
                     return <Dialog open={isNotDeliveredDialogOpen} onOpenChange={setNotDeliveredDialogOpen}><div className="grid grid-cols-2 gap-2 w-full"><Button variant="destructive" asChild><DialogTrigger><XCircle className="me-2 h-4 w-4" />{actionTexts.report_not_delivered}</DialogTrigger></Button><Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusChange('delivered')}><Check className="me-2 h-4 w-4" />{actionTexts.mark_as_delivered}</Button></div><NotDeliveredForm orderId={order.id} onFinished={() => setNotDeliveredDialogOpen(false)} /></Dialog>;
                default: return null;
            }
        }
    
        return null;
    };


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant={currentStatus.variant} className="flex items-center">{currentStatus.icon}{t(currentStatus.labelKey)}</Badge>
          <div className="text-end">
            <CardTitle className="font-headline text-xl">{order.dish.name}</CardTitle>
            <CardDescription>{dailyOrderNumberText}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <div className="space-y-3 text-end">
            {isChefView && <>
                <div className="flex items-center gap-2 justify-end"><span className="font-medium">{order.customerName}</span><User className="w-4 h-4 text-muted-foreground" /></div>
                <div className="flex items-center gap-2 justify-end"><span>{order.customerPhone}</span><Phone className="w-4 h-4 text-muted-foreground" /></div>
                <div className="flex items-start gap-2 justify-end"><span className="text-sm">{order.deliveryAddress}</span><Home className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" /></div>
            </>}
            {isDeliveryView && <>
                 <div className="flex items-center gap-2 justify-end"><span className="font-medium">{order.customerName}</span><User className="w-4 h-4 text-muted-foreground" /></div>
                <div className="flex items-center gap-2 justify-end"><span>{order.customerPhone}</span><Phone className="w-4 h-4 text-muted-foreground" /></div>
                <div className="flex items-start gap-2 justify-end"><span className="text-sm">{order.deliveryAddress}</span><Home className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" /></div>
            </>}
             {isCustomerView && <>
                <div className="flex items-center gap-2 justify-start"><User className="w-4 h-4 text-muted-foreground" /><span className="font-medium">{t('chef:')} {order.chef.name}</span></div>
                {order.deliveryPersonName && <div className="flex items-center gap-2 justify-start"><Bike className="w-4 h-4 text-muted-foreground" /><span className="font-medium">{t('delivery_by', 'Delivery by')}: {order.deliveryPersonName}</span></div>}
             </>}
        </div>
        <Separator />
        <div className="pt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>{order.quantity}</span><span>{t('quantity:')}</span></div>
            <div className="flex items-center justify-between"><span>{order.subtotal.toFixed(2)} {t('currency_egp')}</span><span>{t('subtotal:')}</span></div>
            {order.discount > 0 && <div className="flex items-center justify-between text-green-600"><span>- {order.discount.toFixed(2)} {t('currency_egp')}</span><span className="flex items-center gap-1">{t('discount:')} ({order.appliedCouponCode})<Tag className="h-4 w-4" /></span></div>}
            <div className="flex items-center justify-between"><span>{order.deliveryFee.toFixed(2)} {t('currency_egp')}</span><span>{t('delivery_fee:')}</span></div>
            <div className="flex items-center justify-between font-bold text-base border-t pt-2 mt-2"><span className="text-primary">{order.total.toFixed(2)} {t('currency_egp')}</span><span className="text-primary">{t('total:')}</span></div>
        </div>
         {order.customerNotes && <div className="mt-3 pt-3 border-t text-sm space-y-1"><h4 className="font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" />{t('customer_notes', 'Customer Notes')}</h4><p className="italic ps-6">"{order.customerNotes}"</p></div>}
         {order.notDeliveredInfo && <div className="mt-3 pt-3 border-t text-sm space-y-1"><h4 className="font-semibold text-destructive">{t('non_delivery_reason_title')}</h4><p className="italic">"{order.notDeliveredInfo.reason}"</p><p><span className="font-medium">{t('reported_as')}:</span> {t(`responsibility_${order.notDeliveredInfo.responsibility}`)}</p></div>}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 border-t pt-4">
        {isCustomerView && order.status === 'delivered' && !order.rating && addReview && (
            <div className='w-full space-y-2'>
                <h4 className="font-medium">{t('rate_order')}</h4>
                <div className="flex items-center gap-1" dir="ltr">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={cn("h-6 w-6 cursor-pointer transition-colors", (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)}/>))}</div>
                <Textarea placeholder={t('rate_order_placeholder')} value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                <Button onClick={handleSubmitReview} disabled={rating === 0} size="sm">{t('submit_review')}</Button>
            </div>
        )}
        {isCustomerView && order.rating && (
            <div className="flex items-center gap-2"><div className="flex items-center gap-0.5" dir="ltr">{[...Array(5)].map((_, i) => (<Star key={i} className={cn("h-4 w-4", i < order.rating! ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />))}</div><span className="text-sm text-muted-foreground">{t('your_rating:')}</span></div>
        )}
        {isChefView && renderChefActions()}
        {isDeliveryView && renderDeliveryActions()}
        <InvoiceDialog order={order} />
      </CardFooter>
    </Card>
  );
}
