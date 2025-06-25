
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { users } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate checking if email exists
        const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

        if (!userExists) {
            toast({
                variant: 'destructive',
                title: 'البريد الإلكتروني غير موجود',
                description: 'الرجاء التأكد من البريد الإلكتروني المدخل.',
            });
            setIsLoading(false);
            return;
        }

        // Simulate sending a reset link
        setTimeout(() => {
            toast({
                title: 'تم إرسال رابط إعادة التعيين',
                description: 'تم إرسال رابط إلى بريدك الإلكتروني. الرجاء التحقق من صندوق الوارد.',
            });
            router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1000);
    };

    return (
        <Card className="w-full max-w-md text-right">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">نسيت كلمة المرور؟</CardTitle>
                <CardDescription>
                    لا تقلق. أدخل بريدك الإلكتروني أدناه وسنرسل لك رابطًا لإعادة تعيين كلمة المرور الخاصة بك.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            className="text-right"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
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
                </CardContent>
            </form>
        </Card>
    );
}
