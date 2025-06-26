
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Plus, Minus, Loader2, Tag, Clock } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

export default function OrderPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const dishId = searchParams.get('dishId');
  
  const { dishes, loading: dishesLoading, validateAndApplyCoupon, createOrder } = useOrders();
  const { users, user, loading: authLoading } = useAuth();

  const dish = useMemo(() => dishes.find(d => d.id === dishId), [dishId, dishes]);
  const chef = useMemo(() => dish ? users.find(u => u.id === dish.chefId) : null, [dish, users]);
  
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (authLoading || dishesLoading) {
      return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid gap-12 md:grid-cols-2">
                <div>
                    <Skeleton className="h-10 w-72 mb-6" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
      );
  }
  
  if (!dish || !chef) {
    notFound();
  }
  
  const isChefBusy = chef.availabilityStatus === 'busy';
  const isChefClosed = chef.availabilityStatus === 'closed';

  const subtotal = dish.price * quantity;
  const deliveryFee = 50.0;
  const total = subtotal - appliedDiscount + deliveryFee;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    setAppliedDiscount(0);

    setTimeout(() => {
        const result = validateAndApplyCoupon(couponCode, dish.chefId, dish.id, subtotal);
        
        if (result.error) {
            setCouponError(result.error);
        } else {
            setAppliedDiscount(result.discount);
            setAppliedCouponCode(couponCode);
            toast({ title: t('coupon_applied_toast') });
        }
        setIsApplyingCoupon(false);
    }, 500);
  };
  
  const handleConfirmOrder = () => {
    if (!user || !chef || !user.address) {
      toast({
        variant: 'destructive',
        title: t('order_error'),
        description: t('order_error_desc'),
      });
      return;
    }

    createOrder({
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone || 'N/A',
      deliveryAddress: user.address,
      dish: dish,
      chef: chef,
      quantity: quantity,
      subtotal: subtotal,
      discount: appliedDiscount,
      deliveryFee: deliveryFee,
      total: total,
      appliedCouponCode: appliedDiscount > 0 ? appliedCouponCode : undefined,
    });

    toast({
      title: t('order_sent_toast'),
      description: isChefBusy
        ? t('order_sent_toast_waitlisted_desc')
        : t('order_sent_toast_review_desc', { quantity, dishName: dish.name }),
    });

    router.push('/profile');
  };
  
  const getButtonText = () => {
      if (isChefClosed) return t('chef_is_currently_closed');
      if (isChefBusy) return t('confirm_order_waitlisted');
      return t('confirm_order');
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/dishes/${dish.id}`}>
            <ArrowRight className="me-2 h-4 w-4" />
            {t('back_to_dish_page')}
          </Link>
        </Button>
      </div>
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary mb-6">{t('complete_your_order')}</h1>
           {isChefClosed && (
              <Alert variant="destructive" className="mb-6">
                  <AlertTitle>{t('chef_is_currently_closed')}</AlertTitle>
                  <AlertDescription>
                    {t('chef_is_currently_closed_desc')}
                  </AlertDescription>
              </Alert>
          )}
          {!user ? (
             <Card>
              <CardHeader>
                <CardTitle>{t('login_required')}</CardTitle>
                <CardDescription>
                  {t('login_required_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={`/login?redirect=/order?dishId=${dishId}`}>{t('login')}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/signup?redirect=/order?dishId=${dishId}`}>{t('create_new_account')}</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('delivery_information')}</CardTitle>
                <CardDescription>{t('delivery_information_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="font-semibold">{user.name}</p>
                 <p>{user.address || t('no_address_yet')}</p>
                 <p>{user.phone || t('no_phone_provided')}</p>
                 <Button variant="outline" asChild>
                    <Link href="/settings">{t('change_address_from_settings')}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-6">
           {isChefBusy && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>{t('chef_is_busy')}</AlertTitle>
                <AlertDescription>
                  {t('chef_is_busy_desc')}
                </AlertDescription>
              </Alert>
            )}
           <h2 className="font-headline text-2xl font-bold">{t('order_summary')}</h2>
            <Card>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="grid gap-1 flex-1">
                        <h3 className="font-semibold">{dish.name}</h3>
                        <p className="text-sm text-muted-foreground">{dish.description}</p>
                        <p className="font-bold text-primary">{dish.price.toFixed(2)} {t('currency_egp')}</p>
                    </div>
                     <Image
                      alt={dish.name}
                      className="rounded-md object-cover"
                      height="80"
                      src={dish.imageUrl}
                      data-ai-hint="food item"
                      width="80"
                    />
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q+1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Input type="number" value={quantity} readOnly className="w-16 h-8 text-center" />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q-1))}>
                            <Minus className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="font-medium">{t('quantity:')}</span>
                </CardFooter>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>{t('discount_coupon')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder={t('enter_coupon_code')}
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            disabled={!user || isChefClosed}
                        />
                        <Button onClick={handleApplyCoupon} disabled={!user || isApplyingCoupon || isChefClosed}>
                            {isApplyingCoupon && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                            {t('apply')}
                        </Button>
                    </div>
                    {couponError && <p className="text-sm text-destructive mt-2">{couponError}</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t('payment_details')}</CardTitle>
                </CardHeader>
                 <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span>{subtotal.toFixed(2)} {t('currency_egp')}</span>
                        <span className="text-muted-foreground">{t('subtotal')}</span>
                    </div>
                    {appliedDiscount > 0 && (
                        <div className="flex items-center justify-between text-green-600">
                            <span>- {appliedDiscount.toFixed(2)} {t('currency_egp')}</span>
                            <span className="flex items-center gap-1">
                                {t('discount:')} ({appliedCouponCode})
                                <Tag className="h-4 w-4" />
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span>{deliveryFee.toFixed(2)} {t('currency_egp')}</span>
                        <span className="text-muted-foreground">{t('delivery_fee')}</span>
                    </div>
                     <Separator />
                     <div className="flex items-center justify-between font-bold text-lg">
                        <span>{total.toFixed(2)} {t('currency_egp')}</span>
                        <span className="text-primary">{t('total')}</span>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleConfirmOrder} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={!user || isChefClosed}>
                    {getButtonText()}
                  </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
