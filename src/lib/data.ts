

import type { Dish, Order, Coupon, User, StatusReaction, ViewedStatus } from '@/lib/types';
import bcrypt from 'bcryptjs';

// The application will now start with pre-defined data for local storage.
// This data will be used to seed the database if it's empty.

export const DEFAULT_CHEF_AVATAR = `data:image/svg+xml,%3csvg width='100px' height='125px' viewBox='0 0 100 125' xmlns='http://www.w3.org/2000/svg'%3e%3cg stroke='%23ff7043' stroke-width='8' fill='none' fill-rule='evenodd' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M75,50 H25'/%3e%3cpath d='M25,25 C25,10 50,10 50,25 C50,10 75,10 75,25 C90,25 90,50 75,50'/%3e%3cpath d='M25,25 C10,25 10,50 25,50'/%3e%3cpath d='M30,60 A20,20 0,0,0 70,60'/%3e%3cpath d='M40,80 C25,100 50,100 50,80'/%3e%3cpath d='M60,80 C75,100 50,100 50,80'/%3e%3c/g%3e%3c/svg%3e`;
export const DEFAULT_CUSTOMER_AVATAR = `data:image/svg+xml,%3csvg width='100px' height='100px' viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg' color='%23cccccc'%3e%3cpath d='M12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2Z' /%3e%3cpath d='M20.5858 20.3463C20.0336 18.8433 18.8872 17.6186 17.3916 16.9142C15.8959 16.2098 14.1611 15.75 12 15.75C9.83889 15.75 8.10406 16.2098 6.60843 16.9142C5.11281 17.6186 3.96644 18.8433 3.41421 20.3463C3.31596 20.6401 3.56116 20.9412 3.87673 20.9412H20.1233C20.4388 20.9412 20.684 20.6401 20.5858 20.3463Z' /%3e%3c/svg%3e`;
export const DEFAULT_ADMIN_AVATAR = `data:image/svg+xml,%3csvg width='100px' height='100px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z' stroke='%23ffc107' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z' stroke='%23ffc107' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`;
export const DEFAULT_DELIVERY_AVATAR = `data:image/svg+xml,%3csvg width='100px' height='100px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' color='%23cccccc'%3e%3cpath d='M2.378
 8.368l2.3-5.75a2 2 0 011.848-1.318h9.948a2 2 0 011.848 1.318l2.3 5.75' stroke='currentColor' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M21 17.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-11 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' stroke='currentColor' stroke-width='1.5'/%3e%3cpath d='M3 17.5H5m5 0h6m5 0h-2M5 17.5l-1.5-4.5h-1M21.5 13H18l-1-4.5h4.5v4.5z' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`;

export const deliveryZones = [
  { name: 'Nasr City', fee: 30 },
  { name: 'Heliopolis', fee: 35 },
  { name: 'Maadi', fee: 40 },
  { name: 'Zamalek', fee: 45 },
  { name: 'New Cairo', fee: 50 },
  { name: '6th of October City', fee: 60 },
  { name: 'Alexandria', fee: 80 },
];

// Note: All initial passwords are 'Password123!', admin password is 'AdminPassword123!'
const salt = bcrypt.genSaltSync(10);

export const initialUsers: (User & { hashedPassword?: string })[] = [
  // Admin
  {
    id: 'admin_1',
    name: 'Admin',
    email: 'admin@chef.com',
    role: 'admin',
    accountStatus: 'active',
    gender: 'male',
    imageUrl: DEFAULT_ADMIN_AVATAR,
    hashedPassword: bcrypt.hashSync('AdminPassword123!', salt),
  },
  // Customers
  {
    id: 'customer_1',
    name: 'John Doe',
    email: 'john@customer.com',
    role: 'customer',
    accountStatus: 'active',
    gender: 'male',
    phone: '01112223334',
    address: '123 Foodie Lane, Cairo, Egypt',
    deliveryZone: 'Nasr City',
    imageUrl: DEFAULT_CUSTOMER_AVATAR,
    favoriteDishIds: [],
    hashedPassword: bcrypt.hashSync('Password123!', salt),
  },
  {
    id: 'customer_2',
    name: 'Jane Smith',
    email: 'jane@customer.com',
    role: 'customer',
    accountStatus: 'active',
    gender: 'female',
    phone: '01112223335',
    address: '456 Culinary Street, Giza, Egypt',
    deliveryZone: 'Heliopolis',
    imageUrl: DEFAULT_CUSTOMER_AVATAR,
    favoriteDishIds: [],
    hashedPassword: bcrypt.hashSync('Password123!', salt),
  },
  {
    id: 'customer_3',
    name: 'Ahmed Khan',
    email: 'ahmed@customer.com',
    role: 'customer',
    accountStatus: 'active',
    gender: 'male',
    phone: '01112223336',
    address: '789 Gourmet Avenue, Alexandria, Egypt',
    deliveryZone: 'Alexandria',
    imageUrl: DEFAULT_CUSTOMER_AVATAR,
    favoriteDishIds: [],
    hashedPassword: bcrypt.hashSync('Password123!', salt),
  },
  {
    id: 'customer_4',
    name: 'Fatima Al-Ali',
    email: 'fatima@customer.com',
    role: 'customer',
    accountStatus: 'active',
    gender: 'female',
    phone: '01112223337',
    address: '101 Flavor Town, Luxor, Egypt',
    deliveryZone: 'Maadi',
    imageUrl: DEFAULT_CUSTOMER_AVATAR,
    favoriteDishIds: [],
    hashedPassword: bcrypt.hashSync('Password123!', salt),
  },
  // Delivery
  {
    id: 'delivery_1',
    name: 'Ali Hassan',
    email: 'ali@delivery.com',
    role: 'delivery',
    accountStatus: 'active',
    gender: 'male',
    phone: '01555555555',
    vehicleType: 'Motorcycle',
    licensePlate: 'Cairo 1234',
    imageUrl: DEFAULT_DELIVERY_AVATAR,
    hashedPassword: bcrypt.hashSync('Password123!', salt),
  },
];

export const allDishes: Dish[] = [];

export const initialOrders: Order[] = [];

export const initialCoupons: Coupon[] = [];

export const initialStatusReactions: StatusReaction[] = [];
export const initialViewedStatuses: ViewedStatus[] = [];
