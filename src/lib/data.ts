

import type { Dish, Order, Coupon, User, StatusReaction, ViewedStatus } from '@/lib/types';
import bcrypt from 'bcryptjs';

// The application will now start with pre-defined data for local storage.
// This data will be used to seed the database if it's empty.

export const DEFAULT_CHEF_AVATAR = `data:image/svg+xml,%3csvg width='100px' height='125px' viewBox='0 0 100 125' xmlns='http://www.w3.org/2000/svg'%3e%3cg stroke='%23ff7043' stroke-width='8' fill='none' fill-rule='evenodd' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M75,50 H25'/%3e%3cpath d='M25,25 C25,10 50,10 50,25 C50,10 75,10 75,25 C90,25 90,50 75,50'/%3e%3cpath d='M25,25 C10,25 10,50 25,50'/%3e%3cpath d='M30,60 A20,20 0,0,0 70,60'/%3e%3cpath d='M40,80 C25,100 50,100 50,80'/%3e%3cpath d='M60,80 C75,100 50,100 50,80'/%3e%3c/g%3e%3c/svg%3e`;
export const DEFAULT_CUSTOMER_AVATAR = `data:image/svg+xml,%3csvg width='100px' height='100px' viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg' color='%23cccccc'%3e%3cpath d='M12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2Z' /%3e%3cpath d='M20.5858 20.3463C20.0336 18.8433 18.8872 17.6186 17.3916 16.9142C15.8959 16.2098 14.1611 15.75 12 15.75C9.83889 15.75 8.10406 16.2098 6.60843 16.9142C5.11281 17.6186 3.96644 18.8433 3.41421 20.3463C3.31596 20.6401 3.56116 20.9412 3.87673 20.9412H20.1233C20.4388 20.9412 20.684 20.6401 20.5858 20.3463Z' /%3e%3c/svg%3e`;
export const DEFAULT_ADMIN_AVATAR = `data:image/svg+xml,%3csvg width='100px' height='100px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z' stroke='%23ffc107' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3e%3cpath d='M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z' stroke='%23ffc107' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`;
export const DEFAULT_DELIVERY_AVATAR = `data:image/svg+xml,%3csvg width='100px' height='100px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' color='%23cccccc'%3e%3cpath d='M2.378
 8.368l2.3-5.75a2 2 0 011.848-1.318h9.948a2 2 0 011.848 1.318l2.3 5.75' stroke='currentColor' stroke-width='1.5' stroke-linecap='round'/%3e%3cpath d='M21 17.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-11 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' stroke='currentColor' stroke-width='1.5'/%3e%3cpath d='M3 17.5H5m5 0h6m5 0h-2M5 17.5l-1.5-4.5h-1M21.5 13H18l-1-4.5h4.5v4.5z' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e`;


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
  // Chefs
  {
    id: 'chef_1',
    name: 'Gordon Ramsay',
    email: 'gordon@chef.com',
    role: 'chef',
    accountStatus: 'active',
    gender: 'male',
    phone: '01234567890',
    specialty: 'Fine Dining',
    bio: 'World-renowned chef known for his exquisite dishes and fiery passion for cooking. Expect nothing but perfection.',
    availabilityStatus: 'available',
    imageUrl: DEFAULT_CHEF_AVATAR,
    hashedPassword: bcrypt.hashSync('Password123!', salt),
  },
  {
    id: 'chef_2',
    name: 'Nigella Lawson',
    email: 'nigella@chef.com',
    role: 'chef',
    accountStatus: 'active',
    gender: 'female',
    phone: '01234567891',
    specialty: 'Comfort Food',
    bio: 'Home-style cooking with a touch of elegance. My dishes are a warm hug on a plate.',
    availabilityStatus: 'busy',
    imageUrl: DEFAULT_CHEF_AVATAR,
    hashedPassword: bcrypt.hashSync('Password123!', salt),
  },
  {
    id: 'chef_3',
    name: 'Jamie Oliver',
    email: 'jamie@chef.com',
    role: 'chef',
    accountStatus: 'active',
    gender: 'male',
    phone: '01234567892',
    specialty: 'Italian Cuisine',
    bio: 'Simple, fresh, and honest food that brings people together. Pucka!',
    availabilityStatus: 'available',
    imageUrl: DEFAULT_CHEF_AVATAR,
    hashedPassword: bcrypt.hashSync('Password123!', salt),
  },
  {
    id: 'chef_4',
    name: 'Massimo Bottura',
    email: 'massimo@chef.com',
    role: 'chef',
    accountStatus: 'active',
    gender: 'male',
    phone: '01234567893',
    specialty: 'Modern Italian',
    bio: 'Tradition seen from ten kilometers away. Reimagining Italian classics with a contemporary twist.',
    availabilityStatus: 'closed',
    imageUrl: DEFAULT_CHEF_AVATAR,
    hashedPassword: bcrypt.hashSync('Password123!', salt),
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
    imageUrl: DEFAULT_CUSTOMER_AVATAR,
    favoriteDishIds: ['dish_1', 'dish_3'],
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
    imageUrl: DEFAULT_CUSTOMER_AVATAR,
    favoriteDishIds: ['dish_5'],
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

export const allDishes: Dish[] = [
  {
    id: 'dish_1',
    chefId: 'chef_1',
    name: 'Beef Wellington',
    description: 'A stunning centerpiece dish of tender beef fillet coated in pâté and duxelles, wrapped in puff pastry.',
    price: 350.00,
    imageUrl: 'https://placehold.co/800x450.png',
    ingredients: ['Beef Fillet', 'Puff Pastry', 'Mushroom Duxelles', 'Prosciutto', 'English Mustard'],
    prepTime: 90,
    category: 'Main Course',
    status: 'available',
    ratings: [
      { customerId: 'customer_1', customerName: 'John Doe', rating: 5, review: 'Absolutely divine! The best Wellington I have ever had.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { customerId: 'customer_2', customerName: 'Jane Smith', rating: 4, review: 'Very good, though the pastry could have been a bit crispier.', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  },
  {
    id: 'dish_2',
    chefId: 'chef_2',
    name: 'Chocolate Lava Cakes',
    description: 'Indulgent and decadent individual chocolate cakes with a molten, gooey center.',
    price: 120.00,
    imageUrl: 'https://placehold.co/800x450.png',
    ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour'],
    prepTime: 25,
    category: 'Dessert',
    status: 'available',
    ratings: [
       { customerId: 'customer_3', customerName: 'Ahmed Khan', rating: 5, review: 'Perfectly executed, a chocolate lover\'s dream!', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  },
  {
    id: 'dish_3',
    chefId: 'chef_3',
    name: 'Pukka Pasta Carbonara',
    description: 'A classic Roman pasta dish made with eggs, hard cheese, cured pork, and black pepper. Simple and delicious.',
    price: 180.00,
    imageUrl: 'https://placehold.co/800x450.png',
    ingredients: ['Spaghetti', 'Guanciale', 'Pecorino Romano', 'Eggs', 'Black Pepper'],
    prepTime: 20,
    category: 'Pasta',
    status: 'available',
    ratings: [
       { customerId: 'customer_4', customerName: 'Fatima Al-Ali', rating: 5, review: 'Authentic and incredibly flavorful. Jamie never disappoints!', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
       { customerId: 'customer_1', customerName: 'John Doe', rating: 4, review: 'Really tasty and quick!', createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  },
  {
    id: 'dish_4',
    chefId: 'chef_4',
    name: 'The Five Ages of Parmigiano Reggiano',
    description: 'A unique tasting experience showcasing Parmigiano Reggiano at five different stages of maturation, each with a different texture and temperature.',
    price: 450.00,
    imageUrl: 'https://placehold.co/800x450.png',
    ingredients: ['Parmigiano Reggiano (24, 30, 36, 40, 50 months)', 'Demi-soufflé', 'Galette', 'Air', 'Foam'],
    prepTime: 45,
    category: 'Appetizer',
    status: 'unavailable',
    ratings: []
  },
   {
    id: 'dish_5',
    chefId: 'chef_1',
    name: 'Scallop Risotto',
    description: 'Creamy Arborio rice risotto with perfectly seared scallops and a hint of lemon and parsley.',
    price: 280.00,
    imageUrl: 'https://placehold.co/800x450.png',
    ingredients: ['Arborio Rice', 'Scallops', 'White Wine', 'Parmesan', 'Lemon'],
    prepTime: 40,
    category: 'Main Course',
    status: 'available',
    ratings: [
      { customerId: 'customer_3', customerName: 'Ahmed Khan', rating: 5, review: 'The scallops were cooked to perfection. A truly masterful dish.', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  },
  {
    id: 'dish_6',
    chefId: 'chef_3',
    name: '15-Minute Veggie Gnocchi',
    description: 'Soft potato gnocchi with a vibrant green pesto, cherry tomatoes, and fresh mozzarella. Quick, easy, and full of flavour.',
    price: 150.00,
    imageUrl: 'https://placehold.co/800x450.png',
    ingredients: ['Potato Gnocchi', 'Pesto', 'Cherry Tomatoes', 'Mozzarella', 'Basil'],
    status: 'hidden',
    ratings: [
      { customerId: 'customer_2', customerName: 'Jane Smith', rating: 4, review: 'A fantastic vegetarian option. So quick and satisfying!', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  }
];

export const initialOrders: Order[] = [
  {
    id: 'order_1',
    customerId: 'customer_1',
    customerName: 'John Doe',
    customerPhone: '01112223334',
    deliveryAddress: '123 Foodie Lane, Cairo, Egypt',
    dish: allDishes[2],
    chef: { id: 'chef_3', name: 'Jamie Oliver' },
    quantity: 2,
    status: 'delivered',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 5,
    review: 'Super fast delivery and the pasta was amazing!',
    subtotal: 360.00,
    deliveryFee: 50.00,
    discount: 0,
    total: 410.00,
  },
  {
    id: 'order_2',
    customerId: 'customer_2',
    customerName: 'Jane Smith',
    customerPhone: '01112223335',
    deliveryAddress: '456 Culinary Street, Giza, Egypt',
    dish: allDishes[0],
    chef: { id: 'chef_1', name: 'Gordon Ramsay' },
    quantity: 1,
    status: 'preparing',
    createdAt: new Date().toISOString(),
    subtotal: 350.00,
    deliveryFee: 50.00,
    discount: 35.00,
    appliedCouponCode: 'SAVE10',
    total: 365.00,
  },
];

export const initialCoupons: Coupon[] = [
  {
    id: 'coupon_1',
    chefId: 'chef_1',
    code: 'SAVE10',
    discountType: 'percentage',
    discountValue: 10,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 100,
    timesUsed: 5,
    isActive: true,
    appliesTo: 'all',
  },
  {
    id: 'coupon_2',
    chefId: 'chef_3',
    code: 'PASTA50',
    discountType: 'fixed',
    discountValue: 50,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 20,
    timesUsed: 15,
    isActive: true,
    appliesTo: 'specific',
    applicableDishIds: ['dish_3'],
  },
];

export const initialStatusReactions: StatusReaction[] = [];
export const initialViewedStatuses: ViewedStatus[] = [];
