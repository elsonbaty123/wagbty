
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/order-card';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils, Upload, Loader2, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PasswordChangeForm } from '@/components/password-change-form';


export default function ProfilePage() {
    const { user, loading, logout, updateUser } = useAuth();
    const { getOrdersByCustomerId } = useOrders();
    const router = useRouter();
    const { toast } = useToast();

    // State for settings form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
            setImagePreview(user.imageUrl || null);
        }
    }, [user, loading, router]);
    
    if (loading || !user) {
        return (
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
                <Skeleton className="h-12 w-48 mb-8" />
                <Skeleton className="h-10 w-72 mb-4" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (user.role !== 'customer') {
        router.push('/login');
        return null;
    }

    const myOrders = getOrdersByCustomerId(user.id);
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await updateUser({
                name,
                email,
                phone,
                imageUrl: imagePreview,
            });
            toast({
                title: 'تم تحديث الملف الشخصي',
                description: 'تم حفظ تغييراتك بنجاح.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ في التحديث',
                description: error.message || 'فشل حفظ التغييرات. يرجى المحاولة مرة أخرى.',
            });
        } finally {
            setIsSaving(false);
        }
    };


  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-8">أهلاً، {user.name}!</h1>
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="orders">طلباتي</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>سجل الطلبات</CardTitle>
              <CardDescription>عرض طلباتك السابقة والحالية وتتبع حالتها.</CardDescription>
            </CardHeader>
            <CardContent>
              {myOrders.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {myOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Utensils className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">لا توجد طلبات بعد</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    يبدو أنك لم تقم بأي طلب بعد. تصفح الأطباق وابدأ الطلب!
                  </p>
                  <Button asChild className="mt-6">
                    <a href="/">تصفح الأطباق</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الحساب</CardTitle>
              <CardDescription>تحديث معلوماتك الشخصية وصورة ملفك الشخصي.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              <div className="space-y-2">
                <Label>الصورة الشخصية</Label>
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={imagePreview || ''} alt={user.name} />
                        <AvatarFallback><UserIcon className="h-8 w-8" /></AvatarFallback>
                    </Avatar>
                    <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <Label htmlFor="image-upload" className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer')}>
                        <Upload className="ml-2 h-4 w-4" />
                        <span>تغيير الصورة</span>
                    </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-right" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="text-right" />
              </div>

              <div className="flex justify-start gap-2 pt-4 border-t">
                <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                    حفظ التغييرات
                </Button>
                <Button variant="destructive" onClick={logout}>تسجيل الخروج</Button>
              </div>
            </CardContent>
          </Card>
          <PasswordChangeForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
