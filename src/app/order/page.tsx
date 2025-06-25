import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Dish } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

const mockDishes: Record<string, Dish> = {
  'd1': { id: 'd1', name: 'تالياتيلي مصنوعة يدوياً بصلصة الراجو', description: 'راجو لحم مطبوخ ببطء فوق باستا البيض الطازجة المصنوعة يدويًا.', price: 24.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd2': { id: 'd2', name: 'ريزوتو بفطر البورشيني', description: 'ريزوتو كريمي مع فطر البورشيني البري، جبنة بارميزان، وزيت الكمأة البيضاء.', price: 26.5, imageUrl: 'https://placehold.co/400x225.png' },
  'd3': { id: 'd3', name: 'تيراميسو كلاسيكو', description: 'الحلوى الإيطالية الكلاسيكية مع أصابع السيدة المنقوعة في الإسبريسو وكريمة الماسكاربوني.', price: 12.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd4': { id: 'd4', name: 'كيكة الشوكولاتة الذائبة', description: 'كيكة شوكولاتة ذائبة غنية مع مركز من كولي التوت.', price: 14.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd5': { id: 'd5', name: 'كريم بروليه', description: 'كاسترد غني بحبوب الفانيليا مع طبقة علوية من السكر المكرمل بشكل مثالي.', price: 11.5, imageUrl: 'https://placehold.co/400x225.png' },
  'd6': { id: 'd6', name: 'تشكيلة ماكارون', description: 'مجموعة مختارة من ستة قطع ماكارون فرنسية رقيقة بنكهات مختلفة.', price: 18.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd7': { id: 'd7', name: 'مجموعة سوشي أوماكاسي', description: 'مجموعة من اختيار الشيف مكونة من 12 قطعة من سوشي نيجيري الفاخر.', price: 65.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd8': { id: 'd8', name: 'أسياخ لحم الواغيو', description: 'أسياخ لحم بقر واغيو A5 مشوية مع صلصة صويا حلوة.', price: 35.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd9': { id: 'd9', name: 'أرز مقرمش بالتونة الحارة', description: 'أرز مقلي مقرمش يعلوه تونة حارة وهالبينو.', price: 19.0, imageUrl: 'https://placehold.co/400x225.png' },
};

export default function OrderPage({ searchParams }: { searchParams: { dishId: string } }) {
  const dish = mockDishes[searchParams.dishId] || Object.values(mockDishes)[0];

  const subtotal = dish.price;
  const deliveryFee = 5.0;
  const total = subtotal + deliveryFee;

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/`}>
            العودة إلى الطهاة
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary mb-6">أكمل طلبك</h1>
          <Card>
            <CardHeader>
              <CardTitle>معلومات التوصيل</CardTitle>
              <CardDescription>يرجى تقديم عنوان التوصيل ورقم الاتصال.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input id="name" placeholder="فلان الفلاني" required className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" type="tel" placeholder="(123) 456-7890" required className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">عنوان التوصيل</Label>
                <Textarea id="address" placeholder="123 شارع رئيسي، أي مدينة، الولايات المتحدة الأمريكية" required className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">تعليمات خاصة</Label>
                <Textarea id="notes" placeholder="مثال: اتركه عند الباب الأمامي." className="text-right" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
           <h2 className="font-headline text-2xl font-bold">ملخص الطلب</h2>
            <Card>
                <CardContent className="p-6 flex items-center gap-4">
                    <Image
                      alt={dish.name}
                      className="rounded-md object-cover"
                      height="80"
                      src={dish.imageUrl}
                      data-ai-hint="food item"
                      width="80"
                    />
                    <div className="grid gap-1 flex-1">
                        <h3 className="font-semibold">{dish.name}</h3>
                        <p className="text-sm text-muted-foreground">{dish.description}</p>
                        <p className="font-bold text-primary">${dish.price.toFixed(2)}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>تفاصيل الدفع</CardTitle>
                </CardHeader>
                 <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span>${subtotal.toFixed(2)}</span>
                        <span className="text-muted-foreground">المجموع الفرعي</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>${deliveryFee.toFixed(2)}</span>
                        <span className="text-muted-foreground">رسوم التوصيل</span>
                    </div>
                     <div className="flex items-center justify-between font-bold text-lg">
                        <span className="text-primary">${total.toFixed(2)}</span>
                        <span>المجموع الكلي</span>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    تأكيد الطلب
                  </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
