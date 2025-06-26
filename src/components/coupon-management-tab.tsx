
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { PlusCircle, Tag } from 'lucide-react';
import type { Coupon } from '@/lib/types';
import { CouponCard } from './coupon-card';
import { CouponForm } from './coupon-form';
import { useTranslation } from 'react-i18next';

export function CouponManagementTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { getCouponsByChefId } = useOrders();
  const [isCouponDialogOpen, setCouponDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  if (!user) return null;

  const chefCoupons = getCouponsByChefId(user.id);

  const handleOpenDialog = (coupon: Coupon | null) => {
    setSelectedCoupon(coupon);
    setCouponDialogOpen(true);
  };

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>{t('coupon_management')}</CardTitle>
              <CardDescription>
                {t('coupon_management_desc')}
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="me-2 h-4 w-4" />
              {t('create_new_coupon')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chefCoupons.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {chefCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onEdit={() => handleOpenDialog(coupon)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border-2 border-dashed rounded-lg">
                <Tag className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-medium">{t('no_coupons')}</h3>
                <p className="mt-2 text-md text-muted-foreground">
                    {t('no_coupons_desc')}
                </p>
                <Button onClick={() => handleOpenDialog(null)} className="mt-6">
                    <PlusCircle className="me-2 h-4 w-4" />
                    {t('create_first_coupon')}
                </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCouponDialogOpen} onOpenChange={setCouponDialogOpen}>
        <CouponForm
          coupon={selectedCoupon}
          onFinished={() => setCouponDialogOpen(false)}
        />
      </Dialog>
    </>
  );
}
