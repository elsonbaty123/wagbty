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
      title: 'Order Confirmed',
      description: `You have confirmed the order for ${order.dish.name}.`,
    });
  };

  const handleReject = () => {
    toast({
      title: 'Order Rejected',
      description: `You have rejected the order for ${order.dish.name}.`,
      variant: 'destructive',
    });
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      case 'Delivered':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl">{order.dish.name}</CardTitle>
            <CardDescription>Order #{order.id}</CardDescription>
          </div>
          <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{order.customerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span>{order.customerPhone}</span>
        </div>
        <div className="flex items-start gap-2">
          <Home className="w-4 h-4 text-muted-foreground mt-1" />
          <span>{order.deliveryAddress}</span>
        </div>
      </CardContent>
      {isChefView && order.status === 'Pending' && (
        <CardFooter className="flex gap-2">
          <Button onClick={handleConfirm} className="w-full">
            <Check className="mr-2 h-4 w-4" /> Confirm
          </Button>
          <Button onClick={handleReject} variant="destructive" className="w-full">
            <X className="mr-2 h-4 w-4" /> Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
