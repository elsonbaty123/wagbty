
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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


export default function LoginPage() {
  const { t } = useTranslation();
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [chefEmail, setChefEmail] = useState('');
  const [chefPassword, setChefPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

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

  const handleLogin = async (role: 'customer' | 'chef') => {
    setIsLoading(true);
    const email = role === 'customer' ? customerEmail : chefEmail;
    const password = role === 'customer' ? customerPassword : chefPassword;

    const emailError = validateEmail(email);
    if (emailError) {
        toast({
            variant: "destructive",
            title: t('error_in_email'),
            description: emailError,
        });
        setIsLoading(false);
        return;
    }

    try {
      const loggedInUser = await login(email, password, role);
      toast({
        title: t('login_successful'),
        description: t('welcome_back', { name: loggedInUser.name }),
      });
      if (loggedInUser.role === 'chef') {
        router.push('/chef/dashboard');
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

  return (
    <Tabs defaultValue="customer" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customer">{t('customer')}</TabsTrigger>
        <TabsTrigger value="chef">{t('chef')}</TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">{t('customer_login_title')}</CardTitle>
            <CardDescription>{t('customer_login_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin('customer'); }} className="space-y-4">
              <div className="space-y-2 text-start">
                <Label htmlFor="customer-email">{t('email')}</Label>
                <Input 
                  id="customer-email" 
                  type="email" 
                  placeholder="jane.doe@example.com" 
                  required 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 text-start">
                  <Label htmlFor="customer-password">{t('password')}</Label>
                <PasswordInput
                  id="customer-password"
                  required
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  placeholder="Password123!"
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
              <div className="space-y-2 text-start">
                <Label htmlFor="chef-email">{t('email')}</Label>
                <Input 
                  id="chef-email" 
                  type="email" 
                  placeholder="chef.antoine@example.com" 
                  required 
                  value={chefEmail}
                  onChange={(e) => setChefEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 text-start">
                  <Label htmlFor="chef-password">{t('password')}</Label>
                 <PasswordInput
                  id="chef-password"
                  required
                  value={chefPassword}
                  onChange={(e) => setChefPassword(e.target.value)}
                  placeholder="Password123!"
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
    </Tabs>
  );
}
