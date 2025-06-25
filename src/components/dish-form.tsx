
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Dish } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const dishFormSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  description: z.string().min(1, 'الوصف مطلوب'),
  price: z.coerce.number().positive('السعر يجب أن يكون رقمًا موجبًا'),
  imageUrl: z.string().url('يجب رفع صورة صالحة للطبق.'),
  ingredients: z.string().min(1, 'المكونات مطلوبة'),
  prepTime: z.coerce.number().int().positive('وقت التحضير يجب أن يكون رقمًا صحيحًا موجبًا'),
  category: z.string().min(1, 'التصنيف مطلوب'),
});

type DishFormValues = z.infer<typeof dishFormSchema>;

interface DishFormProps {
  dish?: Dish | null;
  onFinished?: () => void;
}

export function DishForm({ dish, onFinished }: DishFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addDish, updateDish } = useOrders();

  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      name: dish?.name || '',
      description: dish?.description || '',
      price: dish?.price || 0,
      imageUrl: dish?.imageUrl || '',
      ingredients: dish?.ingredients?.join(', ') || '',
      prepTime: dish?.prepTime || 0,
      category: dish?.category || '',
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(dish?.imageUrl || null);


  const onSubmit = (data: DishFormValues) => {
    if (!user || user.role !== 'chef') {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يجب أن تكون طاهياً لتنفيذ هذا الإجراء.' });
      return;
    }
    
    const dishPayload = {
      ...data,
      ingredients: data.ingredients.split(',').map(item => item.trim()).filter(item => item.length > 0),
    };

    if (dish) {
      updateDish({ ...dish, ...dishPayload });
      toast({
        title: 'تم تحديث الطبق',
        description: `تم حفظ طبق "${data.name}" بنجاح.`,
      });
    } else {
      addDish({ ...dishPayload, chefId: user.id, status: 'متوفرة' });
       toast({
        title: 'تم إضافة الطبق',
        description: `تم إضافة طبق "${data.name}" بنجاح.`,
      });
    }
    onFinished?.();
  };

  return (
    <DialogContent className="sm:max-w-md text-right">
      <DialogHeader>
        <DialogTitle>{dish ? 'تعديل الطبق' : 'إضافة طبق جديد'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
            name="ingredients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المكونات</FormLabel>
                <FormControl>
                  <Textarea placeholder="شوكولاتة، حليب، سكر..." {...field} className="text-right" />
                </FormControl>
                <FormDescription>
                  افصل بين كل مكون بفاصلة (,).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر (جنيه)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="150" {...field} className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="prepTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وقت التحضير (دقائق)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>التصنيف</FormLabel>
                <FormControl>
                  <Input placeholder="حلويات، مشويات، ..." {...field} className="text-right" />
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
                <FormLabel>صورة الطبق</FormLabel>
                <FormControl>
                  <div>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const dataUrl = reader.result as string;
                            setImagePreview(dataUrl);
                            form.setValue('imageUrl', dataUrl, { shouldValidate: true });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Label htmlFor="image-upload" className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer')}>
                      <Upload className="ml-2 h-4 w-4" />
                       <span>{imagePreview ? "تغيير الصورة" : "رفع صورة"}</span>
                    </Label>
                    {imagePreview && (
                        <Image src={imagePreview} alt="معاينة الصورة" width={200} height={112} className="mt-4 rounded-md object-cover" />
                    )}
                  </div>
                </FormControl>
                 <FormMessage />
              </FormItem>
            )}
          />

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
