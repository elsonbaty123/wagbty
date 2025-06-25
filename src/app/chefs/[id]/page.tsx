import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Chef } from '@/lib/types';
import { DishCard } from '@/components/dish-card';

const mockChefs: Record<string, Chef> = {
  '1': {
    id: '1',
    name: 'الشيف إيزابيلا روسي',
    specialty: 'المطبخ الإيطالي',
    bio: 'بخبرة تزيد عن 20 عامًا في الطهي الإيطالي التقليدي، تجلب إيزابيلا المذاق الأصيل لمدينتها بولونيا إلى طاولتك. فلسفتها بسيطة: مكونات طازجة وعالية الجودة والكثير من الحب.',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.9,
    dishes: [
      { id: 'd1', name: 'تالياتيلي مصنوعة يدوياً بصلصة الراجو', description: 'راجو لحم مطبوخ ببطء فوق باستا البيض الطازجة المصنوعة يدويًا.', price: 240.0, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd2', name: 'ريزوتو بفطر البورشيني', description: 'ريزوتو كريمي مع فطر البورشيني البري، جبنة بارميزان، وزيت الكمأة البيضاء.', price: 265.0, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd3', name: 'تيراميسو كلاسيكو', description: 'الحلوى الإيطالية الكلاسيكية مع أصابع السيدة المنقوعة في الإسبريسو وكريمة الماسكاربوني.', price: 120.0, imageUrl: 'https://placehold.co/400x225.png' },
    ],
  },
   '2': {
    id: '2',
    name: 'الشيف أنطوان دوبوا',
    specialty: 'الحلويات الفرنسية',
    bio: 'أنطوان هو شيف حلويات مدرب في لو كوردون بلو ومتخصص في الحلويات الفرنسية الكلاسيكية. يعتقد أن الحلوى ليست مجرد نهاية للوجبة، بل هي تجربة بحد ذاتها.',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.8,
    dishes: [
      { id: 'd4', name: 'كيكة الشوكولاتة الذائبة', description: 'كيكة شوكولاتة ذائبة غنية مع مركز من كولي التوت.', price: 140.0, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd5', name: 'كريم بروليه', description: 'كاسترد غني بحبوب الفانيليا مع طبقة علوية من السكر المكرمل بشكل مثالي.', price: 115.0, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd6', name: 'تشكيلة ماكارون', description: 'مجموعة مختارة من ستة قطع ماكارون فرنسية رقيقة بنكهات مختلفة.', price: 180.0, imageUrl: 'https://placehold.co/400x225.png' },
    ],
  },
   '3': {
    id: '3',
    name: 'الشيف كينجي تاناكا',
    specialty: 'سوشي وشواية يابانية',
    bio: 'كينجي هو سيد سوشي من الجيل الثالث من طوكيو، وهو مكرس لفن سوشي إيدوماي. تتجلى مهاراته الدقيقة في استخدام السكين واحترامه للمكونات في كل قطعة.',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.9,
    dishes: [
      { id: 'd7', name: 'مجموعة سوشي أوماكاسي', description: 'مجموعة من اختيار الشيف مكونة من 12 قطعة من سوشي نيجيري الفاخر.', price: 650.0, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd8', name: 'أسياخ لحم الواغيو', description: 'أسياخ لحم بقر واغيو A5 مشوية مع صلصة صويا حلوة.', price: 350.0, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd9', name: 'أرز مقرمش بالتونة الحارة', description: 'أرز مقلي مقرمش يعلوه تونة حارة وهالبينو.', price: 190.0, imageUrl: 'https://placehold.co/400x225.png' },
    ],
  },
};

export default function ChefProfilePage({ params }: { params: { id: string } }) {
  const chef = mockChefs[params.id] || Object.values(mockChefs)[0];

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-24 text-right">
            <Image
              alt={chef.name}
              className="aspect-square w-full rounded-xl object-cover shadow-lg"
              height="400"
              src={chef.imageUrl}
              data-ai-hint="chef cooking"
              width="400"
            />
            <h1 className="font-headline text-3xl font-bold mt-4">{chef.name}</h1>
            <p className="text-lg text-primary font-semibold mt-1">{chef.specialty}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="text-sm text-muted-foreground">(24 تقييم)</span>
              <span className="font-bold text-lg">{chef.rating}</span>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="mt-4 text-muted-foreground">{chef.bio}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="font-headline text-3xl font-bold text-primary mb-6 text-right">قائمة الطعام</h2>
          <div className="grid gap-6">
            {chef.dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
