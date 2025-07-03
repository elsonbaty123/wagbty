
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/context/order-context';
import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { NotDeliveredResponsibility } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface NotDeliveredFormProps {
  orderId: string;
  onFinished?: () => void;
}

const responsibilityOptions: NotDeliveredResponsibility[] = [
  'customer_unavailable',
  'customer_refused',
  'address_issue',
  'external_issue',
  'other',
];

export function NotDeliveredForm({ orderId, onFinished }: NotDeliveredFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { markOrderAsNotDelivered } = useOrders();

  const notDeliveredSchema = z.object({
    responsibility: z.enum(responsibilityOptions, {
      required_error: t('you_need_to_select_a_reason', 'You need to select a reason'),
    }),
    reason: z.string().min(10, {
      message: t('reason_must_be_10_chars', 'Reason must be at least 10 characters'),
    }).max(500, {
      message: t('reason_must_be_less_than_500_chars', 'Reason must be less than 500 characters'),
    }),
  });
  
  type NotDeliveredFormValues = z.infer<typeof notDeliveredSchema>;

  const form = useForm<NotDeliveredFormValues>({
    resolver: zodResolver(notDeliveredSchema),
    defaultValues: {
      reason: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: NotDeliveredFormValues) => {
    try {
      await markOrderAsNotDelivered(orderId, data);
      toast({ title: t('non_delivery_report_submitted', 'Non-delivery report submitted') });
      onFinished?.();
    } catch (error) {
      console.error('Error submitting non-delivery report:', error);
      toast({ 
        variant: 'destructive', 
        title: t('error', 'Error'), 
        description: t('something_went_wrong', 'Something went wrong. Please try again.') 
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{t('report_non_delivery')}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pe-2">
            <FormField
                control={form.control}
                name="responsibility"
                render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>{t('responsible_party')}</FormLabel>
                    <FormControl>
                    <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                    >
                        {responsibilityOptions.map(option => (
                           <FormItem key={option} className="flex items-center space-x-3 rtl:space-x-reverse space-y-0">
                             <FormControl>
                               <RadioGroupItem value={option} />
                             </FormControl>
                             <FormLabel className="font-normal">
                               {t(`responsibility_${option}`)}
                             </FormLabel>
                           </FormItem>
                        ))}
                    </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('non_delivery_reason')}</FormLabel>
                    <FormControl>
                    <Textarea
                        placeholder={t('non_delivery_reason_placeholder')}
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          
          <DialogFooter className="pt-4">
             <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('submit_report')}
            </Button>
            <DialogClose asChild>
                <Button type="button" variant="secondary">{t('cancel')}</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
