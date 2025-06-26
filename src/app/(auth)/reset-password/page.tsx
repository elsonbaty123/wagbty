
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
import { useTranslation } from 'react-i18next';

function ResetPasswordComponent() {
    const { t } = useTranslation();
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
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-destructive">{t('error')}</CardTitle>
                    <CardDescription>
                        {t('password_reset_link_invalid')}
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
                title: t('passwords_do_not_match'),
            });
            setIsSaving(false);
            return;
        }

        try {
            await resetPassword(email, newPassword);
            toast({
                title: t('password_changed_successfully'),
                description: t('password_changed_successfully_desc'),
            });
            router.push('/login');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('password_change_failed'),
                description: error.message || t('something_went_wrong'),
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{t('reset_password_title')}</CardTitle>
                <CardDescription>
                    {t('reset_password_desc', { email })}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2 text-start">
                        <Label htmlFor="new-password">{t('new_password')}</Label>
                        <PasswordInput
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            showStrength
                            placeholder="********"
                        />
                    </div>
                    <div className="space-y-2 text-start">
                        <Label htmlFor="confirm-password">{t('confirm_new_password')}</Label>
                        <PasswordInput
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="********"
                        />
                    </div>
                </CardContent>
                <CardContent>
                    <Button type="submit" disabled={isSaving} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                        {t('save_new_password')}
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
