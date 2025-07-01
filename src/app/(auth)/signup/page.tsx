
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PasswordInput } from '@/components/password-input';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin } from 'lucide-react';
import type { User } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deliveryZones } from '@/lib/data';

const SignupSkeleton = () => (
    <Tabs defaultValue="customer" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customer"><Skeleton className="h-5 w-24" /></TabsTrigger>
        <TabsTrigger value="chef"><Skeleton className="h-5 w-20" /></TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <Card>
          <CardHeader className="text-center">
            <Skeleton className="h-7 w-48 mx-auto" />
            <Skeleton className="h-4 w-full max-w-xs mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

export default function SignupPage() {
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  // Customer state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerGender, setCustomerGender] = useState<'male' | 'female'>();
  const [customerDeliveryZone, setCustomerDeliveryZone] = useState<string>('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Chef state
  const [chefName, setChefName] = useState('');
  const [chefEmail, setChefEmail] = useState('');
  const [chefSpecialty, setChefSpecialty] = useState('');
  const [chefPhone, setChefPhone] = useState('');
  const [chefPassword, setChefPassword] = useState('');
  const [chefGender, setChefGender] = useState<'male' | 'female'>();
  
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const validateEmail = (email: string): string => {
        if (!email.trim()) return t('validation_email_required');
        if (!/^[a-zA-Z]/.test(email)) return t('validation_email_must_start_with_letter');
        if (!email.includes('@')) return t('validation_email_must_contain_at');
        if (/[^a-zA-Z0-9@._-]/.test(email)) return t('validation_email_contains_invalid_chars');
        const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) return t('validation_email_invalid_format');
        return '';
    };

  const handleSignup = async (role: 'customer' | 'chef') => {
    setIsLoading(true);
    let userDetails: Partial<User> & { password: string, role: 'customer' | 'chef' };
    let email: string;
    
    if (role === 'customer') {
        if (!customerGender) { toast({ variant: 'destructive', title: t('input_error'), description: t('gender_required', 'الرجاء تحديد النوع'), }); setIsLoading(false); return; }
        if (!customerDeliveryZone) { toast({ variant: 'destructive', title: t('input_error'), description: t('delivery_zone_required', 'الرجاء تحديد منطقة التوصيل'), }); setIsLoading(false); return; }
        email = customerEmail;
        userDetails = { name: customerName, email: customerEmail, phone: customerPhone, address: customerAddress, password: customerPassword, gender: customerGender, role: 'customer', deliveryZone: customerDeliveryZone }
    } else { // Chef
        if (!chefGender) { toast({ variant: 'destructive', title: t('input_error'), description: t('gender_required', 'الرجاء تحديد النوع'), }); setIsLoading(false); return; }
        email = chefEmail;
        userDetails = { name: chefName, email: chefEmail, phone: chefPhone, specialty: chefSpecialty, password: chefPassword, gender: chefGender, role: 'chef' }
    }
    
    const emailError = validateEmail(email);
    if (emailError) {
        toast({ variant: 'destructive', title: t('error_in_email'), description: emailError, });
        setIsLoading(false);
        return;
    }
    
    try {
      const signedUpUser = await signup(userDetails);
      
      if (signedUpUser.accountStatus === 'pending_approval') {
          toast({ 
              title: t('signup_pending_title', 'Account Submitted for Review'),
              description: t('signup_pending_desc', 'Your account is now pending approval. You will be notified once it is reviewed by the administration.'),
              duration: 10000,
          });
          router.push('/login');
      } else {
          toast({ title: i18n.language === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Signup Successful', description: i18n.language === 'ar' ? 'أهلاً بك في وجبتي!' : 'Welcome to Wagbty!', });
          if (signedUpUser.role === 'chef') router.push('/chef/dashboard');
          else router.push('/');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('signup_failed'), description: error.message || t('something_went_wrong'), });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleGetLocation = async () => {
    if (!navigator.geolocation) { toast({ variant: "destructive", title: t('geolocation_not_supported'), description: t('geolocation_not_supported_desc') }); return; }
    setIsFetchingLocation(true);
    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
        const { latitude, longitude } = position.coords;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            const mockAddress = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
            setCustomerAddress(mockAddress);
            setIsFetchingLocation(false);
            return;
        }
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=${i18n.language}`);
        const data = await response.json();
        if (data.status === 'OK' && data.results?.[0]) {
            setCustomerAddress(data.results[0].formatted_address);
            toast({ title: t('location_retrieved_successfully') });
        } else {
             toast({ variant: "destructive", title: t('could_not_determine_address_title'), description: t('could_not_determine_address_desc') });
        }
    } catch (error: any) {
        let title = t('failed_to_get_location', 'Failed to get location');
        let description = t('failed_to_get_location_desc', 'Please ensure you have enabled location services and granted permission.');
        
        if (error.code) { 
            switch(error.code) {
                case 1:
                    description = t('geolocation_permission_denied_desc', 'Please allow location access in your browser settings to use this feature.');
                    break;
                case 2:
                    description = t('geolocation_position_unavailable_desc', 'We could not determine your location. Please check your network connection.');
                    break;
                case 3:
                    description = t('geolocation_timeout_desc', 'The request to get your location timed out. Please try again.');
                    break;
            }
        } else if (error instanceof Error) {
             title = t('could_not_determine_address_title', 'Could not determine address');
             description = t('could_not_determine_address_desc', 'Failed to determine a precise address. Please try again or enter it manually.');
        }

        toast({
            variant: "destructive",
            title: title,
            description: description
        });
    } finally {
        setIsFetchingLocation(false);
    }
  };

  if (!isMounted) {
    return <SignupSkeleton />;
  }

  return (
    <Tabs defaultValue="customer" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customer">{t('i_am_a_customer')}</TabsTrigger>
        <TabsTrigger value="chef">{t('i_am_a_chef')}</TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <Card>
          <CardHeader className="text-center"><CardTitle className="font-headline text-2xl">{t('customer_signup_title')}</CardTitle><CardDescription>{t('customer_signup_desc')}</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={(e) => {e.preventDefault(); handleSignup('customer')}} className="space-y-4">
              <div className="space-y-2 text-left rtl:text-right"><Label htmlFor="customer-name">{t('full_name')}</Label><Input id="customer-name" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t('full_name_placeholder')} /></div>
              <div className="space-y-2 text-left rtl:text-right"><Label>{t('gender', 'النوع')}</Label><RadioGroup required onValueChange={(value: 'male' | 'female') => setCustomerGender(value)} value={customerGender} className="grid grid-cols-2 gap-4"><div><RadioGroupItem value="male" id="customer-male" className="sr-only peer" /><Label htmlFor="customer-male" className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><Image src="https://cdn-icons-png.flaticon.com/512/147/147144.png" alt={t('male', 'ذكر')} width={48} height={48} className="mb-2 h-12 w-12" data-ai-hint="male avatar" /><span className="font-normal">{t('male', 'ذكر')}</span></Label></div><div><RadioGroupItem value="female" id="customer-female" className="sr-only peer" /><Label htmlFor="customer-female" className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><Image src="https://cdn-icons-png.flaticon.com/512/6997/6997662.png" alt={t('female', 'أنثى')} width={48} height={48} className="mb-2 h-12 w-12" data-ai-hint="female avatar" /><span className="font-normal">{t('female', 'أنثى')}</span></Label></div></RadioGroup></div>
              <div className="space-y-2 text-left rtl:text-right"><Label htmlFor="customer-email">{t('email')}</Label><Input id="customer-email" type="email" placeholder={t('email_placeholder')} required value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} /></div>
              <div className="space-y-2 text-left rtl:text-right"><Label htmlFor="customer-phone">{t('phone_number')}</Label><Input id="customer-phone" type="tel" placeholder={t('phone_placeholder')} required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}/></div>
              <div className="space-y-2 text-left rtl:text-right">
                <Label htmlFor="customer-zone">{t('delivery_zone_label', 'Delivery Zone')}</Label>
                <Select required onValueChange={setCustomerDeliveryZone} value={customerDeliveryZone}>
                  <SelectTrigger id="customer-zone" className="w-full">
                    <SelectValue placeholder={t('select_delivery_zone_placeholder', 'Select your delivery zone')} />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryZones.map((zone) => (
                      <SelectItem key={zone.name} value={zone.name}>{t(zone.name, zone.name)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-left rtl:text-right"><Label htmlFor="customer-address">{t('address')}</Label><div className="relative"><Input id="customer-address" placeholder={t('address_placeholder_customer')} required value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="pe-10" /><Button type="button" variant="ghost" size="icon" onClick={handleGetLocation} className="absolute top-1/2 -translate-y-1/2 end-1 h-8 w-8" disabled={isFetchingLocation} aria-label={t('use_current_location')} >{isFetchingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}</Button></div></div>
              <div className="space-y-2 text-left rtl:text-right"><Label htmlFor="customer-password">{t('password')}</Label><PasswordInput id="customer-password" required placeholder={t('password_placeholder')} value={customerPassword} onChange={(e) => setCustomerPassword(e.target.value)} showStrength /></div>
              <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">{isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}{t('signup')}</Button>
              <div className="mt-4 text-center text-sm">{t('already_a_member')}{' '}<Link href="/login" className="underline text-primary">{t('login')}</Link></div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="chef">
        <Card>
          <CardHeader className="text-center"><CardTitle className="font-headline text-2xl">{t('chef_signup_title')}</CardTitle><CardDescription>{t('chef_signup_desc')}</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={(e) => {e.preventDefault(); handleSignup('chef')}} className="space-y-4">
              <div className="space-y-2 text-left rtl:text-right"><Label htmlFor="chef-name">{t('full_name')}</Label><Input id="chef-name" required value={chefName} onChange={(e) => setChefName(e.target.value)} placeholder={t('full_name_placeholder_chef')}/></div>
              <div className="space-y-2 text-left rtl:text-right"><Label>{t('gender', 'النوع')}</Label><RadioGroup required onValueChange={(value: 'male' | 'female') => setChefGender(value)} value={chefGender} className="grid grid-cols-2 gap-4"><div><RadioGroupItem value="male" id="chef-male" className="sr-only peer" /><Label htmlFor="chef-male" className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><Image src="https://cdn-icons-png.flaticon.com/512/147/147144.png" alt={t('male', 'ذكر')} width={48} height={48} className="mb-2 h-12 w-12" data-ai-hint="male avatar"/><span className="font-normal">{t('male', 'ذكر')}</span></Label></div><div><RadioGroupItem value="female" id="chef-female" className="sr-only peer" /><Label htmlFor="chef-female" className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><Image src="https://cdn-icons-png.flaticon.com/512/6997/6997662.png" alt={t('female', 'أنثى')} width={48} height={48} className="mb-2 h-12 w-12" data-ai-hint="female avatar" /><span className="font-normal">{t('female', 'أنثى')}</span></Label></div></RadioGroup></div>
              <div className="space-y-2 text-left rtl:text-right"><Label htmlFor="chef-specialty">{t('kitchen_specialty')}</Label><Input id="chef-specialty" placeholder={t('kitchen_specialty_placeholder')} required value={chefSpecialty} onChange={(e) => setChefSpecialty(e.target.value)} /></div>
              <div className="space-y-2 text-left rtl:text-right"><Label htmlFor="chef-email">{t('email')}</Label><Input id="chef-email" type="email" placeholder={t('chef_email_placeholder')} required value={chefEmail} onChange={(e) => setChefEmail(e.target.value)} /></div>
              <div className="space-y-2 text-left rtl:text-right"><Label htmlFor="chef-phone">{t('phone_number')}</Label><Input id="chef-phone" type="tel" placeholder={t('phone_placeholder')} required value={chefPhone} onChange={(e) => setChefPhone(e.target.value)} /></div>
              <div className="space-y-2 text-left rtl:text-right"><Label htmlFor="chef-password">{t('password')}</Label><PasswordInput id="chef-password" required placeholder={t('password_placeholder')} value={chefPassword} onChange={(e) => setChefPassword(e.target.value)} showStrength /></div>
              <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">{isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}{t('apply_to_be_chef')}</Button>
              <div className="mt-4 text-center text-sm">{t('already_a_member')}{' '}<Link href="/login" className="underline text-primary">{t('login')}</Link></div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
