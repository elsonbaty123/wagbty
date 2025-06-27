
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // In local storage mode, we just simulate the UI flow.
        setTimeout(() => {
            setIsSubmitted(true);
            setIsLoading(false);
        }, 1000);
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
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>{t('feature_unavailable_title')}</AlertTitle>
                    <AlertDescription>
                        {t('feature_unavailable_desc_localstorage')}
                    </AlertDescription>
                </Alert>

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
                            disabled
                        />
                    </div>
                    <Button type="submit" disabled={true} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
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
            </CardContent>
        </Card>
    );
}
