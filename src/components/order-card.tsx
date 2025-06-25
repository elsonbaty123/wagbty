
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
import { Home, Phone, User, CreditCard, ChevronDown, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';

interface OrderCardProps {
  order: Order;
  isChefView?: boolean;
  updateOrderStatus?: (orderId: string, status: Order['status']) => void;
  addReview?: (orderId: string, rating: number, review: string) => void;
}

export function OrderCard({ order, isChefView = false, updateOrderStatus, addReview }: OrderCardProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(order.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(order.review || '');

  const handleStatusChange = (status: OrderStatus) => {
    if (updateOrderStatus) {
      updateOrderStatus(order.id, status);
      toast({
        title: 'تم تحديث حالة الطلب',
        description: `تم تحديث الطلب #${order.id.slice(-4)} إلى "${status}".`,
      });
    }
  };
  
  const handleSubmitReview = () => {
    if (rating > 0 && addReview) {
      addReview(order.id, rating, reviewText);
      toast({ title: 'شكرًا لتقييمك!', description: 'تم إرسال تقييمك بنجاح.' });
    }
  };

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'قيد التحضير':
        return 'default';
      case 'جاهز للتوصيل':
        return 'default';
      case 'جارٍ المراجعة':
        return 'secondary';
      case 'مرفوض':
        return 'destructive';
      case 'تم التوصيل':
        return 'outline';
      default:
        return 'default';
    }
  };

  const total = order.dish.price * order.quantity;
  const isCustomerView = !isChefView;

  return (
    <Card className="text-right flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl">{order.dish.name}</CardTitle>
            <CardDescription>طلب #{order.id.slice(-6)}</CardDescription>
          </div>
          <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
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
            <div className="flex items-center gap-2 justify-end">
                <span className="font-medium">الشيف: {order.chef.name}</span>
                <User className="w-4 h-4 text-muted-foreground" />
            </div>
        )}
        <div className="border-t pt-3 mt-3 space-y-2">
            <div className="flex items-center gap-2 justify-end">
                <span>الكمية: {order.quantity}</span>
            </div>
             <div className="flex items-center gap-2 justify-end">
                <span>الإجمالي: {total.toFixed(2)} جنيه</span>
                <CreditCard className="w-4 h-4 text-muted-foreground" />
            </div>
        </div>
      </CardContent>
      {isCustomerView && order.status === 'تم التوصيل' && !order.rating && addReview && (
        <CardFooter className="flex-col items-start gap-2 border-t pt-4">
            <h4 className="font-medium">تقييم الطلب</h4>
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
                placeholder="أخبرنا عن رأيك في الوجبة..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="text-right"
            />
            <Button onClick={handleSubmitReview} disabled={rating === 0} size="sm">إرسال التقييم</Button>
        </CardFooter>
      )}
       {isCustomerView && order.rating && (
        <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2">
                 <span className="text-sm text-muted-foreground">تقييمك:</span>
                 <div className="flex items-center gap-0.5" dir="ltr">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("h-4 w-4", i < order.rating! ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                    ))}
                 </div>
            </div>
        </CardFooter>
      )}
       {isChefView && order.status !== 'تم التوصيل' && order.status !== 'مرفوض' && (
        <CardFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                تحديث حالة الطلب
                <ChevronDown className="mr-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 text-right">
              {order.status === 'جارٍ المراجعة' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange('قيد التحضير')}>
                    قبول الطلب (قيد التحضير)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('مرفوض')} className="text-destructive focus:text-destructive">
                    رفض الطلب
                  </DropdownMenuItem>
                </>
              )}
              {order.status === 'قيد التحضير' && (
                <DropdownMenuItem onClick={() => handleStatusChange('جاهز للتوصيل')}>
                  جاهز للتوصيل
                </DropdownMenuItem>
              )}
              {order.status === 'جاهز للتوصيل' && (
                <DropdownMenuItem onClick={() => handleStatusChange('تم التوصيل')}>
                  تم التوصيل
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      )}
    </Card>
  );
}
