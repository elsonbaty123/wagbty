
import type { Dish, Order, Coupon, User } from '@/lib/types';

// The application will now start with pre-defined data for local storage.
// This data will be used to seed the database if it's empty.

// Note: All initial passwords are 'Password123!'
export const initialUsers: (User & { hashedPassword?: string })[] = [
    {
        id: 'customer1',
        name: 'أحمد محمود',
        email: 'ahmed.mahmoud@example.com',
        role: 'customer',
        phone: '01234567890',
        address: '123 شارع النيل، القاهرة',
        imageUrl: 'https://placehold.co/100x100.png',
        hashedPassword: '$2a$10$f/O5.Q8sO3/1tE/P.f.yoe.X3.nL.yT7qZ9V6xO3mJ6W.V3.vO1o.'
    },
    {
        id: 'customer2',
        name: 'فاطمة علي',
        email: 'fatima.ali@example.com',
        role: 'customer',
        phone: '01098765432',
        address: '456 شارع الهرم، الجيزة',
        imageUrl: 'https://placehold.co/100x100.png',
        hashedPassword: '$2a$10$f/O5.Q8sO3/1tE/P.f.yoe.X3.nL.yT7qZ9V6xO3mJ6W.V3.vO1o.'
    },
    {
        id: 'chef1',
        name: 'الشيف أنطوان',
        email: 'chef.antoine@example.com',
        role: 'chef',
        phone: '01112223334',
        specialty: 'المطبخ الفرنسي',
        bio: 'طاهٍ متخصص في المطبخ الفرنسي التقليدي مع لمسة عصرية. خبرة 20 عامًا في أرقى المطاعم.',
        imageUrl: 'https://placehold.co/400x400.png',
        rating: 4.8,
        availabilityStatus: 'available',
        hashedPassword: '$2a$10$f/O5.Q8sO3/1tE/P.f.yoe.X3.nL.yT7qZ9V6xO3mJ6W.V3.vO1o.'
    },
    {
        id: 'chef2',
        name: 'الشيف جميلة',
        email: 'chef.jamila@example.com',
        role: 'chef',
        phone: '01556677889',
        specialty: 'المطبخ المصري الأصيل',
        bio: 'أقدم أشهى الأطباق المصرية البيتية التي نشأنا عليها، محضرة بحب وشغف.',
        imageUrl: 'https://placehold.co/400x400.png',
        rating: 4.9,
        availabilityStatus: 'busy',
        hashedPassword: '$2a$10$f/O5.Q8sO3/1tE/P.f.yoe.X3.nL.yT7qZ9V6xO3mJ6W.V3.vO1o.'
    },
];

export const allDishes: Dish[] = [
    {
        id: 'dish1',
        chefId: 'chef1',
        name: 'راتاتوي',
        description: 'طبق خضروات فرنسي كلاسيكي مشوي في الفرن مع أعشاب بروفانس.',
        price: 180,
        imageUrl: 'https://placehold.co/800x450.png',
        ingredients: ['باذنجان', 'كوسة', 'طماطم', 'فلفل ألوان', 'بصل', 'ثوم', 'زيت زيتون'],
        prepTime: 45,
        category: 'أطباق رئيسية',
        status: 'available',
        ratings: [
            { customerName: 'أحمد محمود', rating: 5, review: 'طبق رائع ونكهات متوازنة!', createdAt: '2023-10-26T10:00:00Z' },
            { customerName: 'سارة', rating: 4, review: 'جيد جدًا، لكن أتمنى لو كان حجم الحصة أكبر.', createdAt: '2023-10-25T15:30:00Z' },
        ],
    },
    {
        id: 'dish2',
        chefId: 'chef2',
        name: 'فتة باللحم',
        description: 'طبق مصري أصيل من الأرز والخبز وصلصة الطماطم بالخل والثوم، مغطى بقطع اللحم الطرية.',
        price: 250,
        imageUrl: 'https://placehold.co/800x450.png',
        ingredients: ['لحم بقري', 'أرز مصري', 'خبز بلدي', 'طماطم', 'خل', 'ثوم'],
        prepTime: 90,
        category: 'أطباق رئيسية',
        status: 'available',
        ratings: [
            { customerName: 'فاطمة علي', rating: 5, review: 'أفضل فتة تناولتها في حياتي! اللحم يذوب في الفم.', createdAt: '2023-10-27T12:00:00Z' },
        ],
    },
     {
        id: 'dish3',
        chefId: 'chef2',
        name: 'ملوخية بالأرانب',
        description: 'الملوخية الخضراء الشهية مع تقلية الثوم والكزبرة، تقدم مع قطع من لحم الأرانب الطري.',
        price: 220,
        imageUrl: 'https://placehold.co/800x450.png',
        ingredients: ['ملوخية', 'أرانب', 'ثوم', 'كزبرة', 'سمن بلدي'],
        prepTime: 75,
        category: 'أطباق رئيسية',
        status: 'unavailable',
        ratings: [],
    },
];

export const initialOrders: Order[] = [
     {
        id: 'order1',
        customerId: 'customer1',
        customerName: 'أحمد محمود',
        customerPhone: '01234567890',
        deliveryAddress: '123 شارع النيل، القاهرة',
        dish: allDishes.find(d => d.id === 'dish2')!,
        chef: { id: 'chef2', name: 'الشيف جميلة' },
        quantity: 1,
        status: 'delivered',
        createdAt: '2023-10-28T14:00:00Z',
        rating: 5,
        review: 'الفتة كانت رائعة والتوصيل سريع!',
        subtotal: 250,
        deliveryFee: 30,
        discount: 0,
        total: 280,
    },
    {
        id: 'order2',
        customerId: 'customer2',
        customerName: 'فاطمة علي',
        customerPhone: '01098765432',
        deliveryAddress: '456 شارع الهرم، الجيزة',
        dish: allDishes.find(d => d.id === 'dish1')!,
        chef: { id: 'chef1', name: 'الشيف أنطوان' },
        quantity: 2,
        status: 'preparing',
        createdAt: '2023-10-29T18:30:00Z',
        subtotal: 360,
        deliveryFee: 35,
        discount: 36,
        total: 359,
        appliedCouponCode: 'SAVE10',
    }
];

export const initialCoupons: Coupon[] = [
    {
        id: 'coupon1',
        chefId: 'chef1',
        code: 'SAVE10',
        discountType: 'percentage',
        discountValue: 10,
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        usageLimit: 100,
        timesUsed: 25,
        isActive: true,
        appliesTo: 'all',
    },
     {
        id: 'coupon2',
        chefId: 'chef2',
        code: 'WELCOME50',
        discountType: 'fixed',
        discountValue: 50,
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        usageLimit: 200,
        timesUsed: 50,
        isActive: true,
        appliesTo: 'all',
    }
];
