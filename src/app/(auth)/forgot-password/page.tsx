
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { isWhitelistedEmail } from '@/lib/whitelisted-emails';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { users } = useAuth();
    const { toast } = useToast();

    const validateEmail = (email: string): string => {
        if (!email.trim()) return "البريد الإلكتروني مطلوب.";
        const emailRegex = /^[a-zA-Z][^\s@]*@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return "البريد الإلكتروني غير صحيح. يجب أن يبدأ بحرف ويتبع الصيغة مثل: example@gmail.com";
        }
        return "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const error = validateEmail(email);
        setEmailError(error);
        if (error) {
            return;
        }

        if (!isWhitelistedEmail(email)) {
            toast({
                variant: 'destructive',
                title: 'بريد إلكتروني غير مسموح به',
                description: 'يرجى استخدام بريد إلكتروني رسمي من قائمة مقدمي الخدمة المعتمدين.',
            });
            return;
        }

        setIsLoading(true);

        const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

        // Simulate sending a reset link with a delay
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
            
            // For demo purposes, we log the "magic link" to the console for the user to test the flow.
            if (userExists) {
                console.log(`رابط إعادة تعيين كلمة المرور لـ ${email}: /reset-password?email=${encodeURIComponent(email)}`);
            } else {
                 console.log(`البريد الإلكتروني ${email} غير موجود، ولكن يتم عرض رسالة نجاح لأسباب أمنية. لم يتم إنشاء رابط إعادة تعيين.`);
            }

            toast({
                title: 'تم إرسال الطلب',
                description: 'إذا كان البريد الإلكتروني مسجلاً، فستتلقى رابطًا لإعادة التعيين قريبًا.',
            });

        }, 1500);
    };

    return (
        <Card className="w-full max-w-md text-right">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">نسيت كلمة المرور؟</CardTitle>
                <CardDescription>
                    {isSubmitted 
                        ? 'تم إرسال طلب إعادة تعيين كلمة المرور.'
                        : 'لا تقلق. أدخل بريدك الإلكتروني أدناه وسنرسل لك رابطًا لإعادة تعيين كلمة المرور الخاصة بك.'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-4 p-8">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <h3 className="text-xl font-semibold">تحقق من بريدك الإلكتروني</h3>
                        <p className="text-muted-foreground">
                            تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني إذا كان مسجلًا لدينا. الرجاء التحقق من صندوق الوارد أو البريد العشوائي.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">(لأغراض العرض التوضيحي، تم طباعة الرابط في وحدة تحكم المطور.)</p>
                        <Button asChild variant="outline" className="mt-6">
                            <Link href="/login">
                                العودة إلى تسجيل الدخول
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                className={cn("text-right", emailError && "border-destructive")}
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (emailError) setEmailError("");
                                }}
                            />
                             {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            إرسال رابط إعادة التعيين
                        </Button>
                         <div className="mt-4 text-center text-sm">
                            تذكرت كلمة المرور؟{' '}
                            <Link href="/login" className="underline text-accent">
                                تسجيل الدخول
                            </Link>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
