
'use client';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { User } from '@/lib/types';
import { useNotifications } from '@/context/notification-context';

export default function AdminApprovalsPage() {
    const { t } = useTranslation();
    const { users, loading, updateUserByAdmin } = useAuth();
    const { createNotification } = useNotifications();
    const { toast } = useToast();
    const [actioningUserId, setActioningUserId] = useState<string | null>(null);
    
    const pendingUsers = useMemo(() => {
        return users.filter(u => u.accountStatus === 'pending_approval');
    }, [users]);
    
    const handleApprovalAction = async (userToUpdate: User, action: 'approve' | 'reject') => {
        setActioningUserId(userToUpdate.id);
        const newStatus = action === 'approve' ? 'active' : 'rejected';
        try {
            await updateUserByAdmin(userToUpdate.id, { accountStatus: newStatus });
            
            createNotification({
                recipientId: userToUpdate.id,
                titleKey: action === 'approve' ? 'account_approved_title' : 'account_rejected_title',
                messageKey: action === 'approve' ? 'account_approved_desc' : 'account_rejected_desc',
                link: action === 'approve' ? '/login' : '#',
            });
            
            toast({
                title: t('user_status_updated'),
                description: t('user_status_updated_desc', { name: userToUpdate.name, status: t(action) }),
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error.message || t('failed_to_update_user'),
            });
        } finally {
            setActioningUserId(null);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-full" />
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
        <CardHeader>
            <CardTitle>{t('pending_approvals', 'Pending Approvals')}</CardTitle>
            <CardDescription>{t('pending_approvals_desc', 'Review and approve or reject new chef and delivery accounts.')}</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {pendingUsers.length > 0 ? (
                    pendingUsers.map((listUser) => (
                    <TableRow key={listUser.id}>
                        <TableCell>{listUser.name}</TableCell>
                        <TableCell>{listUser.email}</TableCell>
                        <TableCell><Badge variant="secondary">{t(listUser.role)}</Badge></TableCell>
                        <TableCell className="text-end">
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => handleApprovalAction(listUser, 'reject')}
                                    disabled={actioningUserId === listUser.id}
                                    aria-label={t('reject')}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                                    onClick={() => handleApprovalAction(listUser, 'approve')}
                                    disabled={actioningUserId === listUser.id}
                                    aria-label={t('approve')}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                           {t('no_pending_approvals', 'No pending approvals at this time.')}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
    </Card>
  )
}
