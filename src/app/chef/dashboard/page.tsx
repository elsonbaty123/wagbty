import { OrderCard } from '@/components/order-card';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Utensils, ClipboardList } from 'lucide-react';

const mockChefOrders: Order[] = [
  {
    id: 'ORD125',
    customerName: 'جين دو',
    customerPhone: '(555) 123-4567',
    deliveryAddress: '456 شارع أوك، سبرينغفيلد، الولايات المتحدة الأمريكية',
    dish: { id: 'd5', name: 'كريم بروليه', description: '', price: 11.5, imageUrl: '' },
    chef: { id: '2', name: 'الشيف أنطوان دوبوا' },
    status: 'قيد الانتظار',
  },
  {
    id: 'ORD126',
    customerName: 'جون سميث',
    customerPhone: '(555) 987-6543',
    deliveryAddress: '789 شارع باين، متروفيل، الولايات المتحدة الأمريكية',
    dish: { id: 'd4', name: 'كيكة الشوكولاتة الذائبة', description: '', price: 14.0, imageUrl: '' },
    chef: { id: '2', name: 'الشيف أنطوان دوبوا' },
    status: 'قيد الانتظار',
  },
  {
    id: 'ORD127',
    customerName: 'إيميلي جونسون',
    customerPhone: '(555) 555-5555',
    deliveryAddress: '101 طريق ميبل، جوثام، الولايات المتحدة الأمريكية',
    dish: { id: 'd6', name: 'تشكيلة ماكارون', description: '', price: 18.0, imageUrl: '' },
    chef: { id: '2', name: 'الشيف أنطوان دوبوا' },
    status: 'مؤكد',
  },
];

export default function ChefDashboardPage() {
  const pendingOrders = mockChefOrders.filter(o => o.status === 'قيد الانتظار');
  const otherOrders = mockChefOrders.filter(o => o.status !== 'قيد الانتظار');

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">لوحة تحكم الشيف</h1>
        <p className="font-semibold text-lg">مرحبًا بعودتك، شيف أنطوان!</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات النشطة</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5</div>
             <p className="text-xs text-muted-foreground">قيد التنفيذ حاليًا</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات جديدة</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingOrders.length} <Badge>قيد الانتظار</Badge>
            </div>
             <p className="text-xs text-muted-foreground">تتطلب تأكيدك</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-headline text-2xl font-bold mb-4">طلبات جديدة</h2>
        {pendingOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} isChefView />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">لا توجد طلبات جديدة في الوقت الحالي.</p>
        )}
      </div>

      <div className="mt-12">
        <h2 className="font-headline text-2xl font-bold mb-4">سجل الطلبات</h2>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
