'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
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
              <Input id="customer-password" type="password" required className="text-right" />
            </div>
            <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/profile">تسجيل الدخول</Link>
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
              <Input id="chef-password" type="password" required className="text-right" />
            </div>
            <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/chef/dashboard">تسجيل الدخول</Link>
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
