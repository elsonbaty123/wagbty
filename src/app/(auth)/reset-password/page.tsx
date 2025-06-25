
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/password-input';
import { useAuth } from '@/context/auth-context';

function ResetPasswordComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { resetPassword } = useAuth();

    const email = searchParams.get('email');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!email) {
        return (
            <Card className="w-full max-w-md text-right">
                <CardHeader>
                    <CardTitle className="text-destructive">خطأ</CardTitle>
                    <CardDescription>
                        رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (newPassword !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'كلمتا المرور غير متطابقتين',
            });
            setIsSaving(false);
            return;
        }

        try {
            await resetPassword(email, newPassword);
            toast({
                title: 'تم تغيير كلمة المرور بنجاح',
                description: 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
            });
            router.push('/login');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'فشل تغيير كلمة المرور',
                description: error.message || 'حدث خطأ ما، يرجى المحاولة مرة أخرى.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="w-full max-w-md text-right">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">إعادة تعيين كلمة المرور</CardTitle>
                <CardDescription>
                    أدخل كلمة مرور جديدة وقوية لحسابك ({email}).
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                        <PasswordInput
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="text-right"
                            showStrength
                            placeholder="********"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                        <PasswordInput
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="text-right"
                            placeholder="********"
                        />
                    </div>
                </CardContent>
                <CardContent>
                    <Button type="submit" disabled={isSaving} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        حفظ كلمة المرور الجديدة
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}


export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordComponent />
        </Suspense>
    );
}

