'use client';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import { Edit, MoreVertical, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import type { Dish, DishStatus } from '@/lib/types';
import { useOrders } from '@/context/order-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface DishManagementCardProps {
  dish: Dish;
  onEdit: () => void;
}

export function DishManagementCard({ dish, onEdit }: DishManagementCardProps) {
    const { t } = useTranslation();
    const { updateDish, deleteDish } = useOrders();
    const { toast } = useToast();

    const handleStatusChange = (newStatus: DishStatus) => {
        updateDish({ ...dish, status: newStatus });
        toast({ title: t('dish_status_updated') });
    };

    const handleDelete = () => {
        deleteDish(dish.id);
        toast({ title: t('dish_deleted_toast'), variant: 'destructive' });
    };

    const statusMap: Record<DishStatus, { labelKey: string, variant: "default" | "secondary" | "outline" | "destructive" | null | undefined }> = {
      'available': { labelKey: 'dish_status_available', variant: 'default' },
      'unavailable': { labelKey: 'dish_status_unavailable', variant: 'secondary' },
      'hidden': { labelKey: 'dish_status_hidden', variant: 'outline' },
    };
    
    const isHidden = dish.status === 'hidden';
    const currentStatus = statusMap[dish.status] || statusMap['available'];

    return (
        <AlertDialog>
            <Card className={cn("flex flex-col transition-opacity", isHidden && 'opacity-60')}>
                <CardHeader className="p-0 relative">
                    <Image src={dish.imageUrl} alt={dish.name} width={400} height={225} className="aspect-video w-full rounded-t-lg object-cover" data-ai-hint="plated food" />
                    <div className="absolute top-2 start-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onEdit}>
                                    <Edit className="h-4 w-4" />
                                    <span>{t('edit')}</span>
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                        <span>{t('delete')}</span>
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Badge variant={currentStatus.variant} className="absolute top-2 end-2">{t(currentStatus.labelKey)}</Badge>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                    <CardTitle>{dish.name}</CardTitle>
                    <p className="text-lg font-bold text-primary mt-1">{dish.price.toFixed(2)} {t('currency_egp')}</p>
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p><strong>{t('category')}:</strong> {dish.category}</p>
                        <p><strong>{t('prep_time_minutes')}:</strong> {dish.prepTime}</p>
                    </div>
                </CardContent>
                <CardFooter className="p-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full">{t('change_status')}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56">
                            <DropdownMenuItem onClick={() => handleStatusChange('available')}>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>{t('dish_status_available')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('unavailable')}>
                                <Eye className="h-4 w-4 text-orange-500" />
                                <span>{t('status_temporarily_unavailable')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('hidden')}>
                                <EyeOff className="h-4 w-4 text-gray-500" />
                                <span>{t('status_hidden_disabled')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardFooter>
            </Card>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('delete_dish_warning', { name: dish.name })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('delete')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
