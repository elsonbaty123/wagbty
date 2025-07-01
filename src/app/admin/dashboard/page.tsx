
'use client';
import { useState, useMemo } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Trash2, UserPlus, MoreHorizontal, Ban, CheckCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CreateUserForm } from '@/components/admin/create-user-form';
import type { User, UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminDashboardPage() {
    const { t } = useTranslation();
    const { user, users, loading, deleteUser, updateUserByAdmin } = useAuth();
    const { toast } = useToast();
    const [isCreateUserOpen, setCreateUserOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    
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
    
    const handleStatusUpdate = async (userToUpdate: User, newStatus: 'active' | 'suspended') => {
        try {
            await updateUserByAdmin(userToUpdate.id, { accountStatus: newStatus });
            toast({
                title: t('user_status_updated'),
                description: t('user_status_updated_desc', { name: userToUpdate.name, status: t(newStatus) }),
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error.message || t('failed_to_update_user'),
            });
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.role !== 'admin' &&
            (roleFilter === 'all' || u.role === roleFilter) &&
            (
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [users, searchQuery, roleFilter]);


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

  return (
    <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div>
                    <CardTitle>{t('user_management')}</CardTitle>
                    <CardDescription>{t('user_management_desc')}</CardDescription>
                </div>
                <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder={t('filter_by_role', 'Filter by role...')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('all_roles', 'All Roles')}</SelectItem>
                                <SelectItem value="customer">{t('customer')}</SelectItem>
                                <SelectItem value="chef">{t('chef')}</SelectItem>
                                <SelectItem value="delivery">{t('delivery_person', 'Delivery Driver')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative flex-grow">
                            <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('search_by_name_or_email', 'Search by name or email...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="ps-8 w-full"
                            />
                        </div>
                    </div>
                    <Dialog open={isCreateUserOpen} onOpenChange={setCreateUserOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex-shrink-0">
                                <UserPlus className="me-2 h-4 w-4" />
                                {t('create_new_user', 'Create New User')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <CreateUserForm onFinished={() => setCreateUserOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
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
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((listUser) => (
                        <TableRow key={listUser.id}>
                            <TableCell>{listUser.name}</TableCell>
                            <TableCell>{listUser.email}</TableCell>
                            <TableCell><Badge variant={listUser.role === 'chef' ? 'secondary' : listUser.role === 'delivery' ? 'outline' : 'default'}>{t(listUser.role)}</Badge></TableCell>
                            <TableCell>
                                <Badge 
                                    variant={
                                        listUser.accountStatus === 'active' ? 'default' 
                                        : listUser.accountStatus === 'pending_approval' ? 'secondary' 
                                        : listUser.accountStatus === 'suspended' ? 'outline'
                                        : 'destructive'
                                    }
                                    className={cn(
                                        listUser.accountStatus === 'active' && 'bg-green-500',
                                        listUser.accountStatus === 'suspended' && 'bg-yellow-500 text-yellow-900 border-yellow-500',
                                    )}
                                >
                                    {t(`account_status_${listUser.accountStatus || 'active'}`)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-end">
                                <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={user?.id === listUser.id}>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {listUser.accountStatus === 'suspended' ? (
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(listUser, 'active')}>
                                                    <CheckCircle className="me-2 h-4 w-4" />
                                                    <span>{t('reactivate_account', 'Reactivate Account')}</span>
                                                </DropdownMenuItem>
                                            ) : (
                                                listUser.accountStatus === 'active' && (
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(listUser, 'suspended')}>
                                                        <Ban className="me-2 h-4 w-4" />
                                                        <span>{t('suspend_account', 'Suspend Account')}</span>
                                                    </DropdownMenuItem>
                                                )
                                            )}
                                            <DropdownMenuSeparator />
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                    <Trash2 className="me-2 h-4 w-4" />
                                                    <span>{t('delete_user', 'Delete User')}</span>
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
                                                {t('delete_confirm', 'Delete')}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                           {t('no_users_found', 'No users found.')}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
    </Card>
  )
}
