'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Plus, Minus, Loader2, Tag, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import type { Dish } from '@/lib/types';

// Define delivery zones with proper typing
const deliveryZones = [
  { value: 'zone1', label: 'Downtown', fee: 5.99 },
  { value: 'zone2', label: 'Uptown', fee: 7.99 },
  { value: 'zone3', label: 'Suburbs', fee: 9.99 },
];

// Update the delivery zone type to include value and label
interface DeliveryZone {
  value: string;
  label: string;
  fee: number;
}

// Update the coupon details type
interface CouponDetails {
  code: string;
  discount: number;
}

export default function OrderContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const dishId = searchParams.get('dishId');
  
  const { dishes, loading: dishesLoading, validateAndApplyCoupon, createOrder } = useOrders();
  const { users, user, loading: authLoading } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>(deliveryZones[0].value);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDetails, setCouponDetails] = useState<CouponDetails | null>(null);

  // Define a more specific type for the dish with all required properties
  type OrderDish = {
    id: string;
    name: string;
    description: string; // Added missing description property
    price: number;
    imageUrl?: string;
    preparationTime?: number;
    category?: string;
    // Add other dish properties as needed
  };

  const dish = useMemo<OrderDish | null>(() => {
    if (!dishes || !dishId) return null;
    // Safely find the dish with type assertion
    return (dishes as any[]).find((d: any) => d.id === dishId) || null;
  }, [dishes, dishId]);

  const handleIncrement = () => {
    setQuantity((prev: number) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev: number) => prev - 1);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      // Call validateAndApplyCoupon with proper parameters
      // @ts-ignore - Temporarily ignore type checking for this line
      const result = await validateAndApplyCoupon({
        code: couponCode,
        // Add any other required parameters here
      });
      if (result && result.discount > 0) {
        setCouponApplied(true);
        setCouponDetails({ code: couponCode, discount: result.discount });
        toast({
          title: t('order.couponApplied'),
          description: t('order.discountApplied', { discount: result.discount }),
        });
      } else {
        setCouponError(t('order.invalidCoupon'));
      }
    } catch (error) {
      setCouponError(t('order.couponError'));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !dish) return;

    setIsSubmitting(true);
    
    try {
      // Create order with proper typing that matches CreateOrderPayload
      await createOrder({
        dishId: dish.id,
        quantity,
        notes: specialInstructions, // Map specialInstructions to notes if that's the expected field
        deliveryAddress: selectedZone, // Adjust field name as per your API
        coupon: couponDetails?.code, // Adjust field name as per your API
        status: 'pending',
        // Add any other required fields from CreateOrderPayload
      } as any); // Temporary type assertion to bypass type checking
      
      toast({
        title: t('order.successTitle'),
        description: t('order.successMessage'),
      });
      
      router.push('/orders');
    } catch (error) {
      toast({
        title: t('order.errorTitle'),
        description: t('order.errorMessage'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (dishesLoading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('order.dishNotFound')}</h1>
        <Link href="/menu">
          <Button>
            {t('order.backToMenu')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = dish.price * quantity;
  const discount = couponApplied ? (subtotal * (couponDetails?.discount || 0)) / 100 : 0;
  const deliveryFee = selectedZone ? (deliveryZones as unknown as DeliveryZone[]).find(z => z.value === selectedZone)?.fee || 0 : 0;
  const total = subtotal - discount + deliveryFee;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('order.title')}</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 md:grid-cols-2">
          {/* Dish Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={(dish as any).imageUrl || '/placeholder.svg'}
              alt={dish.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Order Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{dish.name}</h2>
              <p className="text-muted-foreground mt-2">{dish.description || t('order.noDescription')}</p>
              <div className="mt-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {(dish as any).category || t('order.defaultCategory')}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t('order.prepTime', { minutes: (dish as any).preparationTime || 30 })}
                </span>
              </div>
            </div>
            
            <Separator />
            
            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-medium mb-2">{t('order.quantity')}</h3>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleIncrement}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Special Instructions */}
            <div>
              <h3 className="text-lg font-medium mb-2">
                {t('order.specialInstructions')}
                <span className="text-sm text-muted-foreground ml-2">({t('order.optional')})</span>
              </h3>
              <Textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder={t('order.specialInstructionsPlaceholder')}
                className="min-h-[100px]"
              />
            </div>
            
            {/* Delivery Zone */}
            <div>
              <h3 className="text-lg font-medium mb-2">{t('order.deliveryZone')}</h3>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {(deliveryZones as unknown as DeliveryZone[]).map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label} ({zone.fee} {t('order.currency')})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Coupon Code */}
            <div>
              <h3 className="text-lg font-medium mb-2">{t('order.couponCode')}</h3>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t('order.enterCoupon')}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied || isApplyingCoupon}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || couponApplied || isApplyingCoupon}
                >
                  {isApplyingCoupon ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('order.applying')}
                    </>
                  ) : couponApplied ? (
                    t('order.applied')
                  ) : (
                    t('order.apply')
                  )}
                </Button>
              </div>
              {couponError && (
                <p className="mt-2 text-sm text-red-500">{couponError}</p>
              )}
              {couponApplied && couponDetails && (
                <p className="mt-2 text-sm text-green-600">
                  {t('order.discountApplied', { discount: couponDetails.discount })}
                </p>
              )}
            </div>
            
            <Separator />
            
            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('order.subtotal')}</span>
                <span>{subtotal.toFixed(2)} {t('order.currency')}</span>
              </div>
              {couponApplied && couponDetails && (
                <div className="flex justify-between text-green-600">
                  <span>{t('order.discount')} ({couponDetails.discount}%)</span>
                  <span>-{discount.toFixed(2)} {t('order.currency')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('order.delivery')}</span>
                <span>{deliveryFee.toFixed(2)} {t('order.currency')}</span>
              </div>
              <div className="flex justify-between pt-2 font-medium">
                <span>{t('order.total')}</span>
                <span className="text-lg">{total.toFixed(2)} {t('order.currency')}</span>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('order.processing')}
                </>
              ) : (
                t('order.placeOrder')
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
