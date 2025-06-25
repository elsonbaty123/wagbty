
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/password-input';

export function PasswordChangeForm() {
    const { changePassword } = useAuth();
    const { toast } = useToast();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsSaving(true);
        try {
            await changePassword({ oldPassword, newPassword, confirmPassword });
            toast({
                title: 'تم تغيير كلمة المرور',
                description: 'تم تحديث كلمة المرور بنجاح.',
            });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
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
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>تغيير كلمة المرور</CardTitle>
                <CardDescription>
                    قم بتحديث كلمة المرور الخاصة بك. استخدم كلمة مرور قوية لم يتم استخدامها من قبل.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="old-password">كلمة المرور القديمة</Label>
                        <PasswordInput 
                            id="old-password" 
                            value={oldPassword} 
                            onChange={(e) => setOldPassword(e.target.value)} 
                            required 
                            className="text-right" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                        <PasswordInput 
                            id="new-password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                            className="text-right" 
                            showStrength 
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
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        تحديث كلمة المرور
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
