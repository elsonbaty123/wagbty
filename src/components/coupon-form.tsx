
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Coupon } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ar } from 'date-fns/locale';

const couponFormSchema = z.object({
    code: z.string().min(3, 'الرمز يجب أن يكون 3 أحرف على الأقل').regex(/^[a-zA-Z0-9]+$/, 'الرمز يجب أن يحتوي على أحرف وأرقام إنجليزية فقط'),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.coerce.number().positive('قيمة الخصم يجب أن تكون موجبة'),
    startDate: z.date({ required_error: 'تاريخ البدء مطلوب' }),
    endDate: z.date({ required_error: 'تاريخ الانتهاء مطلوب' }),
    usageLimit: z.coerce.number().int().min(1, 'حد الاستخدام يجب أن يكون 1 على الأقل'),
}).refine(data => data.endDate > data.startDate, {
    message: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء',
    path: ['endDate'],
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

interface CouponFormProps {
  coupon?: Coupon | null;
  onFinished?: () => void;
}

export function CouponForm({ coupon, onFinished }: CouponFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createCoupon, updateCoupon } = useOrders();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code || '',
      discountType: coupon?.discountType || 'percentage',
      discountValue: coupon?.discountValue || 10,
      startDate: coupon ? new Date(coupon.startDate) : new Date(),
      endDate: coupon ? new Date(coupon.endDate) : new Date(new Date().setDate(new Date().getDate() + 7)),
      usageLimit: coupon?.usageLimit || 100,
    },
  });

  const onSubmit = (data: CouponFormValues) => {
    if (!user || user.role !== 'chef') {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يجب أن تكون طاهياً لتنفيذ هذا الإجراء.' });
      return;
    }
    
    const couponPayload = {
      ...data,
      chefId: user.id,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      isActive: true,
    };

    if (coupon) {
      updateCoupon({ ...coupon, ...couponPayload });
      toast({ title: 'تم تحديث القسيمة' });
    } else {
      createCoupon(couponPayload);
      toast({ title: 'تم إنشاء القسيمة بنجاح' });
    }
    onFinished?.();
  };

  return (
    <DialogContent className="sm:max-w-md text-right">
      <DialogHeader>
        <DialogTitle>{coupon ? 'تعديل القسيمة' : 'إنشاء قسيمة جديدة'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>رمز القسيمة</FormLabel>
                    <FormControl>
                    <Input placeholder="SAVE10" {...field} className="text-left font-mono" />
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
                    <FormLabel>نوع الخصم</FormLabel>
                    <FormControl>
                    <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                    >
                        <FormItem className="flex items-center space-x-2 space-x-reverse">
                            <FormControl>
                                <RadioGroupItem value="percentage" id="percentage" />
                            </FormControl>
                            <FormLabel htmlFor="percentage" className="font-normal">نسبة مئوية (%)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-x-reverse">
                            <FormControl>
                                <RadioGroupItem value="fixed" id="fixed" />
                            </FormControl>
                            <FormLabel htmlFor="fixed" className="font-normal">مبلغ ثابت (جنيه)</FormLabel>
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
                        <FormLabel>قيمة الخصم</FormLabel>
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
                        <FormLabel>حد الاستخدام</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>تاريخ البدء</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                {field.value ? format(field.value, 'd MMMM yyyy', { locale: ar }) : <span>اختر تاريخ</span>}
                                <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus />
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
                        <FormLabel>تاريخ الانتهاء</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                {field.value ? format(field.value, 'd MMMM yyyy', { locale: ar }) : <span>اختر تاريخ</span>}
                                <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < form.getValues('startDate')} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            

          <DialogFooter className="pt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">إلغاء</Button>
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">حفظ</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
