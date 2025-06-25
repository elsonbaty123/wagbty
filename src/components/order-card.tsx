
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
import { Home, Phone, User, Check, X, CreditCard, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface OrderCardProps {
  order: Order;
  isChefView?: boolean;
  updateOrderStatus?: (orderId: string, status: Order['status']) => void;
}

export function OrderCard({ order, isChefView = false, updateOrderStatus }: OrderCardProps) {
  const { toast } = useToast();

  const handleStatusChange = (status: Order['status']) => {
    if (updateOrderStatus) {
      updateOrderStatus(order.id, status);
      toast({
        title: 'تم تحديث حالة الطلب',
        description: `تم تحديث الطلب #${order.id} إلى "${status}".`,
      });
    }
  };

  const getStatusVariant = (status: Order['status']) => {
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
