
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
import { useTranslation } from 'react-i18next';
import { dateLocales } from './language-manager';

interface CouponCardProps {
  coupon: Coupon;
  onEdit: () => void;
}

export function CouponCard({ coupon, onEdit }: CouponCardProps) {
  const { t, i18n } = useTranslation();
  const { updateCoupon } = useOrders();
  const { toast } = useToast();

  const handleStatusChange = (isActive: boolean) => {
    updateCoupon({ ...coupon, isActive });
    toast({ title: t('coupon_status_updated') });
  };

  const isExpired = new Date() > new Date(coupon.endDate);
  const hasReachedLimit = coupon.timesUsed >= coupon.usageLimit;

  let statusTextKey = coupon.isActive ? 'coupon_status_active' : 'coupon_status_inactive';
  let statusColor = coupon.isActive ? 'bg-green-500' : 'bg-gray-500';

  if (isExpired) {
    statusTextKey = 'coupon_status_expired';
    statusColor = 'bg-red-500';
  } else if (hasReachedLimit) {
    statusTextKey = 'coupon_status_limit_reached';
    statusColor = 'bg-yellow-500';
  }
  
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t(statusTextKey)}</span>
                <div className={cn("w-3 h-3 rounded-full", statusColor)}></div>
            </div>
            <CardTitle className="font-mono text-lg bg-muted px-3 py-1 rounded-lg">{coupon.code}</CardTitle>
        </div>
        <CardDescription>
            {t('discount_type_label', { 
                value: coupon.discountValue, 
                type: coupon.discountType === 'percentage' ? '%' : t('currency_egp')
            })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 justify-start">
            <Tag className="h-4 w-4 text-primary" />
            <p>
                {t('coupon_applies_to')}{' '}
                {coupon.appliesTo === 'all' 
                    ? t('coupon_all_dishes') 
                    : t('coupon_specific_dishes', { count: coupon.applicableDishIds?.length || 0 })}
            </p>
        </div>
        <div className="flex items-center gap-2 justify-start">
            <Calendar className="h-4 w-4 text-primary" />
            <p>
                {format(new Date(coupon.startDate), 'd MMM yyyy', { locale: dateLocales[i18n.language] })} - {format(new Date(coupon.endDate), 'd MMM yyyy', { locale: dateLocales[i18n.language] })}
            </p>
        </div>
         <div className="flex items-center gap-2 justify-start">
            <Users className="h-4 w-4 text-primary" />
            <p>
                {t('coupon_usage', { used: coupon.timesUsed, limit: coupon.usageLimit })}
            </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="me-2 h-4 w-4" />
          {t('edit')}
        </Button>
        <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id={`active-switch-${coupon.id}`}
              checked={coupon.isActive && !isExpired && !hasReachedLimit}
              onCheckedChange={handleStatusChange}
              disabled={isExpired || hasReachedLimit}
            />
            <Label htmlFor={`active-switch-${coupon.id}`}>{t('coupon_activate')}</Label>
        </div>
      </CardFooter>
    </Card>
  );
}
