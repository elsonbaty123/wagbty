import type { Chef, Dish, Order } from '@/lib/types';

export const allChefs: Chef[] = [
    {
        id: 'chef1',
        name: 'الشيف إيزابيلا روسي',
        specialty: 'المطبخ الإيطالي',
        bio: 'بخبرة تزيد عن 20 عامًا في الطهي الإيطالي التقليدي، تجلب إيزابيلا المذاق الأصيل لمدينتها بولونيا إلى طاولتك. فلسفتها بسيطة: مكونات طازجة وعالية الجودة والكثير من الحب.',
        imageUrl: 'https://placehold.co/400x400.png',
        rating: 4.9,
    },
    {
        id: 'chef2',
        name: 'الشيف أنطوان دوبوا',
        specialty: 'الحلويات الفرنسية',
        bio: 'أنطوان هو شيف حلويات مدرب في لو كوردون بلو ومتخصص في الحلويات الفرنسية الكلاسيكية. يعتقد أن الحلوى ليست مجرد نهاية للوجبة، بل هي تجربة بحد ذاتها.',
        imageUrl: 'https://placehold.co/400x400.png',
        rating: 4.8,
    },
    {
        id: 'chef3',
        name: 'الشيف كينجي تاناكا',
        specialty: 'سوشي وشواية يابانية',
        bio: 'كينجي هو سيد سوشي من الجيل الثالث من طوكيو، وهو مكرس لفن سوشي إيدوماي. تتجلى مهاراته الدقيقة في استخدام السكين واحترامه للمكونات في كل قطعة.',
        imageUrl: 'https://placehold.co/400x400.png',
        rating: 4.9,
    },
];

export const allDishes: Dish[] = [
    // Chef Isabella dishes
    { id: 'd1', chefId: 'chef1', name: 'تالياتيلي مصنوعة يدوياً بصلصة الراجو', description: 'راجو لحم مطبوخ ببطء فوق باستا البيض الطازجة المصنوعة يدويًا.', price: 240.0, imageUrl: 'https://placehold.co/400x225.png' },
    { id: 'd2', chefId: 'chef1', name: 'ريزوتو بفطر البورشيني', description: 'ريزوتو كريمي مع فطر البورشيني البري، جبنة بارميزان، وزيت الكمأة البيضاء.', price: 265.0, imageUrl: 'https://placehold.co/400x225.png' },
    { id: 'd3', chefId: 'chef1', name: 'تيراميسو كلاسيكو', description: 'الحلوى الإيطالية الكلاسيكية مع أصابع السيدة المنقوعة في الإسبريسو وكريمة الماسكاربوني.', price: 120.0, imageUrl: 'https://placehold.co/400x225.png' },
    // Chef Antoine dishes
    { id: 'd4', chefId: 'chef2', name: 'كيكة الشوكولاتة الذائبة', description: 'كيكة شوكولاتة ذائبة غنية مع مركز من كولي التوت.', price: 140.0, imageUrl: 'https://placehold.co/400x225.png' },
    { id: 'd5', chefId: 'chef2', name: 'كريم بروليه', description: 'كاسترد غني بحبوب الفانيليا مع طبقة علوية من السكر المكرمل بشكل مثالي.', price: 115.0, imageUrl: 'https://placehold.co/400x225.png' },
    { id: 'd6', chefId: 'chef2', name: 'تشكيلة ماكارون', description: 'مجموعة مختارة من ستة قطع ماكارون فرنسية رقيقة بنكهات مختلفة.', price: 180.0, imageUrl: 'https://placehold.co/400x225.png' },
    // Chef Kenji dishes
    { id: 'd7', chefId: 'chef3', name: 'مجموعة سوشي أوماكاسي', description: 'مجموعة من اختيار الشيف مكونة من 12 قطعة من سوشي نيجيري الفاخر.', price: 650.0, imageUrl: 'https://placehold.co/400x225.png' },
    { id: 'd8', chefId: 'chef3', name: 'أسياخ لحم الواغيو', description: 'أسياخ لحم بقر واغيو A5 مشوية مع صلصة صويا حلوة.', price: 350.0, imageUrl: 'https://placehold.co/400x225.png' },
    { id: 'd9', chefId: 'chef3', name: 'أرز مقرمش بالتونة الحارة', description: 'أرز مقلي مقرمش يعلوه تونة حارة وهالبينو.', price: 190.0, imageUrl: 'https://placehold.co/400x225.png' },
];


export const initialOrders: Order[] = [
  {
    id: 'ORD123',
    customerId: 'customer1',
    customerName: 'فلانة الفلانية',
    customerPhone: '01012345678',
    deliveryAddress: '456 شارع الجزيرة، الزمالك، القاهرة',
    dish: allDishes.find(d => d.id === 'd1')!,
    chef: { id: 'chef1', name: 'الشيف إيزابيلا روسي' },
    quantity: 1,
    status: 'تم التوصيل',
  },
  {
    id: 'ORD124',
    customerId: 'customer1',
    customerName: 'فلانة الفلانية',
    customerPhone: '01012345678',
    deliveryAddress: '456 شارع الجزيرة، الزمالك، القاهرة',
    dish: allDishes.find(d => d.id === 'd7')!,
    chef: { id: 'chef3', name: 'الشيف كينجي تاناكا' },
    quantity: 1,
    status: 'مؤكد',
  },
  {
    id: 'ORD125',
    customerId: 'customer1',
    customerName: 'فلانة الفلانية',
    customerPhone: '01012345678',
    deliveryAddress: '456 شارع الجزيرة، الزمالك، القاهرة',
    dish: allDishes.find(d => d.id === 'd5')!,
    chef: { id: 'chef2', name: 'الشيف أنطوان دوبوا' },
    quantity: 2,
    status: 'قيد الانتظار',
  },
  {
    id: 'ORD126',
    customerId: 'customer2',
    customerName: 'جون سميث',
    customerPhone: '01234567890',
    deliveryAddress: '789 شارع باين، متروفيل، مصر',
    dish: allDishes.find(d => d.id === 'd4')!,
    chef: { id: 'chef2', name: 'الشيف أنطوان دوبوا' },
    quantity: 1,
    status: 'قيد الانتظار',
  },
];
