
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
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
                <Skeleton className="h-12 w-1/2 mb-4" />
                <Skeleton className="h-8 w-3/4 mb-8" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    const otherUsers = users.filter(u => u.role !== 'admin');

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-8">{t('admin_dashboard')}</h1>
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
                    <TableHead className="text-end">{t('actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {otherUsers.map((listUser) => (
                    <TableRow key={listUser.id}>
                        <TableCell>{listUser.name}</TableCell>
                        <TableCell>{listUser.email}</TableCell>
                        <TableCell><Badge variant={listUser.role === 'chef' ? 'secondary' : 'outline'}>{listUser.role}</Badge></TableCell>
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
    </div>
  )
}
