
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


export default function SignupPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
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

  const handleSignup = async (role: 'customer' | 'chef') => {
    setIsLoading(true);
    const name = role === 'customer' ? customerName : chefName;
    const email = role === 'customer' ? customerEmail : chefEmail;
    const password = role === 'customer' ? customerPassword : chefPassword;

    try {
      await signup(name, email, password, role);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'فشل إنشاء الحساب',
        description: error.message || 'حدث خطأ ما، يرجى المحاولة مرة أخرى.',
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="customer" className="w-full max-w-md text-right">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customer">أنا عميل</TabsTrigger>
        <TabsTrigger value="chef">أنا طاهٍ</TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">إنشاء حساب عميل</CardTitle>
            <CardDescription>انضم إلى مجتمع محبي الطعام.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">الاسم الكامل</Label>
              <Input id="customer-name" required className="text-right" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-email">البريد الإلكتروني</Label>
              <Input id="customer-email" type="email" placeholder="m@example.com" required className="text-right" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone">رقم الهاتف</Label>
              <Input id="customer-phone" type="tel" placeholder="01XXXXXXXXX" required className="text-right" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-password">كلمة المرور</Label>
              <PasswordInput
                id="customer-password"
                required
                className="text-right"
                placeholder="********"
                value={customerPassword}
                onChange={(e) => setCustomerPassword(e.target.value)}
                showStrength
              />
            </div>
            <Button onClick={() => handleSignup('customer')} type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              إنشاء حساب
            </Button>
            <div className="mt-4 text-center text-sm">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="underline text-primary">
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="chef">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">انضم كطاهٍ</CardTitle>
            <CardDescription>شارك إبداعاتك في الطهي مع العالم.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="chef-name">الاسم الكامل</Label>
              <Input id="chef-name" required className="text-right" value={chefName} onChange={(e) => setChefName(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chef-specialty">تخصص المطبخ</Label>
              <Input id="chef-specialty" placeholder="مثال: فرنسي، إيطالي، نباتي" required className="text-right" value={chefSpecialty} onChange={(e) => setChefSpecialty(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chef-email">البريد الإلكتروني</Label>
              <Input id="chef-email" type="email" placeholder="chef@example.com" required className="text-right" value={chefEmail} onChange={(e) => setChefEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chef-phone">رقم الهاتف</Label>
              <Input id="chef-phone" type="tel" placeholder="01XXXXXXXXX" required className="text-right" value={chefPhone} onChange={(e) => setChefPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chef-password">كلمة المرور</Label>
              <PasswordInput
                id="chef-password"
                required
                className="text-right"
                placeholder="********"
                value={chefPassword}
                onChange={(e) => setChefPassword(e.target.value)}
                showStrength
              />
            </div>
            <Button onClick={() => handleSignup('chef')} type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
               {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تقدم لتكون طاهيًا
            </Button>
            <div className="mt-4 text-center text-sm">
              عضو بالفعل؟{' '}
              <Link href="/login" className="underline text-primary">
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
