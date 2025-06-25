
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


export default function LoginPage() {
  const [customerEmail, setCustomerEmail] = useState('jane.doe@example.com');
  const [customerPassword, setCustomerPassword] = useState('Password123!');
  const [chefEmail, setChefEmail] = useState('chef.antoine@example.com');
  const [chefPassword, setChefPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (role: 'customer' | 'chef') => {
    setIsLoading(true);
    const email = role === 'customer' ? customerEmail : chefEmail;
    const password = role === 'customer' ? customerPassword : chefPassword;

    try {
      const loggedInUser = await login(email, password, role);
      if (loggedInUser.role === 'chef') {
        router.push('/chef/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول",
        description: error.message || 'حدث خطأ ما، يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Tabs defaultValue="customer" className="w-full max-w-md text-right">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customer">عميل</TabsTrigger>
        <TabsTrigger value="chef">طاهٍ</TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">تسجيل دخول العميل</CardTitle>
            <CardDescription>مرحبًا بعودتك! يرجى إدخال بياناتك لطلب وجبتك التالية.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin('customer'); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer-email">البريد الإلكتروني</Label>
                <Input 
                  id="customer-email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  className="text-right" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                  <div className="flex items-center justify-between">
                      <Label htmlFor="customer-password">كلمة المرور</Label>
                      <Link href="/forgot-password" className="text-sm text-accent underline">نسيت كلمة المرور؟</Link>
                  </div>
                <PasswordInput
                  id="customer-password"
                  required
                  className="text-right"
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  placeholder="********"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                 {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تسجيل الدخول
              </Button>
              <div className="mt-4 text-center text-sm">
                ليس لديك حساب؟{' '}
                <Link href="/signup" className="underline text-accent">
                  إنشاء حساب
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="chef">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">تسجيل دخول الطاهي</CardTitle>
            <CardDescription>ادخل إلى لوحة التحكم الخاصة بك لإدارة الطلبات وقائمة طعامك.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin('chef'); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chef-email">البريد الإلكتروني</Label>
                <Input 
                  id="chef-email" 
                  type="email" 
                  placeholder="chef@example.com" 
                  required 
                  className="text-right" 
                  value={chefEmail}
                  onChange={(e) => setChefEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                  <div className="flex items-center justify-between">
                      <Label htmlFor="chef-password">كلمة المرور</Label>
                      <Link href="/forgot-password" className="text-sm text-accent underline">نسيت كلمة المرور؟</Link>
                  </div>
                 <PasswordInput
                  id="chef-password"
                  required
                  className="text-right"
                  value={chefPassword}
                  onChange={(e) => setChefPassword(e.target.value)}
                  placeholder="********"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تسجيل الدخول
              </Button>
              <div className="mt-4 text-center text-sm">
                لست طاهيًا معنا بعد؟{' '}
                <Link href="/signup" className="underline text-accent">
                  انضم الآن
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
