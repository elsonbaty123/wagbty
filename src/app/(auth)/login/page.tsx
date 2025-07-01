
'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PasswordInput } from '@/components/password-input';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';


const LoginSkeleton = () => (
    <Tabs defaultValue="customer" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="customer"><Skeleton className="h-5 w-24" /></TabsTrigger>
        <TabsTrigger value="chef"><Skeleton className="h-5 w-20" /></TabsTrigger>
        <TabsTrigger value="delivery"><Skeleton className="h-5 w-20" /></TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <Card>
          <CardHeader className="text-center">
            <Skeleton className="h-7 w-48 mx-auto" />
            <Skeleton className="h-4 w-full max-w-xs mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
            <Skeleton className="h-4 w-48 mx-auto mt-2" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [chefIdentifier, setChefIdentifier] = useState('');
  const [chefPassword, setChefPassword] = useState('');
  const [deliveryIdentifier, setDeliveryIdentifier] = useState('');
  const [deliveryPassword, setDeliveryPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const validateIdentifier = (identifier: string): string => {
        if (!identifier.trim()) return t('validation_identifier_required', 'الرجاء إدخال البريد الإلكتروني أو رقم الهاتف');

        const isEmail = identifier.includes('@');
        const isNumeric = /^\d+$/.test(identifier);

        if (isEmail) {
            if (!/^[a-zA-Z]/.test(identifier)) {
              return t('validation_email_must_start_with_letter');
            }
        
            if (!identifier.includes('@')) {
                return t('validation_email_must_contain_at');
            }
        
            if (/[^a-zA-Z0-9@._-]/.test(identifier)) {
              return t('validation_email_contains_invalid_chars');
            }
            
            const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(identifier)) {
              return t('validation_email_invalid_format');
            }
        } else if (isNumeric) {
            // Basic phone validation
            if (identifier.length < 10) {
                return t('validation_phone_too_short', 'يجب أن يتكون رقم الهاتف من 10 أرقام على الأقل');
            }
        } else {
            return t('validation_identifier_invalid', 'الرجاء إدخال بريد إلكتروني أو رقم هاتف صحيح');
        }
        
        return '';
    };

  const handleLogin = async (role: 'customer' | 'chef' | 'delivery') => {
    setIsLoading(true);
    let identifier = '';
    let password = '';

    if (role === 'customer') {
      identifier = customerIdentifier;
      password = customerPassword;
    } else if (role === 'chef') {
      identifier = chefIdentifier;
      password = chefPassword;
    } else {
      identifier = deliveryIdentifier;
      password = deliveryPassword;
    }

    const identifierError = validateIdentifier(identifier);
    if (identifierError) {
        toast({
            variant: "destructive",
            title: t('error_in_input', 'خطأ في الإدخال'),
            description: identifierError,
        });
        setIsLoading(false);
        return;
    }

    try {
      const loggedInUser = await login(identifier, password, role);
      toast({
        title: i18n.language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login Successful',
        description: i18n.language === 'ar' ? `أهلاً بعودتك، ${loggedInUser.name}` : `Welcome back, ${loggedInUser.name}`,
      });
      if (loggedInUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (loggedInUser.role === 'chef') {
        router.push('/chef/dashboard');
      } else if (loggedInUser.role === 'delivery') {
        router.push('/delivery/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('login_failed'),
        description: error.message || t('auth_incorrect_credentials'),
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isMounted) {
    return <LoginSkeleton />;
  }

  return (
    <Tabs defaultValue="customer" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="customer">{t('customer')}</TabsTrigger>
        <TabsTrigger value="chef">{t('chef')}</TabsTrigger>
        <TabsTrigger value="delivery">{t('delivery_person', 'سائق توصيل')}</TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">{t('customer_login_title')}</CardTitle>
            <CardDescription>{t('customer_login_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin('customer'); }} className="space-y-4">
              <div className="space-y-2 text-left rtl:text-right">
                <Label htmlFor="customer-identifier">{t('email_or_phone', 'البريد الإلكتروني أو رقم الهاتف')}</Label>
                <Input 
                  id="customer-identifier" 
                  type="text" 
                  placeholder={t('identifier_placeholder', 'أدخل بريدك الإلكتروني أو رقم هاتفك')} 
                  required 
                  value={customerIdentifier}
                  onChange={(e) => setCustomerIdentifier(e.target.value)}
                />
              </div>
              <div className="space-y-2 text-left rtl:text-right">
                  <Label htmlFor="customer-password">{t('password')}</Label>
                <PasswordInput
                  id="customer-password"
                  required
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  placeholder={t('password_placeholder')}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                 {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t('login')}
              </Button>
               <div className="mt-4 flex flex-col items-center gap-2 text-sm">
                  <div>
                    {t('no_account_yet')}{' '}
                    <Link href="/signup" className="underline text-accent">
                      {t('signup')}
                    </Link>
                  </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="chef">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">{t('chef_login_title')}</CardTitle>
            <CardDescription>{t('chef_login_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin('chef'); }} className="space-y-4">
              <div className="space-y-2 text-left rtl:text-right">
                <Label htmlFor="chef-identifier">{t('email_or_phone', 'البريد الإلكتروني أو رقم الهاتف')}</Label>
                <Input 
                  id="chef-identifier" 
                  type="text" 
                  placeholder={t('identifier_placeholder_chef', 'أدخل بريد الشيف الإلكتروني أو رقم هاتفه')} 
                  required 
                  value={chefIdentifier}
                  onChange={(e) => setChefIdentifier(e.target.value)}
                />
              </div>
              <div className="space-y-2 text-left rtl:text-right">
                  <Label htmlFor="chef-password">{t('password')}</Label>
                 <PasswordInput
                  id="chef-password"
                  required
                  value={chefPassword}
                  onChange={(e) => setChefPassword(e.target.value)}
                  placeholder={t('password_placeholder')}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t('login')}
              </Button>
               <div className="mt-4 flex flex-col items-center gap-2 text-sm">
                  <div>
                    {t('not_a_chef_yet')}{' '}
                    <Link href="/signup" className="underline text-accent">
                      {t('join_now')}
                    </Link>
                  </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="delivery">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">{t('delivery_login_title', 'Delivery Login')}</CardTitle>
            <CardDescription>{t('delivery_login_desc', 'Access your delivery dashboard.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin('delivery'); }} className="space-y-4">
              <div className="space-y-2 text-left rtl:text-right">
                <Label htmlFor="delivery-identifier">{t('email_or_phone', 'البريد الإلكتروني أو رقم الهاتف')}</Label>
                <Input 
                  id="delivery-identifier" 
                  type="text" 
                  placeholder={t('identifier_placeholder_delivery', 'أدخل بريدك الإلكتروني أو رقم هاتفك')} 
                  required 
                  value={deliveryIdentifier}
                  onChange={(e) => setDeliveryIdentifier(e.target.value)}
                />
              </div>
              <div className="space-y-2 text-left rtl:text-right">
                  <Label htmlFor="delivery-password">{t('password')}</Label>
                 <PasswordInput
                  id="delivery-password"
                  required
                  value={deliveryPassword}
                  onChange={(e) => setDeliveryPassword(e.target.value)}
                  placeholder={t('password_placeholder')}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t('login')}
              </Button>
               <div className="mt-4 flex flex-col items-center gap-2 text-sm">
                  <div>
                    {t('not_a_driver_yet', 'Not a driver yet?')}{' '}
                    <Link href="/signup" className="underline text-accent">
                      {t('join_now')}
                    </Link>
                  </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
