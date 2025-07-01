
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
    const { t } = useTranslation();
    const { user, users, loading, deleteUser } = useAuth();
    const { toast } = useToast();
    
    const handleDeleteUser = async (userId: string, userName: string) => {
        try {
            await deleteUser(userId);
            toast({
                title: t('user_deleted'),
                description: t('user_deleted_desc', { name: userName }),
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error.message || t('failed_to_delete_user'),
            });
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
                    <Skeleton className="h-[400px] w-full" />
                </CardContent>
            </Card>
        )
    }

    const otherUsers = users.filter(u => u.role !== 'admin');

  return (
    <Card>
        <CardHeader>
            <CardTitle>{t('user_management')}</CardTitle>
            <CardDescription>{t('user_management_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('account_status', 'Account Status')}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {otherUsers.map((listUser) => (
                <TableRow key={listUser.id}>
                    <TableCell>{listUser.name}</TableCell>
                    <TableCell>{listUser.email}</TableCell>
                    <TableCell><Badge variant={listUser.role === 'chef' ? 'secondary' : 'outline'}>{t(listUser.role)}</Badge></TableCell>
                    <TableCell>
                        <Badge 
                            variant={listUser.accountStatus === 'active' ? 'default' : listUser.accountStatus === 'pending_approval' ? 'secondary' : 'destructive'}
                            className={listUser.accountStatus === 'active' ? 'bg-green-500' : ''}
                        >
                            {t(`account_status_${listUser.accountStatus || 'active'}`)}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" disabled={user?.id === listUser.id}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('delete_user_warning', { name: listUser.name })}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDeleteUser(listUser.id, listUser.name)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {t('delete_user_confirm')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
    </Card>
  )
}
