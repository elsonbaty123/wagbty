
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PasswordInput } from '@/components/password-input';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';


export default function LoginPage() {
  const [customerPassword, setCustomerPassword] = useState('');
  const [chefPassword, setChefPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';

  const handleLogin = (role: 'customer' | 'chef') => {
    login(role);
    const destination = redirectUrl || (role === 'chef' ? '/chef/dashboard' : '/profile');
    router.push(destination);
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-email">البريد الإلكتروني</Label>
              <Input id="customer-email" type="email" placeholder="m@example.com" required className="text-right" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-password">كلمة المرور</Label>
              <PasswordInput
                id="customer-password"
                required
                className="text-right"
                value={customerPassword}
                onChange={(e) => setCustomerPassword(e.target.value)}
              />
            </div>
            <Button onClick={() => handleLogin('customer')} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              تسجيل الدخول
            </Button>
            <div className="mt-4 text-center text-sm">
              ليس لديك حساب؟{' '}
              <Link href="/signup" className="underline text-accent">
                إنشاء حساب
              </Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="chef">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">تسجيل دخول الطاهي</CardTitle>
            <CardDescription>ادخل إلى لوحة التحكم الخاصة بك لإدارة الطلبات وقائمة طعامك.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chef-email">البريد الإلكتروني</Label>
              <Input id="chef-email" type="email" placeholder="chef@example.com" required className="text-right" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chef-password">كلمة المرور</Label>
               <PasswordInput
                id="chef-password"
                required
                className="text-right"
                value={chefPassword}
                onChange={(e) => setChefPassword(e.target.value)}
              />
            </div>
            <Button onClick={() => handleLogin('chef')} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              تسجيل الدخول
            </Button>
            <div className="mt-4 text-center text-sm">
              لست طاهيًا معنا بعد؟{' '}
              <Link href="/signup" className="underline text-accent">
                انضم الآن
              </Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
