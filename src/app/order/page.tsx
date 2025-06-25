
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dish } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const mockDishes: Record<string, Dish> = {
  'd1': { id: 'd1', name: 'تالياتيلي مصنوعة يدوياً بصلصة الراجو', description: 'راجو لحم مطبوخ ببطء فوق باستا البيض الطازجة المصنوعة يدويًا.', price: 240.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd2': { id: 'd2', name: 'ريزوتو بفطر البورشيني', description: 'ريزوتو كريمي مع فطر البورشيني البري، جبنة بارميزان، وزيت الكمأة البيضاء.', price: 265.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd3': { id: 'd3', name: 'تيراميسو كلاسيكو', description: 'الحلوى الإيطالية الكلاسيكية مع أصابع السيدة المنقوعة في الإسبريسو وكريمة الماسكاربوني.', price: 120.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd4': { id: 'd4', name: 'كيكة الشوكولاتة الذائبة', description: 'كيكة شوكولاتة ذائبة غنية مع مركز من كولي التوت.', price: 140.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd5': { id: 'd5', name: 'كريم بروليه', description: 'كاسترد غني بحبوب الفانيليا مع طبقة علوية من السكر المكرمل بشكل مثالي.', price: 115.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd6': { id: 'd6', name: 'تشكيلة ماكارون', description: 'مجموعة مختارة من ستة قطع ماكارون فرنسية رقيقة بنكهات مختلفة.', price: 180.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd7': { id: 'd7', name: 'مجموعة سوشي أوماكاسي', description: 'مجموعة من اختيار الشيف مكونة من 12 قطعة من سوشي نيجيري الفاخر.', price: 650.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd8': { id: 'd8', name: 'أسياخ لحم الواغيو', description: 'أسياخ لحم بقر واغيو A5 مشوية مع صلصة صويا حلوة.', price: 350.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd9': { id: 'd9', name: 'أرز مقرمش بالتونة الحارة', description: 'أرز مقلي مقرمش يعلوه تونة حارة وهالبينو.', price: 190.0, imageUrl: 'https://placehold.co/400x225.png' },
};

export default function OrderPage() {
  const searchParams = useSearchParams();
  const dishId = searchParams.get('dishId');
  const dish = mockDishes[dishId || 'd1'] || Object.values(mockDishes)[0];
  const { user, loading } = useAuth();

  const subtotal = dish.price;
  const deliveryFee = 50.0;
  const total = subtotal + deliveryFee;

  if (loading) {
      return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid gap-12 md:grid-cols-2">
                <div>
                    <Skeleton className="h-10 w-72 mb-6" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 text-right">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/`}>
            العودة للرئيسية
            <ArrowRight className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary mb-6">أكمل طلبك</h1>
          {!user ? (
             <Card>
              <CardHeader>
                <CardTitle>مطلوب تسجيل الدخول</CardTitle>
                <CardDescription>
                  يجب عليك تسجيل الدخول أو إنشاء حساب جديد لتتمكن من إكمال طلبك.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={`/login?redirect=/order?dishId=${dish.id}`}>تسجيل الدخول</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/signup?redirect=/order?dishId=${dish.id}`}>إنشاء حساب جديد</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>معلومات التوصيل</CardTitle>
                <CardDescription>هذا هو عنوان التوصيل المسجل في حسابك.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="font-semibold">{user.name}</p>
                 <p>456 شارع الجزيرة، الزمالك، القاهرة</p>
                 <p>01012345678</p>
                 <Button variant="outline">تغيير العنوان</Button>
              </CardContent>
            </Card>
          )}
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
                        <p className="font-bold text-primary">{dish.price.toFixed(2)} جنيه</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>تفاصيل الدفع</CardTitle>
                </CardHeader>
                 <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">المجموع الفرعي</span>
                        <span>{subtotal.toFixed(2)} جنيه</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">رسوم التوصيل</span>
                        <span>{deliveryFee.toFixed(2)} جنيه</span>
                    </div>
                     <div className="flex items-center justify-between font-bold text-lg">
                        <span className="text-primary">المجموع الكلي</span>
                        <span>{total.toFixed(2)} جنيه</span>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={!user}>
                    تأكيد الطلب
                  </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
