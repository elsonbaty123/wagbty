
'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useOrders } from "@/context/order-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MoreVertical, Trash2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { Dish, DishStatus } from '@/lib/types';

export default function AdminDishesPage() {
    const { t } = useTranslation();
    const { chefs } = useAuth();
    const { dishes, loading, updateDish, deleteDish } = useOrders();
    const { toast } = useToast();

    const dishesWithChefNames = useMemo(() => {
        return dishes.map(dish => {
            const chef = chefs.find(c => c.id === dish.chefId);
            return {
                ...dish,
                chefName: chef ? chef.name : t('unknown_chef'),
            };
        });
    }, [dishes, chefs, t]);
    
    const handleStatusChange = async (dish: Dish, newStatus: DishStatus) => {
        try {
            await updateDish({ ...dish, status: newStatus });
            toast({
                title: t('status_updated'),
                description: t('dish_status_updated_to', { name: dish.name, status: t(`dish_status_${newStatus}`) }),
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error.message || t('failed_to_update_dish_status'),
            });
        }
    };

    const handleDeleteDish = async (dishId: string, dishName: string) => {
        try {
            await deleteDish(dishId);
            toast({
                variant: 'destructive',
                title: t('dish_deleted'),
                description: t('dish_deleted_desc', { name: dishName }),
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error.message || t('failed_to_delete_dish'),
            });
        }
    };

    const statusMap: Record<DishStatus, { labelKey: string, variant: "default" | "secondary" | "outline" | "destructive" | null | undefined }> = {
      'available': { labelKey: 'dish_status_available', variant: 'default' },
      'unavailable': { labelKey: 'dish_status_unavailable', variant: 'secondary' },
      'hidden': { labelKey: 'dish_status_hidden', variant: 'outline' },
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('dish_management', 'Dish Management')}</CardTitle>
                <CardDescription>{t('dish_management_desc', 'Suspend or delete dishes from all chefs.')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('dish')}</TableHead>
                            <TableHead>{t('chef')}</TableHead>
                            <TableHead>{t('price')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead className="text-end">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dishesWithChefNames.length > 0 ? (
                            dishesWithChefNames.map((dish) => (
                                <TableRow key={dish.id}>
                                    <TableCell className="flex items-center gap-4">
                                        <Image src={dish.imageUrl} alt={dish.name} width={64} height={64} className="rounded-md object-cover w-16 h-16" data-ai-hint="food dish" />
                                        <span className="font-medium">{dish.name}</span>
                                    </TableCell>
                                    <TableCell>{dish.chefName}</TableCell>
                                    <TableCell>{dish.price.toFixed(2)} {t('currency_egp')}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusMap[dish.status].variant}>
                                            {t(statusMap[dish.status].labelKey)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-end">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{t('change_status')}</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusChange(dish, 'available')} disabled={dish.status === 'available'}>
                                                        <CheckCircle className="h-4 w-4 me-2 text-green-500" />
                                                        {t('dish_status_available')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(dish, 'unavailable')} disabled={dish.status === 'unavailable'}>
                                                        <Eye className="h-4 w-4 me-2 text-orange-500" />
                                                        {t('dish_status_unavailable')}
                                                    </DropdownMenuItem>
                                                     <DropdownMenuItem onClick={() => handleStatusChange(dish, 'hidden')} disabled={dish.status === 'hidden'}>
                                                        <EyeOff className="h-4 w-4 me-2 text-gray-500" />
                                                        {t('dish_status_hidden')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                            <Trash2 className="h-4 w-4 me-2" />
                                                            {t('delete_dish')}
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                             <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('delete_dish_admin_warning', { name: dish.name, chef: dish.chefName })}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteDish(dish.id, dish.name)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        {t('delete_confirm')}
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
                                    {t('no_dishes_found', 'No dishes found in the system.')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
