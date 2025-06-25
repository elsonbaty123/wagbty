'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Dish } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const dishFormSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  description: z.string().min(1, 'الوصف مطلوب'),
  price: z.coerce.number().positive('السعر يجب أن يكون رقمًا موجبًا'),
  imageUrl: z.string().url('رابط الصورة غير صالح').or(z.literal('')),
});

type DishFormValues = z.infer<typeof dishFormSchema>;

interface DishFormProps {
  dish?: Dish | null;
  onFinished?: () => void;
}

export function DishForm({ dish, onFinished }: DishFormProps) {
  const { toast } = useToast();
  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      name: dish?.name || '',
      description: dish?.description || '',
      price: dish?.price || 0,
      imageUrl: dish?.imageUrl || 'https://placehold.co/400x225.png',
    },
  });

  const onSubmit = (data: DishFormValues) => {
    console.log(data);
    toast({
      title: dish ? 'تم تحديث الطبق' : 'تم إضافة الطبق',
      description: `تم حفظ طبق "${data.name}" بنجاح.`,
    });
    onFinished?.();
  };

  return (
    <DialogContent className="sm:max-w-[425px] text-right">
      <DialogHeader>
        <DialogTitle>{dish ? 'تعديل الطبق' : 'إضافة طبق جديد'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الطبق</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: كيكة الشوكولاتة" {...field} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وصف الطبق</FormLabel>
                <FormControl>
                  <Textarea placeholder="وصف قصير للطبق" {...field} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السعر (بالجنيه المصري)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="150" {...field} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط صورة الطبق</FormLabel>
                <FormControl>
                  <Input placeholder="https://placehold.co/400x225.png" {...field} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">إلغاء</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">حفظ</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
