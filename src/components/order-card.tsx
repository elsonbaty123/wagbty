
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
import type { Order } from '@/lib/types';
import { Home, Phone, User, Check, X, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderCardProps {
  order: Order;
  isChefView?: boolean;
  updateOrderStatus?: (orderId: string, status: Order['status']) => void;
}

export function OrderCard({ order, isChefView = false, updateOrderStatus }: OrderCardProps) {
  const { toast } = useToast();

  const handleConfirm = () => {
    if (updateOrderStatus) {
      updateOrderStatus(order.id, 'مؤكد');
      toast({
        title: 'تم تأكيد الطلب',
        description: `لقد قمت بتأكيد طلب ${order.dish.name}.`,
      });
    }
  };

  const handleReject = () => {
     if (updateOrderStatus) {
      updateOrderStatus(order.id, 'مرفوض');
      toast({
        title: 'تم رفض الطلب',
        description: `لقد قمت برفض طلب ${order.dish.name}.`,
        variant: 'destructive',
      });
    }
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'مؤكد':
        return 'default';
      case 'قيد الانتظار':
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

  return (
    <Card className="text-right flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl">{order.dish.name}</CardTitle>
            <CardDescription>طلب #{order.id}</CardDescription>
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
                <span>{order.deliveryAddress}</span>
                <Home className="w-4 h-4 text-muted-foreground mt-1" />
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
      {isChefView && order.status === 'قيد الانتظار' && (
        <CardFooter className="flex gap-2">
          <Button onClick={handleConfirm} className="w-full">
            <Check className="ml-2 h-4 w-4" /> تأكيد
          </Button>
          <Button onClick={handleReject} variant="destructive" className="w-full">
            <X className="ml-2 h-4 w-4" /> رفض
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
