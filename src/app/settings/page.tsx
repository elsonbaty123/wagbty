
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
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
    const { t } = useTranslation();
    const { user, loading, logout, updateUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { createNotification } = useNotifications();
    const { getOrdersByChefId } = useOrders();

    // Common state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
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
        if (!email.trim()) return t('validation_email_required');
    
        if (!/^[a-zA-Z]/.test(email)) {
          return t('validation_email_must_start_with_letter');
        }
    
        if (!email.includes('@')) {
            return t('validation_email_must_contain_at');
        }
    
        if (/[^a-zA-Z0-9@._-]/.test(email)) {
          return t('validation_email_contains_invalid_chars');
        }
        
        const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          return t('validation_email_invalid_format');
        }
        
        return '';
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
        if (error) {
            toast({
                variant: 'destructive',
                title: t('error_in_email'),
                description: error,
            });
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
                title: t('profile_updated'),
                description: t('profile_updated_desc'),
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('update_error'),
                description: error.message || t('update_error_desc'),
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: User['availabilityStatus']) => {
        if (!user) return;
        
        const oldStatus = user.availabilityStatus;
        await updateUser({ availabilityStatus: newStatus });
        toast({ title: t("availability_status_updated") });

        if (oldStatus === 'busy' && newStatus === 'available') {
            const queuedOrders = getOrdersByChefId(user.id).filter(o => o.status === 'waiting_for_chef');
            if (queuedOrders.length > 0) {
                createNotification({
                    recipientId: user.id,
                    titleKey: 'you_have_pending_orders',
                    messageKey: 'pending_orders_desc',
                    params: { count: queuedOrders.length },
                    link: '/chef/dashboard',
                });
            }
        }
    };
    
    const statusMap = {
        available: { labelKey: 'status_available', color: 'bg-green-500' },
        busy: { labelKey: 'status_busy', color: 'bg-yellow-500' },
        closed: { labelKey: 'status_closed', color: 'bg-red-500' },
    };

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-8">{t('account_settings')}</h1>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('profile')}</CardTitle>
                        <CardDescription>{t('profile_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2 text-start">
                            <Label>{t('profile_picture')}</Label>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={imagePreview || ''} alt={user.name} />
                                    <AvatarFallback><UserIcon className="h-8 w-8" /></AvatarFallback>
                                </Avatar>
                                <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                <Label htmlFor="image-upload" className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer')}>
                                    <Upload className="me-2 h-4 w-4" />
                                    <span>{t('change_picture')}</span>
                                </Label>
                            </div>
                        </div>

                        {user.role === 'chef' && (
                             <div className="space-y-2 text-start">
                                <Label>{t('availability_status')}</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-start">
                                            <Circle className={`me-2 h-3 w-3 flex-shrink-0 fill-current ${statusMap[user.availabilityStatus || 'available'].color}`} />
                                            <span>{t(statusMap[user.availabilityStatus || 'available'].labelKey)}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-56">
                                        <DropdownMenuItem onClick={() => handleStatusChange('available')}>
                                            <Circle className="me-2 h-3 w-3 flex-shrink-0 fill-current bg-green-500" />
                                            <span>{t('status_available')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange('busy')}>
                                            <Circle className="me-2 h-3 w-3 flex-shrink-0 fill-current bg-yellow-500" />
                                            <span>{t('status_busy')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
                                            <Circle className="me-2 h-3 w-3 flex-shrink-0 fill-current bg-red-500" />
                                            <span>{t('status_closed')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 text-start">
                                <Label htmlFor="name">{t('full_name_label')}</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('full_name_placeholder')} />
                            </div>
                            <div className="space-y-2 text-start">
                                <Label htmlFor="email">{t('email_label')}</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="example@email.com" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2 text-start">
                            <Label htmlFor="phone">{t('phone_number_label')}</Label>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                        </div>
                        {user.role === 'customer' && (
                            <div className="space-y-2 text-start">
                                <Label htmlFor="address">{t('delivery_address_label')}</Label>
                                <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('delivery_address_placeholder')} />
                            </div>
                        )}
                        {user.role === 'chef' && (
                            <>
                                <div className="space-y-2 text-start">
                                    <Label htmlFor="chef-specialty">{t('kitchen_specialty_label')}</Label>
                                    <Input id="chef-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder={t('kitchen_specialty_placeholder_alt')} />
                                </div>
                                <div className="space-y-2 text-start">
                                    <Label htmlFor="chef-bio">{t('bio_label')}</Label>
                                    <Textarea id="chef-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('bio_placeholder')} />
                                </div>
                            </>
                        )}
                        <div className="flex justify-start gap-2 pt-4 border-t">
                            <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                {isSaving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
                                {t('save_changes')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <PasswordChangeForm />
                 <Card className="mt-6 border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">{t('logout')}</CardTitle>
                        <CardDescription>{t('logout_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button variant="destructive" onClick={logout}>{t('logout')}</Button>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}
