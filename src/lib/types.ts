
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
  address?: string;
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
  rating?: number;
  review?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  appliedCouponCode?: string;
};

export type DiscountType = 'percentage' | 'fixed';

export type Coupon = {
  id: string;
  chefId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string; // ISO String
  endDate: string; // ISO String
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
};
