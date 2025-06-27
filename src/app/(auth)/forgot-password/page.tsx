
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
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { sendPasswordResetEmail } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            toast({
                variant: 'destructive',
                title: t('error_in_email'),
                description: t('validation_email_required'),
            });
            return;
        }
        
        setIsLoading(true);

        try {
            await sendPasswordResetEmail(email);
            setIsSubmitted(true);
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: t('error'),
                description: t('password_reset_failed'),
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{t('forgot_password_title')}</CardTitle>
                <CardDescription>
                    {isSubmitted 
                        ? t('forgot_password_desc_sent')
                        : t('forgot_password_desc_initial')
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-4 p-8">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <h3 className="text-xl font-semibold">{t('check_your_email')}</h3>
                        <p className="text-muted-foreground">
                            {t('password_reset_link_sent')}
                        </p>
                        <Button asChild variant="outline" className="mt-6">
                            <Link href="/login">
                                {t('back_to_login')}
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2 text-start">
                            <Label htmlFor="email">{t('email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                            {t('send_reset_link')}
                        </Button>
                         <div className="mt-4 text-center text-sm">
                            {t('remembered_password')}{' '}
                            <Link href="/login" className="underline text-accent">
                                {t('login')}
                            </Link>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
