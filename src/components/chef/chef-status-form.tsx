
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
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Camera, Video, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { containsProfanity } from '@/lib/profanity-filter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ChefStatusFormProps {
  onFinished?: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

export function ChefStatusForm({ onFinished }: ChefStatusFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  
  const [mediaPreview, setMediaPreview] = useState<string | null>(user?.status?.imageUrl || null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>(user?.status?.type || 'image');
  const [isUploading, setIsUploading] = useState(false);
  
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const statusFormSchema = z.object({
    type: z.enum(['image', 'video']),
    imageUrl: z.string().url(t('media_is_required')),
    caption: z.string().max(150, t('caption_max_length')).optional()
        .refine(val => !val || !containsProfanity(val), { message: t('inappropriate_language_detected') }),
  });

  type StatusFormValues = z.infer<typeof statusFormSchema>;

  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      type: user?.status?.type || 'image',
      imageUrl: user?.status?.imageUrl || '',
      caption: user?.status?.caption || '',
    },
  });

  const stopCamera = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    setIsCameraOn(false);
    if(videoRef.current) videoRef.current.srcObject = null;
  };

  const startCamera = async () => {
    try {
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Camera not supported on this browser.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
    } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
            variant: "destructive",
            title: t('camera_access_denied'),
            description: t('camera_access_denied_desc'),
        });
        setIsCameraOn(false);
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/webp');
        setMediaPreview(dataUrl);
        setMediaType('image');
        form.setValue('imageUrl', dataUrl, { shouldValidate: true });
        form.setValue('type', 'image');
        stopCamera();
    }
  };
  
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        toast({ variant: 'destructive', title: t('file_too_large'), description: t('file_too_large_desc', { size: `${maxSize / 1024 / 1024}MB` }) });
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setMediaPreview(dataUrl);
        const newMediaType = isVideo ? 'video' : 'image';
        setMediaType(newMediaType);
        form.setValue('imageUrl', dataUrl, { shouldValidate: true });
        form.setValue('type', newMediaType);
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
          type: data.type,
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
  
  useEffect(() => {
      // Cleanup camera on component unmount
      return () => {
          stopCamera();
      };
  }, []);

  return (
    <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
        if(isCameraOn) e.preventDefault();
    }} onEscapeKeyDown={(e) => {
        if(isCameraOn) e.preventDefault();
    }}>
      <DialogHeader>
        <DialogTitle>{t('add_edit_status')}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pe-2">
            <div className="w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50 overflow-hidden relative">
                {isCameraOn ? (
                     <>
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        <div className="absolute bottom-4 flex gap-4">
                            <Button type="button" onClick={handleCapturePhoto}>{t('capture_photo')}</Button>
                            <Button type="button" variant="secondary" onClick={stopCamera}>{t('cancel')}</Button>
                        </div>
                     </>
                ) : mediaPreview ? (
                    mediaType === 'image' ? (
                        <Image src={mediaPreview} alt={t('status_preview')} layout="fill" objectFit="contain" />
                    ) : (
                        <video src={mediaPreview} className="w-full h-full object-contain" controls />
                    )
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <ImageIcon className="mx-auto h-12 w-12" />
                        <p className="mt-2">{t('media_preview')}</p>
                    </div>
                )}
            </div>
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertTitle>{t('camera_access_denied')}</AlertTitle>
                    <AlertDescription>{t('camera_access_denied_desc')}</AlertDescription>
                </Alert>
            )}
           
          <FormField
            control={form.control}
            name="imageUrl"
            render={() => (
               <FormItem>
                <FormLabel className="sr-only">{t('status_media')}</FormLabel>
                <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                        <Input id="media-upload" type="file" accept="image/png, image/jpeg, image/webp, video/mp4, video/quicktime" className="hidden" onChange={handleMediaUpload} disabled={isUploading || isCameraOn} />
                        <Label htmlFor="media-upload" className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer')}>
                            {isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Upload className="me-2 h-4 w-4" />}
                            <span>{mediaPreview ? t('change_media') : t('upload_media')}</span>
                        </Label>
                         <Button type="button" variant="outline" onClick={startCamera} disabled={isCameraOn}>
                            <Camera className="me-2 h-4 w-4" />
                            {t('take_photo')}
                        </Button>
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
            <Button type="submit" disabled={form.formState.isSubmitting || isUploading || isCameraOn} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {form.formState.isSubmitting || isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
              {t('post_status')}
            </Button>
            <DialogClose asChild>
                <Button type="button" variant="secondary">{t('close')}</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
