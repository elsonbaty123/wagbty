
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Edit, Calendar, Percent, Tag, Users } from 'lucide-react';
import type { Coupon } from '@/lib/types';
import { useOrders } from '@/context/order-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CouponCardProps {
  coupon: Coupon;
  onEdit: () => void;
}

export function CouponCard({ coupon, onEdit }: CouponCardProps) {
  const { updateCoupon } = useOrders();
  const { toast } = useToast();

  const handleStatusChange = (isActive: boolean) => {
    updateCoupon({ ...coupon, isActive });
    toast({ title: 'تم تحديث حالة القسيمة' });
  };

  const isExpired = new Date() > new Date(coupon.endDate);
  const hasReachedLimit = coupon.timesUsed >= coupon.usageLimit;

  let statusText = coupon.isActive ? 'نشطة' : 'متوقفة';
  let statusColor = coupon.isActive ? 'bg-green-500' : 'bg-gray-500';

  if (isExpired) {
    statusText = 'منتهية الصلاحية';
    statusColor = 'bg-red-500';
  } else if (hasReachedLimit) {
    statusText = 'مكتملة الاستخدام';
    statusColor = 'bg-yellow-500';
  }
  
  return (
    <Card className="flex flex-col text-right">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-mono text-lg bg-muted px-3 py-1 rounded-lg">{coupon.code}</CardTitle>
            <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", statusColor)}></div>
                <span className="text-sm font-medium">{statusText}</span>
            </div>
        </div>
        <CardDescription>
            خصم {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' جنيه'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 justify-end">
            <p>
                ينطبق على: {coupon.appliesTo === 'all' ? 'كل الوجبات' : `${coupon.applicableDishIds?.length || 0} وجبات محددة`}
            </p>
            <Tag className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-center gap-2 justify-end">
            <p>
                {format(new Date(coupon.startDate), 'd MMM yyyy', { locale: ar })} - {format(new Date(coupon.endDate), 'd MMM yyyy', { locale: ar })}
            </p>
            <Calendar className="h-4 w-4 text-primary" />
        </div>
         <div className="flex items-center gap-2 justify-end">
            <p>
                استُخدمت {coupon.timesUsed} من {coupon.usageLimit} مرة
            </p>
            <Users className="h-4 w-4 text-primary" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="flex items-center space-x-2 space-x-reverse">
             <Label htmlFor={`active-switch-${coupon.id}`}>تفعيل</Label>
            <Switch
              id={`active-switch-${coupon.id}`}
              checked={coupon.isActive && !isExpired && !hasReachedLimit}
              onCheckedChange={handleStatusChange}
              disabled={isExpired || hasReachedLimit}
            />
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="ml-2 h-4 w-4" />
          تعديل
        </Button>
      </CardFooter>
    </Card>
  );
}
