
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
import { useTranslation } from 'react-i18next';

interface DishFormProps {
  dish?: Dish | null;
  onFinished?: () => void;
}

export function DishForm({ dish, onFinished }: DishFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addDish, updateDish } = useOrders();

  const dishFormSchema = z.object({
    name: z.string().min(1, t('dish_name_required')),
    description: z.string().min(1, t('dish_description_required')),
    price: z.coerce.number().positive(t('price_positive')),
    imageUrl: z.string().url(t('dish_image_required')),
    ingredients: z.string().min(1, t('dish_ingredients_required')),
    prepTime: z.coerce.number().int().positive(t('prep_time_positive')),
    category: z.string().min(1, t('category_required')),
  });

  type DishFormValues = z.infer<typeof dishFormSchema>;


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
      toast({ variant: 'destructive', title: t('error'), description: t('must_be_chef') });
      return;
    }
    
    const dishPayload = {
      ...data,
      ingredients: data.ingredients.split(',').map(item => item.trim()).filter(item => item.length > 0),
    };

    if (dish) {
      updateDish({ ...dish, ...dishPayload });
      toast({
        title: t('dish_updated_toast'),
        description: t('dish_updated_toast_desc', { name: data.name }),
      });
    } else {
      addDish({ ...dishPayload, chefId: user.id, status: 'available' });
       toast({
        title: t('dish_added_toast'),
        description: t('dish_added_toast_desc', { name: data.name }),
      });
    }
    onFinished?.();
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{dish ? t('edit_dish') : t('add_new_dish_title')}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pe-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('dish_name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('dish_name_placeholder')} {...field} />
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
                <FormLabel>{t('dish_description')}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t('dish_description_placeholder')} {...field} />
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
                <FormLabel>{t('ingredients')}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t('dish_ingredients_placeholder')} {...field} />
                </FormControl>
                <FormDescription>
                  {t('dish_ingredients_separator')}
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
                    <FormLabel>{t('price_egp')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="150" {...field} />
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
                    <FormLabel>{t('prep_time_minutes')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} />
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
                <FormLabel>{t('category')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('category_placeholder')} {...field} />
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
                <FormLabel>{t('dish_image')}</FormLabel>
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
                      <Upload className="me-2 h-4 w-4" />
                       <span>{imagePreview ? t("change_image") : t("upload_image")}</span>
                    </Label>
                    {imagePreview && (
                        <Image src={imagePreview} alt={t('image_preview')} width={200} height={112} className="mt-4 rounded-md object-cover" />
                    )}
                  </div>
                </FormControl>
                 <FormMessage />
              </FormItem>
            )}
          />

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
