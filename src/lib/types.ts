

export type DishStatus = 'available' | 'unavailable' | 'hidden';

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
  ratings?: DishRating[];
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
  availabilityStatus?: 'available' | 'busy' | 'closed';
}

export type OrderStatus = 'pending_review' | 'preparing' | 'ready_for_delivery' | 'out_for_delivery' | 'delivered' | 'rejected' | 'waiting_for_chef';

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
  appliesTo: 'all' | 'specific';
  applicableDishIds?: string[];
};

export type Notification = {
  id: string;
  recipientId: string; // ID of the user (customer or chef) who should receive this
  titleKey: string;
  messageKey: string;
  params?: Record<string, string | number>;
  link: string; // URL to navigate to when clicked
  createdAt: string; // ISO date string
  isRead: boolean;
};

export type ChatMessage = {
  id: string;
  userId: string;
  userName: string;
  userImageUrl?: string;
  text: string;
  createdAt: string; // ISO String
};
