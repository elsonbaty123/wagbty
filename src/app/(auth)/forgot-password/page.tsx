
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
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { users } = useAuth();
    const { toast } = useToast();

    const validateEmail = (email: string): string => {
        if (!email.trim()) return t('validation_email_required');
    
        if (!/^[a-zA-Z]/.test(email)) {
          return t('validation_email_must_start_with_letter');
        }
    
        if (!email.includes('@')) {
            return t('validation_email_must_contain_at');
        }
    
        if (/[^a-zA-Z0-9@._-]/.test(email)) {
          return t('validation_email_contains_invalid_chars');
        }
        
        const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          return t('validation_email_invalid_format');
        }
        
        return '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const error = validateEmail(email);
        if (error) {
            toast({
                variant: 'destructive',
                title: t('error_in_email'),
                description: error,
            });
            return;
        }

        if (!isWhitelistedEmail(email)) {
            toast({
                variant: 'destructive',
                title: t('unauthorized_email'),
                description: t('unauthorized_email_desc'),
            });
            return;
        }

        setIsLoading(true);

        const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
            
            if (userExists) {
                console.log(`Password reset link for ${email}: /reset-password?email=${encodeURIComponent(email)}`);
            } else {
                 console.log(`Email ${email} not found, but showing success message for security. No reset link generated.`);
            }

            toast({
                title: t('request_sent'),
                description: t('reset_link_sent_desc'),
            });

        }, 1500);
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
                        <p className="text-xs text-muted-foreground mt-2">{t('demo_link_in_console')}</p>
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
