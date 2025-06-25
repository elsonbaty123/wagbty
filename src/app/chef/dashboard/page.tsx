
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Utensils, ClipboardList, BookOpenCheck, Loader2, Upload, User as UserIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/context/order-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/order-card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function ChefDashboardPage() {
  const { user, loading, updateUser } = useAuth();
  const { getOrdersByChefId, updateOrderStatus } = useOrders();
  const router = useRouter();
  const { toast } = useToast();

  // State for settings form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'chef')) {
        router.push('/login');
    } else if (user) {
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone || '');
        setSpecialty(user.specialty || '');
        setBio(user.bio || '');
        setImagePreview(user.imageUrl || null);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <Skeleton className="h-12 w-64 mb-8" />
            <Skeleton className="h-10 w-72 mb-4" />
            <Skeleton className="h-[500px] w-full" />
        </div>
    )
  }
  
  const chefOrders = getOrdersByChefId(user.id);
  const pendingOrders = chefOrders.filter(o => o.status === 'جارٍ المراجعة');
  const otherOrders = chefOrders.filter(o => o.status !== 'جارٍ المراجعة');
  
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
        await updateUser({ name, email, phone, specialty, bio, imageUrl: imagePreview });
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
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">لوحة تحكم الشيف</h1>
        <p className="font-semibold text-lg">مرحبًا بعودتك، {user.name}!</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="menu">قائمة الطعام</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 my-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42,318.90 جنيه</div>
                        <p className="text-xs text-muted-foreground">+20.1% عن الشهر الماضي</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الطلبات النشطة</CardTitle>
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{chefOrders.filter(o => o.status === 'قيد التحضير' || o.status === 'جاهز للتوصيل').length}</div>
                        <p className="text-xs text-muted-foreground">قيد التنفيذ حاليًا</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">طلبات جديدة</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                        {pendingOrders.length} <Badge>للمراجعة</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">تتطلب موافقتك</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12">
                <h2 className="font-headline text-2xl font-bold mb-4">طلبات جديدة للمراجعة</h2>
                {pendingOrders.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} isChefView updateOrderStatus={updateOrderStatus}/>
                    ))}
                </div>
                ) : (
                <p className="text-muted-foreground">لا توجد طلبات جديدة في الوقت الحالي.</p>
                )}
            </div>

            <div className="mt-12">
                <h2 className="font-headline text-2xl font-bold mb-4">سجل الطلبات</h2>
                {otherOrders.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {otherOrders.map((order) => (
                    <OrderCard key={order.id} order={order} isChefView updateOrderStatus={updateOrderStatus} />
                    ))}
                </div>
                ) : (
                <p className="text-muted-foreground">لا يوجد طلبات سابقة.</p>
                )}
            </div>
        </TabsContent>
        
        <TabsContent value="menu">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>إدارة قائمة الطعام</CardTitle>
                    <CardDescription>
                    أضف أطباقًا جديدة، عدّل الأسعار، وحدّث حالة التوفر من صفحة إدارة القائمة المخصصة.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/chef/menu">
                        <BookOpenCheck className="ml-2 h-4 w-4" />
                        الانتقال إلى إدارة القائمة
                    </Link>
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

        <TabsContent value="settings">
             <Card className="mt-4">
                <CardHeader>
                <CardTitle>إعدادات الحساب</CardTitle>
                <CardDescription>تحديث معلوماتك الشخصية، سيرتك الذاتية، وصورة ملفك الشخصي.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 max-w-2xl">
                    <div className="space-y-2">
                        <Label>الصورة الشخصية</Label>
                        <div className="flex items-center gap-4">
                             <Avatar className="h-20 w-20">
                                <AvatarImage src={imagePreview || ''} alt={user.name} />
                                <AvatarFallback><UserIcon className="h-8 w-8" /></AvatarFallback>
                            </Avatar>
                            <Input id="chef-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <Label htmlFor="chef-image-upload" className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer')}>
                                <Upload className="ml-2 h-4 w-4" />
                                <span>تغيير الصورة</span>
                            </Label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="chef-name">الاسم الكامل</Label>
                            <Input id="chef-name" value={name} onChange={(e) => setName(e.target.value)} className="text-right" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="chef-email">البريد الإلكتروني</Label>
                            <Input id="chef-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-right" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="chef-phone">رقم الهاتف</Label>
                            <Input id="chef-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="text-right" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="chef-specialty">تخصص المطبخ</Label>
                            <Input id="chef-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="text-right" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="chef-bio">نبذة تعريفية (Bio)</Label>
                        <Textarea id="chef-bio" value={bio} onChange={(e) => setBio(e.target.value)} className="text-right" />
                    </div>

                    <div className="flex justify-start gap-2 pt-4 border-t">
                        <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            حفظ التغييرات
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
