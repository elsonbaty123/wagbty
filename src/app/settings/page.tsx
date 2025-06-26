
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Loader2, User as UserIcon, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PasswordChangeForm } from '@/components/password-change-form';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { User } from '@/lib/types';
import { useNotifications } from '@/context/notification-context';
import { useOrders } from '@/context/order-context';

export default function SettingsPage() {
    const { user, loading, logout, updateUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { createNotification } = useNotifications();
    const { getOrdersByChefId } = useOrders();

    // Common state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phone, setPhone] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Customer-specific state
    const [address, setAddress] = useState('');

    // Chef-specific state
    const [specialty, setSpecialty] = useState('');
    const [bio, setBio] = useState('');
    
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
            setImagePreview(user.imageUrl || null);
            if (user.role === 'customer') {
                setAddress(user.address || '');
            }
            if (user.role === 'chef') {
                setSpecialty(user.specialty || '');
                setBio(user.bio || '');
            }
        }
    }, [user, loading, router]);
    
    if (loading || !user) {
        return (
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 max-w-4xl">
                <Skeleton className="h-12 w-48 mb-8" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }
    
    const validateEmail = (email: string): string => {
        if (!email.trim()) return "البريد الإلكتروني مطلوب.";
        const emailRegex = /^[a-zA-Z][^\s@]*@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return "البريد الإلكتروني غير صحيح. يجب أن يبدأ بحرف ويتبع الصيغة مثل: example@gmail.com";
        }
        return "";
    };

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
        const error = validateEmail(email);
        setEmailError(error);
        if (error) {
            return;
        }

        setIsSaving(true);
        try {
            const userDetails: Partial<User> = { name, email, phone, imageUrl: imagePreview };
            if (user.role === 'customer') {
                userDetails.address = address;
            }
            if (user.role === 'chef') {
                userDetails.specialty = specialty;
                userDetails.bio = bio;
            }

            await updateUser(userDetails);
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

    const handleStatusChange = async (newStatus: User['availabilityStatus']) => {
        if (!user) return;
        await updateUser({ availabilityStatus: newStatus });
        toast({ title: "تم تحديث حالة التوفر بنجاح." });

        if (user.availabilityStatus === 'busy' && newStatus === 'available') {
            const queuedOrders = getOrdersByChefId(user.id).filter(o => o.status === 'بانتظار توفر الطاهي');
            if (queuedOrders.length > 0) {
                createNotification({
                recipientId: user.id,
                title: `لديك ${queuedOrders.length} طلبات معلقة`,
                message: 'أصبحت متاحًا الآن. يرجى مراجعة الطلبات التي كانت في قائمة الانتظار.',
                link: '/chef/dashboard',
                });
            }
        }
    };
    
    const statusMap = {
        available: { label: 'متاح', color: 'bg-green-500' },
        busy: { label: 'مشغول', color: 'bg-yellow-500' },
        closed: { label: 'مغلق', color: 'bg-red-500' },
    };

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-8">إعدادات الحساب</h1>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>الملف الشخصي</CardTitle>
                        <CardDescription>تحديث معلوماتك الشخصية وصورة ملفك الشخصي.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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

                        {user.role === 'chef' && (
                             <div className="space-y-2">
                                <Label>حالة التوفر</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-end text-right">
                                            <span>{statusMap[user.availabilityStatus || 'available'].label}</span>
                                            <Circle className={`mr-2 h-3 w-3 flex-shrink-0 fill-current ${statusMap[user.availabilityStatus || 'available'].color}`} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 text-right">
                                        <DropdownMenuItem onClick={() => handleStatusChange('available')}>
                                            <Circle className="ml-2 h-3 w-3 fill-current bg-green-500" />
                                            <span>متاح</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange('busy')}>
                                            <Circle className="ml-2 h-3 w-3 fill-current bg-yellow-500" />
                                            <span>مشغول</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
                                            <Circle className="ml-2 h-3 w-3 fill-current bg-red-500" />
                                            <span>مغلق</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">الاسم الكامل</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="text-right" placeholder="الاسم الكامل" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if(emailError) setEmailError('');
                                    }} 
                                    className={cn("text-right", emailError && "border-destructive")} 
                                    placeholder="example@email.com" 
                                />
                                {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">رقم الهاتف</Label>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="text-right" placeholder="01XXXXXXXXX" />
                        </div>
                        {user.role === 'customer' && (
                            <div className="space-y-2">
                                <Label htmlFor="address">عنوان التوصيل</Label>
                                <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="text-right" placeholder="أدخل عنوانك الكامل هنا..." />
                            </div>
                        )}
                        {user.role === 'chef' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="chef-specialty">تخصص المطبخ</Label>
                                    <Input id="chef-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="text-right" placeholder="مثال: مطبخ إيطالي" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="chef-bio">نبذة تعريفية (Bio)</Label>
                                    <Textarea id="chef-bio" value={bio} onChange={(e) => setBio(e.target.value)} className="text-right" placeholder="نبذة تعريفية عنك وعن أسلوبك في الطهي..." />
                                </div>
                            </>
                        )}
                        <div className="flex justify-start gap-2 pt-4 border-t">
                            <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                                حفظ التغييرات
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <PasswordChangeForm />
                 <Card className="mt-6 border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">تسجيل الخروج</CardTitle>
                        <CardDescription>إنهاء جلستك الحالية.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button variant="destructive" onClick={logout}>تسجيل الخروج</Button>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}
