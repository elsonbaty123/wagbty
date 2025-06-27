
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import Image from 'next/image';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { containsProfanity } from '@/lib/profanity-filter';

interface ChefStatusFormProps {
  onFinished?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ChefStatusForm({ onFinished }: ChefStatusFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(user?.status?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const statusFormSchema = z.object({
    imageUrl: z.string().url(t('image_is_required')),
    caption: z.string().max(150, t('caption_max_length')).optional()
        .refine(val => !val || !containsProfanity(val), { message: t('inappropriate_language_detected') }),
  });

  type StatusFormValues = z.infer<typeof statusFormSchema>;

  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      imageUrl: user?.status?.imageUrl || '',
      caption: user?.status?.caption || '',
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ variant: 'destructive', title: t('file_too_large'), description: t('file_too_large_desc', { size: '5MB' }) });
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        form.setValue('imageUrl', dataUrl, { shouldValidate: true });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: StatusFormValues) => {
    if (!user) return;
    try {
      const statusId = user.status?.id || `status_${user.id}_${Date.now()}`;
      await updateUser({
        status: {
          id: statusId,
          imageUrl: data.imageUrl,
          caption: data.caption,
          createdAt: user.status?.createdAt || new Date().toISOString(), // Preserve original post time on edit
        }
      });
      toast({ title: t('status_posted') });
      onFinished?.();
    } catch (error) {
      toast({ variant: 'destructive', title: t('error'), description: t('failed_to_post_status') });
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{t('add_edit_status')}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pe-2">
          <FormField
            control={form.control}
            name="imageUrl"
            render={() => (
               <FormItem>
                <FormLabel>{t('status_image')}</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
                      {imagePreview ? (
                        <Image src={imagePreview} alt={t('status_preview')} width={400} height={225} className="w-full h-full object-contain rounded-md" />
                      ) : (
                        <span className="text-muted-foreground">{t('image_preview')}</span>
                      )}
                    </div>
                    <Input id="status-image-upload" type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                    <Label htmlFor="status-image-upload" className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer w-full')}>
                      {isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Upload className="me-2 h-4 w-4" />}
                      <span>{imagePreview ? t('change_image') : t('upload_image')}</span>
                    </Label>
                  </div>
                </FormControl>
                 <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('caption_optional')}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t('caption_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={form.formState.isSubmitting || isUploading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {form.formState.isSubmitting || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
              {t('post_status')}
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
