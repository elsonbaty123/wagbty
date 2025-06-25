import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChefCard } from '@/components/chef-card';
import type { Chef } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

const featuredChefs: Chef[] = [
  {
    id: '1',
    name: 'الشيف إيزابيلا روسي',
    specialty: 'المطبخ الإيطالي',
    bio: 'نكهات إيطالية أصيلة تناقلتها الأجيال. جرب قلب إيطاليا في طبقك.',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.9,
    dishes: [],
  },
  {
    id: '2',
    name: 'الشيف أنطوان دوبوا',
    specialty: 'الحلويات الفرنسية',
    bio: 'خبير المعجنات الرقيقة والحلويات الفاخرة. كل قضمة هي قطعة صغيرة من جنة باريس.',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.8,
    dishes: [],
  },
  {
    id: '3',
    name: 'الشيف كينجي تاناكا',
    specialty: 'سوشي وشواية يابانية',
    bio: 'دقة وشغف في كل لفة. نحضر المكونات الطازجة لتجربة سوشي راقية.',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.9,
    dishes: [],
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="w-full py-20 md:py-32 lg:py-40 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  اكتشف أساتذة الطهي
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  تواصل مع طهاة موهوبين، استكشف أطباقًا فريدة، واحصل على وجبات مذهلة تصل إلى بابك.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="#featured-chefs">
                    ابحث عن طاهٍ
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <img
              alt="Hero"
              className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              data-ai-hint="gourmet dish"
              src="https://placehold.co/600x600.png"
            />
          </div>
        </div>
      </section>

      <section id="featured-chefs" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">تعرف على أفضل طهاتنا</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                تم اختيارهم بعناية لشغفهم ومهاراتهم ووجهات نظرهم الفريدة في الطهي.
              </p>
            </div>
          </div>
          <div className="mx-auto grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
            {featuredChefs.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
