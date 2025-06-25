
export type DishStatus = 'متوفرة' | 'غير متوفرة' | 'مخفية';

export type DishRating = {
  customerName: string;
  rating: number; // 1-5
  review?: string;
  createdAt: string;
};

export type Dish = {
  id: string;
  chefId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  ingredients: string[];
  prepTime: number; // in minutes
  category: string;
  status: DishStatus;
  ratings: DishRating[];
};

export type UserRole = 'customer' | 'chef';

export interface User {
  id: string;
  name:string;
  email: string;
  role: UserRole;
  phone?: string;
  imageUrl?: string;
  // Chef-specific properties
  specialty?: string;
  bio?: string;
  rating?: number;
}

export type OrderStatus = 'جارٍ المراجعة' | 'قيد التحضير' | 'جاهز للتوصيل' | 'تم التوصيل' | 'مرفوض';

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  dish: Dish;
  chef: Pick<User, 'id' | 'name'>;
  quantity: number;
  status: OrderStatus;
  createdAt: string; // ISO date string
  rating?: number; // Customer's rating for this specific order/dish
  review?: string; // Customer's review for this specific order/dish
};
