
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

interface DishManagementCardProps {
  dish: Dish;
  onEdit: () => void;
}

export function DishManagementCard({ dish, onEdit }: DishManagementCardProps) {
    const { updateDish, deleteDish } = useOrders();
    const { toast } = useToast();

    const handleStatusChange = (newStatus: DishStatus) => {
        updateDish({ ...dish, status: newStatus });
        toast({ title: 'تم تحديث حالة الطبق' });
    };

    const handleDelete = () => {
        deleteDish(dish.id);
        toast({ title: 'تم حذف الطبق بنجاح', variant: 'destructive' });
    };
    
    const getStatusBadgeVariant = (status: DishStatus) => {
        switch (status) {
            case 'متوفرة': return 'default';
            case 'غير متوفرة': return 'secondary';
            case 'مخفية': return 'outline';
            default: return 'default';
        }
    };
    
    const isHidden = dish.status === 'مخفية';

    return (
        <AlertDialog>
            <Card className={cn("flex flex-col transition-opacity", isHidden && 'opacity-60')}>
                <CardHeader className="p-0 relative">
                    <Image src={dish.imageUrl} alt={dish.name} width={400} height={225} className="aspect-video w-full rounded-t-lg object-cover" data-ai-hint="plated food" />
                    <div className="absolute top-2 left-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onEdit}>
                                    <Edit className="ml-2 h-4 w-4" />
                                    <span>تعديل</span>
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                        <Trash2 className="ml-2 h-4 w-4" />
                                        <span>حذف</span>
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Badge variant={getStatusBadgeVariant(dish.status)} className="absolute top-2 right-2">{dish.status}</Badge>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                    <CardTitle>{dish.name}</CardTitle>
                    <p className="text-lg font-bold text-primary mt-1">{dish.price.toFixed(2)} جنيه</p>
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p><strong>التصنيف:</strong> {dish.category}</p>
                        <p><strong>وقت التحضير:</strong> {dish.prepTime} دقيقة</p>
                    </div>
                </CardContent>
                <CardFooter className="p-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full">تغيير الحالة</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56 text-right">
                            <DropdownMenuItem onClick={() => handleStatusChange('متوفرة')}>
                                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                                <span>متوفرة</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('غير متوفرة')}>
                                <Eye className="ml-2 h-4 w-4 text-orange-500" />
                                <span>غير متوفرة مؤقتاً</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('مخفية')}>
                                <EyeOff className="ml-2 h-4 w-4 text-gray-500" />
                                <span>مخفية (إيقاف)</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardFooter>
            </Card>

            <AlertDialogContent className="text-right">
                <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                    <AlertDialogDescription>
                        هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف طبق "{dish.name}" نهائياً.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
