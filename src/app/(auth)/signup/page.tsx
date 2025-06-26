
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
import { cn } from '@/lib/utils';


export default function SignupPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerEmailError, setCustomerEmailError] = useState('');

  const [chefName, setChefName] = useState('');
  const [chefEmail, setChefEmail] = useState('');
  const [chefSpecialty, setChefSpecialty] = useState('');
  const [chefPhone, setChefPhone] = useState('');
  const [chefPassword, setChefPassword] = useState('');
  const [chefEmailError, setChefEmailError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "البريد الإلكتروني مطلوب.";
    if (!/^[a-zA-Z]/.test(email)) {
      return 'البريد الإلكتروني يجب أن يبدأ بحرف.';
    }
    if (/[^a-zA-Z0-9@._-]/.test(email)) {
      return 'البريد الإلكتروني يحتوي على رموز غير مسموح بها.';
    }
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'البريد الإلكتروني غير صحيح. يرجى اتباع الصيغة مثل: example@gmail.com';
    }
    return '';
  };

  const handleSignup = async (role: 'customer' | 'chef') => {
    setIsLoading(true);
    let userDetails: Partial<User> & { password: string, role: 'customer' | 'chef' };
    let email: string;
    let emailError: string;

    if (role === 'customer') {
        email = customerEmail;
        emailError = validateEmail(email);
        setCustomerEmailError(emailError);
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
        emailError = validateEmail(email);
        setChefEmailError(emailError);
        userDetails = {
            name: chefName,
            email: chefEmail,
            phone: chefPhone,
            specialty: chefSpecialty,
            password: chefPassword,
            role: 'chef'
        }
    }

    if (emailError) {
        toast({
            variant: 'destructive',
            title: 'خطأ في البريد الإلكتروني',
            description: emailError,
        });
        setIsLoading(false);
        return;
    }
    
    try {
      const signedUpUser = await signup(userDetails);
      if (signedUpUser.role === 'chef') {
        router.push('/chef/dashboard');
      } else {
        router.push('/');
      }
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
          <CardContent>
            <form onSubmit={(e) => {e.preventDefault(); handleSignup('customer')}} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">الاسم الكامل</Label>
                <Input id="customer-name" required className="text-right" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="مثال: أحمد محمد" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-email">البريد الإلكتروني</Label>
                <Input 
                    id="customer-email" 
                    type="email" 
                    placeholder="m@example.com" 
                    required 
                    className={cn("text-right", customerEmailError && "border-destructive")} 
                    value={customerEmail} 
                    onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        if(customerEmailError) setCustomerEmailError("");
                    }} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone">رقم الهاتف</Label>
                <Input id="customer-phone" type="tel" placeholder="01XXXXXXXXX" required className="text-right" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}/>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="customer-address">العنوان</Label>
                  <Input id="customer-address" placeholder="456 شارع الجزيرة، الزمالك" required className="text-right" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
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
              <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إنشاء حساب
              </Button>
              <div className="mt-4 text-center text-sm">
                لديك حساب بالفعل؟{' '}
                <Link href="/login" className="underline text-primary">
                  تسجيل الدخول
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="chef">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">انضم كطاهٍ</CardTitle>
            <CardDescription>شارك إبداعاتك في الطهي مع العالم.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {e.preventDefault(); handleSignup('chef')}} className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="chef-name">الاسم الكامل</Label>
                <Input id="chef-name" required className="text-right" value={chefName} onChange={(e) => setChefName(e.target.value)} placeholder="مثال: الشيف أنطوان"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chef-specialty">تخصص المطبخ</Label>
                <Input id="chef-specialty" placeholder="مثال: فرنسي، إيطالي، نباتي" required className="text-right" value={chefSpecialty} onChange={(e) => setChefSpecialty(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chef-email">البريد الإلكتروني</Label>
                <Input 
                    id="chef-email" 
                    type="email" 
                    placeholder="chef@example.com" 
                    required 
                    className={cn("text-right", chefEmailError && "border-destructive")} 
                    value={chefEmail} 
                    onChange={(e) => {
                        setChefEmail(e.target.value);
                        if(chefEmailError) setChefEmailError("");
                    }} 
                />
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
              <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                 {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تقدم لتكون طاهيًا
              </Button>
              <div className="mt-4 text-center text-sm">
                عضو بالفعل؟{' '}
                <Link href="/login" className="underline text-primary">
                  تسجيل الدخول
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
