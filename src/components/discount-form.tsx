
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Dish } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/context/order-context';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { dateLocales } from '@/components/language-manager';

interface DiscountFormProps {
  dish: Dish;
  onFinished?: () => void;
}

export function DiscountForm({ dish, onFinished }: DiscountFormProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { updateDish } = useOrders();

  const discountFormSchema = z.object({
    discountPercentage: z.coerce.number().min(0).max(100).optional().default(0),
    discountEndDate: z.date().optional(),
  }).refine(data => {
    if (data.discountPercentage && data.discountPercentage > 0) {
        return !!data.discountEndDate;
    }
    return true;
  }, {
      message: t('discount_end_date_required'),
      path: ['discountEndDate'],
  }).refine(data => {
      if (data.discountEndDate && data.discountPercentage && data.discountPercentage > 0) {
          return data.discountEndDate >= new Date(new Date().setHours(0, 0, 0, 0));
      }
      return true;
  }, {
      message: t('discount_end_date_in_future'),
      path: ['discountEndDate'],
  });

  type DiscountFormValues = z.infer<typeof discountFormSchema>;

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      discountPercentage: dish?.discountPercentage || 0,
      discountEndDate: dish?.discountEndDate ? new Date(dish.discountEndDate) : undefined,
    },
  });

  const onSubmit = (data: DiscountFormValues) => {
    const isDiscountActive = data.discountPercentage && data.discountPercentage > 0 && data.discountEndDate;

    const dishPayload = {
      discountPercentage: isDiscountActive ? data.discountPercentage : undefined,
      discountEndDate: isDiscountActive ? data.discountEndDate!.toISOString() : undefined,
    };
    
    updateDish({ ...dish, ...dishPayload });
    toast({
      title: t('discount_updated', 'Discount Updated'),
      description: t('discount_for_dish_updated', 'The discount for {{name}} has been updated.', { name: dish.name }),
    });
    
    onFinished?.();
  };
  
  const handleRemoveDiscount = () => {
    updateDish({
        ...dish,
        discountPercentage: undefined,
        discountEndDate: undefined,
    });
    toast({
        title: t('discount_removed', 'Discount Removed'),
        description: t('discount_for_dish_removed_desc', 'The discount for {{name}} has been removed.', { name: dish.name }),
    });
    onFinished?.();
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{t('set_discount_for', 'Set Discount for {{name}}', { name: dish.name })}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pe-2">
            <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('discount_percentage', 'Discount Percentage')}</FormLabel>
                    <FormControl>
                    <Input type="number" min="0" max="100" placeholder="e.g., 15 for 15%" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="discountEndDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>{t('discount_end_date', 'Discount End Date')}</FormLabel>
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

            <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-between w-full">
                <div>
                  {dish.discountPercentage && dish.discountPercentage > 0 && (
                      <Button type="button" variant="destructive" onClick={handleRemoveDiscount}>
                          <Trash2 className="me-2 h-4 w-4" />
                          {t('remove_discount', 'Remove Discount')}
                      </Button>
                  )}
                </div>
                <div className="flex gap-2">
                    <Button type="submit" disabled={form.formState.isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">{t('save')}</Button>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">{t('cancel')}</Button>
                    </DialogClose>
                </div>
            </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
