
export type DishStatus = 'متوفرة' | 'غير متوفرة' | 'مخفية';

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
};

export type UserRole = 'customer' | 'chef';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  // Chef-specific properties
  specialty?: string;
  bio?: string;
  imageUrl?: string;
  rating?: number;
}

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  dish: Dish;
  chef: Pick<User, 'id' | 'name'>;
  quantity: number;
  status: 'قيد الانتظار' | 'مؤكد' | 'مرفوض' | 'تم التوصيل';
};
