
import type { Dish, Order, Coupon, User } from '@/lib/types';

// The application will now start with pre-defined data for local storage.
// This data will be used to seed the database if it's empty.

// Note: All initial passwords are 'Password123!'
export const initialUsers: (User & { hashedPassword?: string })[] = [];

export const allDishes: Dish[] = [];

export const initialOrders: Order[] = [];

export const initialCoupons: Coupon[] = [];
