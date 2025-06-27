
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
import { Home, Phone, User, ChevronDown, Star, Tag, Clock, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { useTranslation } from 'react-i18next';

interface OrderCardProps {
  order: Order;
  isChefView?: boolean;
  updateOrderStatus?: (orderId: string, status: Order['status']) => void;
  addReview?: (orderId: string, rating: number, review: string) => void;
}

export function OrderCard({ order, isChefView = false, updateOrderStatus, addReview }: OrderCardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [rating, setRating] = useState(order.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(order.review || '');

  const statusMap: Record<OrderStatus, { labelKey: string, variant: "default" | "secondary" | "outline" | "destructive" | null | undefined, icon?: React.ReactNode }> = {
    'pending_review': { labelKey: 'order_status_pending_review', variant: 'secondary' },
    'preparing': { labelKey: 'order_status_preparing', variant: 'default' },
    'ready_for_delivery': { labelKey: 'order_status_ready_for_delivery', variant: 'default' },
    'out_for_delivery': { labelKey: 'order_status_out_for_delivery', variant: 'default', icon: <Truck className="me-2 h-4 w-4" /> },
    'delivered': { labelKey: 'order_status_delivered', variant: 'outline' },
    'rejected': { labelKey: 'order_status_rejected', variant: 'destructive' },
    'waiting_for_chef': { labelKey: 'order_status_waiting_for_chef', variant: 'secondary', icon: <Clock className="me-2 h-4 w-4" /> },
  };

  const handleStatusChange = (status: OrderStatus) => {
    if (updateOrderStatus) {
      const translatedStatus = t(statusMap[status].labelKey);
      updateOrderStatus(order.id, status);
      toast({
        title: t('order_status_updated_toast'),
        description: t('order_status_updated_toast_desc', { id: order.id.slice(-4), status: translatedStatus }),
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
  const isCustomerView = !isChefView;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant={currentStatus.variant} className="flex items-center">
            {currentStatus.icon}
            {t(currentStatus.labelKey)}
          </Badge>
          <div>
            <CardTitle className="font-headline text-xl">{order.dish.name}</CardTitle>
            <CardDescription>{t('order_#', { id: order.id.slice(-6) })}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        {isChefView ? (
          <>
            <div className="flex items-center gap-2 justify-end">
              <span className="font-medium">{order.customerName}</span>
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span>{order.customerPhone}</span>
              <Phone className="w-4 h-4 text-muted-foreground" />
            </div>
             <div className="flex items-start gap-2 justify-end">
                <span className="text-sm">{order.deliveryAddress}</span>
                <Home className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
            </div>
          </>
        ) : (
            <div className="flex items-center gap-2 justify-start">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{t('chef:')} {order.chef.name}</span>
            </div>
        )}
        <Separator />
        <div className="pt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
                <span>{order.quantity}</span>
                <span>{t('quantity:')}</span>
            </div>
             <div className="flex items-center justify-between">
                <span>{order.subtotal.toFixed(2)} {t('currency_egp')}</span>
                <span>{t('subtotal:')}</span>
            </div>
            {order.discount > 0 && (
                 <div className="flex items-center justify-between text-green-600">
                    <span>- {order.discount.toFixed(2)} {t('currency_egp')}</span>
                    <span className="flex items-center gap-1">{t('discount:')}<Tag className="h-4 w-4" /></span>
                </div>
            )}
             <div className="flex items-center justify-between">
                <span>{order.deliveryFee.toFixed(2)} {t('currency_egp')}</span>
                <span>{t('delivery_fee:')}</span>
            </div>
             <div className="flex items-center justify-between font-bold text-base border-t pt-2 mt-2">
                <span className="text-primary">{order.total.toFixed(2)} {t('currency_egp')}</span>
                <span className="text-primary">{t('total:')}</span>
            </div>
        </div>
      </CardContent>
      {isCustomerView && order.status === 'delivered' && !order.rating && addReview && (
        <CardFooter className="flex-col items-start gap-2 border-t pt-4">
            <h4 className="font-medium">{t('rate_order')}</h4>
            <div className="flex items-center gap-1" dir="ltr">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={cn(
                            "h-6 w-6 cursor-pointer transition-colors",
                            (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                        )}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                    />
                ))}
            </div>
            <Textarea
                placeholder={t('rate_order_placeholder')}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
            />
            <Button onClick={handleSubmitReview} disabled={rating === 0} size="sm">{t('submit_review')}</Button>
        </CardFooter>
      )}
       {isCustomerView && order.rating && (
        <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2">
                 <div className="flex items-center gap-0.5" dir="ltr">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("h-4 w-4", i < order.rating! ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                    ))}
                 </div>
                 <span className="text-sm text-muted-foreground">{t('your_rating:')}</span>
            </div>
        </CardFooter>
      )}
       {isChefView && order.status !== 'delivered' && order.status !== 'rejected' && (
        <CardFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <ChevronDown className="me-2 h-4 w-4" />
                {t('update_order_status')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {(order.status === 'pending_review' || order.status === 'waiting_for_chef') && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange('preparing')}>
                    {t('accept_order_preparing')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('rejected')} className="text-destructive focus:text-destructive">
                    {t('reject_order')}
                  </DropdownMenuItem>
                </>
              )}
              {order.status === 'preparing' && (
                <DropdownMenuItem onClick={() => handleStatusChange('ready_for_delivery')}>
                  {t('ready_for_delivery')}
                </DropdownMenuItem>
              )}
              {order.status === 'ready_for_delivery' && (
                <DropdownMenuItem onClick={() => handleStatusChange('out_for_delivery')}>
                  {t('out_for_delivery')}
                </DropdownMenuItem>
              )}
              {order.status === 'out_for_delivery' && (
                <DropdownMenuItem onClick={() => handleStatusChange('delivered')}>
                  {t('delivered')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      )}
    </Card>
  );
}
