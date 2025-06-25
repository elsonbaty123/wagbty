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
import { Home, Phone, User, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderCardProps {
  order: Order;
  isChefView?: boolean;
}

export function OrderCard({ order, isChefView = false }: OrderCardProps) {
  const { toast } = useToast();

  const handleConfirm = () => {
    toast({
      title: 'تم تأكيد الطلب',
      description: `لقد قمت بتأكيد طلب ${order.dish.name}.`,
    });
  };

  const handleReject = () => {
    toast({
      title: 'تم رفض الطلب',
      description: `لقد قمت برفض طلب ${order.dish.name}.`,
      variant: 'destructive',
    });
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

  return (
    <Card className="text-right">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl">{order.dish.name}</CardTitle>
            <CardDescription>طلب #{order.id}</CardDescription>
          </div>
          <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
