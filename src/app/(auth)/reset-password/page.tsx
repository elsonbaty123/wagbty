
'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ResetPasswordComponent() {
    const { t } = useTranslation();

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{t('reset_password_title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{t('feature_unavailable_title')}</AlertTitle>
                    <AlertDescription>
                        {t('feature_unavailable_desc_localstorage')}
                    </AlertDescription>
                </Alert>
                <Button variant="outline" asChild className="mt-6 w-full">
                    <Link href="/login">{t('back_to_login')}</Link>
                </Button>
            </CardContent>
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
