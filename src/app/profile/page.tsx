import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/order-card';
import type { Order } from '@/lib/types';

const mockOrders: Order[] = [
  {
    id: 'ORD123',
    customerName: 'فلانة الفلانية',
    customerPhone: '(555) 123-4567',
    deliveryAddress: '456 شارع أوك، سبرينغفيلد، الولايات المتحدة الأمريكية',
    dish: { id: 'd1', name: 'تالياتيلي مصنوعة يدوياً بصلصة الراجو', description: '', price: 24.0, imageUrl: '' },
    chef: { id: '1', name: 'الشيف إيزابيلا روسي' },
    status: 'تم التوصيل',
  },
  {
    id: 'ORD124',
    customerName: 'فلانة الفلانية',
    customerPhone: '(555) 123-4567',
    deliveryAddress: '456 شارع أوك، سبرينغفيلد، الولايات المتحدة الأمريكية',
    dish: { id: 'd7', name: 'مجموعة سوشي أوماكاسي', description: '', price: 65.0, imageUrl: '' },
    chef: { id: '3', name: 'الشيف كينجي تاناكا' },
    status: 'مؤكد',
  },
  {
    id: 'ORD125',
    customerName: 'فلانة الفلانية',
    customerPhone: '(555) 123-4567',
    deliveryAddress: '456 شارع أوك، سبرينغفيلد، الولايات المتحدة الأمريكية',
    dish: { id: 'd5', name: 'كريم بروليه', description: '', price: 11.5, imageUrl: '' },
    chef: { id: '2', name: 'الشيف أنطوان دوبوا' },
    status: 'قيد الانتظار',
  },
];

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-8">ملفي الشخصي</h1>
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="orders">طلباتي</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>سجل الطلبات</CardTitle>
              <CardDescription>عرض طلباتك السابقة والحالية.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الشخصية</CardTitle>
              <CardDescription>تحديث معلوماتك الشخصية وتفاصيل التوصيل.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input id="name" defaultValue="فلانة الفلانية" className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" defaultValue="jane.doe@example.com" className="text-right" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" type="tel" defaultValue="(555) 123-4567" className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">عنوان التوصيل الافتراضي</Label>
                <Textarea id="address" defaultValue="456 شارع أوك، سبرينغفيلد، الولايات المتحدة الأمريكية" className="text-right" />
              </div>
              <div className="flex justify-start">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">حفظ التغييرات</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
