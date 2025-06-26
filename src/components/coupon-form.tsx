
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Coupon, Dish } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { dateLocales } from './language-manager';

interface CouponFormProps {
  coupon?: Coupon | null;
  onFinished?: () => void;
}

export function CouponForm({ coupon, onFinished }: CouponFormProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { dishes, createCoupon, updateCoupon } = useOrders();

  const chefDishes = dishes.filter(d => d.chefId === user?.id);

  const couponFormSchema = z.object({
      code: z.string().min(3, t('coupon_code_min_length')).regex(/^[a-zA-Z0-9]+$/, t('coupon_code_alphanumeric')),
      discountType: z.enum(['percentage', 'fixed']),
      discountValue: z.coerce.number().positive(t('discount_value_positive')),
      startDate: z.date({ required_error: t('start_date_required') }),
      endDate: z.date({ required_error: t('end_date_required') }),
      usageLimit: z.coerce.number().int().min(1, t('usage_limit_min')),
      appliesTo: z.enum(['all', 'specific']),
      applicableDishIds: z.array(z.string()).optional(),
  }).refine(data => data.endDate > data.startDate, {
      message: t('end_date_after_start_date'),
      path: ['endDate'],
  }).refine(data => {
      if (data.appliesTo === 'specific') {
          return data.applicableDishIds && data.applicableDishIds.length > 0;
      }
      return true;
  }, {
      message: t('select_one_dish_for_specific'),
      path: ['applicableDishIds'],
  });

  type CouponFormValues = z.infer<typeof couponFormSchema>;

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code || '',
      discountType: coupon?.discountType || 'percentage',
      discountValue: coupon?.discountValue || 10,
      startDate: coupon ? new Date(coupon.startDate) : new Date(),
      endDate: coupon ? new Date(coupon.endDate) : new Date(new Date().setDate(new Date().getDate() + 7)),
      usageLimit: coupon?.usageLimit || 100,
      appliesTo: coupon?.appliesTo || 'all',
      applicableDishIds: coupon?.applicableDishIds || [],
    },
  });
  
  const appliesTo = form.watch('appliesTo');

  const onSubmit = (data: CouponFormValues) => {
    if (!user || user.role !== 'chef') {
      toast({ variant: 'destructive', title: t('error'), description: t('must_be_chef') });
      return;
    }
    
    const couponPayload = {
      ...data,
      chefId: user.id,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      isActive: coupon ? coupon.isActive : true, // Preserve status on update
      applicableDishIds: data.appliesTo === 'all' ? [] : data.applicableDishIds,
    };

    if (coupon) {
      updateCoupon({ ...coupon, ...couponPayload });
      toast({ title: t('coupon_updated') });
    } else {
      createCoupon(couponPayload);
      toast({ title: t('coupon_created') });
    }
    onFinished?.();
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{coupon ? t('edit_coupon') : t('create_new_coupon')}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pe-2">
            <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('coupon_code')}</FormLabel>
                    <FormControl>
                    <Input placeholder="SAVE10" {...field} className="font-mono" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>{t('discount_type')}</FormLabel>
                    <FormControl>
                    <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                    >
                        <FormItem className="flex items-center space-x-2 space-x-reverse">
                            <FormLabel htmlFor="percentage" className="font-normal">{t('discount_type_percentage')}</FormLabel>
                            <FormControl>
                                <RadioGroupItem value="percentage" id="percentage" />
                            </FormControl>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-x-reverse">
                            <FormLabel htmlFor="fixed" className="font-normal">{t('discount_type_fixed')}</FormLabel>
                            <FormControl>
                                <RadioGroupItem value="fixed" id="fixed" />
                            </FormControl>
                        </FormItem>
                    </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('discount_value')}</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="usageLimit"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('usage_limit')}</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="appliesTo"
                render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>{t('applies_to')}</FormLabel>
                    <FormControl>
                    <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                    >
                        <FormItem className="flex items-center space-x-2 space-x-reverse">
                            <FormLabel htmlFor="all" className="font-normal">{t('all_dishes')}</FormLabel>
                            <FormControl>
                                <RadioGroupItem value="all" id="all" />
                            </FormControl>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-x-reverse">
                             <FormLabel htmlFor="specific" className="font-normal">{t('specific_dishes')}</FormLabel>
                            <FormControl>
                                <RadioGroupItem value="specific" id="specific" />
                            </FormControl>
                        </FormItem>
                    </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {appliesTo === 'specific' && (
                <FormField
                    control={form.control}
                    name="applicableDishIds"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel>{t('specific_dishes_label')}</FormLabel>
                                <FormDescription>
                                    {t('specific_dishes_desc')}
                                </FormDescription>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                            {chefDishes.map((dish) => (
                                <FormField
                                    key={dish.id}
                                    control={form.control}
                                    name="applicableDishIds"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={dish.id}
                                                className="flex flex-row items-start space-x-3 space-x-reverse"
                                            >
                                                <FormLabel className="font-normal">
                                                    {dish.name}
                                                </FormLabel>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(dish.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...(field.value || []), dish.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== dish.id
                                                                )
                                                                )
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )
                                    }}
                                />
                            ))}
                            {chefDishes.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center">{t('no_dishes_to_add')}</p>
                            )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

             <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>{t('start_date')}</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn("w-full ps-3 text-start font-normal", !field.value && "text-muted-foreground")}
                                >
                                {field.value ? format(field.value, 'd MMMM yyyy', { locale: dateLocales[i18n.language] }) : <span>{t('pick_a_date')}</span>}
                                <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus locale={dateLocales[i18n.language]} />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>{t('end_date')}</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn("w-full ps-3 text-start font-normal", !field.value && "text-muted-foreground")}
                                >
                                {field.value ? format(field.value, 'd MMMM yyyy', { locale: dateLocales[i18n.language] }) : <span>{t('pick_a_date')}</span>}
                                <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < form.getValues('startDate')} initialFocus locale={dateLocales[i18n.language]} />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">{t('save')}</Button>
            <DialogClose asChild>
                <Button type="button" variant="secondary">{t('cancel')}</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
