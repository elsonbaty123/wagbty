
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PasswordInput } from '@/components/password-input';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { useTranslation } from 'react-i18next';


export default function SignupPage() {
  const { t } = useTranslation();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');

  const [chefName, setChefName] = useState('');
  const [chefEmail, setChefEmail] = useState('');
  const [chefSpecialty, setChefSpecialty] = useState('');
  const [chefPhone, setChefPhone] = useState('');
  const [chefPassword, setChefPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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

  const handleSignup = async (role: 'customer' | 'chef') => {
    setIsLoading(true);
    let userDetails: Partial<User> & { password: string, role: 'customer' | 'chef' };
    let email: string;
    
    if (role === 'customer') {
        email = customerEmail;
        userDetails = {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress,
            password: customerPassword,
            role: 'customer'
        }
    } else {
        email = chefEmail;
        userDetails = {
            name: chefName,
            email: chefEmail,
            phone: chefPhone,
            specialty: chefSpecialty,
            password: chefPassword,
            role: 'chef'
        }
    }
    
    const emailError = validateEmail(email);
    if (emailError) {
        toast({
            variant: 'destructive',
            title: t('error_in_email'),
            description: emailError,
        });
        setIsLoading(false);
        return;
    }
    
    try {
      const signedUpUser = await signup(userDetails);
      toast({
        title: t('signup_successful'),
        description: t('welcome_to_chefconnect'),
      });
      if (signedUpUser.role === 'chef') {
        router.push('/chef/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('signup_failed'),
        description: error.message || t('something_went_wrong'),
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="customer" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customer">{t('i_am_a_customer')}</TabsTrigger>
        <TabsTrigger value="chef">{t('i_am_a_chef')}</TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">{t('customer_signup_title')}</CardTitle>
            <CardDescription>{t('customer_signup_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {e.preventDefault(); handleSignup('customer')}} className="space-y-4">
              <div className="space-y-2 text-start">
                <Label htmlFor="customer-name">{t('full_name')}</Label>
                <Input id="customer-name" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t('full_name_placeholder')} />
              </div>
              <div className="space-y-2 text-start">
                <Label htmlFor="customer-email">{t('email')}</Label>
                <Input 
                    id="customer-email" 
                    type="email" 
                    placeholder="m@example.com" 
                    required 
                    value={customerEmail} 
                    onChange={(e) => setCustomerEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2 text-start">
                <Label htmlFor="customer-phone">{t('phone_number')}</Label>
                <Input id="customer-phone" type="tel" placeholder="01XXXXXXXXX" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}/>
              </div>
              <div className="space-y-2 text-start">
                  <Label htmlFor="customer-address">{t('address')}</Label>
                  <Input id="customer-address" placeholder={t('address_placeholder_customer')} required value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
              </div>
              <div className="space-y-2 text-start">
                <Label htmlFor="customer-password">{t('password')}</Label>
                <PasswordInput
                  id="customer-password"
                  required
                  placeholder="********"
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  showStrength
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t('signup')}
              </Button>
              <div className="mt-4 text-center text-sm">
                {t('already_a_member')}{' '}
                <Link href="/login" className="underline text-primary">
                  {t('login')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="chef">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">{t('chef_signup_title')}</CardTitle>
            <CardDescription>{t('chef_signup_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {e.preventDefault(); handleSignup('chef')}} className="space-y-4">
               <div className="space-y-2 text-start">
                <Label htmlFor="chef-name">{t('full_name')}</Label>
                <Input id="chef-name" required value={chefName} onChange={(e) => setChefName(e.target.value)} placeholder={t('full_name_placeholder_chef')}/>
              </div>
              <div className="space-y-2 text-start">
                <Label htmlFor="chef-specialty">{t('kitchen_specialty')}</Label>
                <Input id="chef-specialty" placeholder={t('kitchen_specialty_placeholder')} required value={chefSpecialty} onChange={(e) => setChefSpecialty(e.target.value)} />
              </div>
              <div className="space-y-2 text-start">
                <Label htmlFor="chef-email">{t('email')}</Label>
                <Input 
                    id="chef-email" 
                    type="email" 
                    placeholder="chef@example.com" 
                    required 
                    value={chefEmail} 
                    onChange={(e) => setChefEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2 text-start">
                <Label htmlFor="chef-phone">{t('phone_number')}</Label>
                <Input id="chef-phone" type="tel" placeholder="01XXXXXXXXX" required value={chefPhone} onChange={(e) => setChefPhone(e.target.value)} />
              </div>
              <div className="space-y-2 text-start">
                <Label htmlFor="chef-password">{t('password')}</Label>
                <PasswordInput
                  id="chef-password"
                  required
                  placeholder="********"
                  value={chefPassword}
                  onChange={(e) => setChefPassword(e.target.value)}
                  showStrength
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                 {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                 {t('apply_to_be_chef')}
              </Button>
              <div className="mt-4 text-center text-sm">
                {t('already_a_member')}{' '}
                <Link href="/login" className="underline text-primary">
                  {t('login')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
