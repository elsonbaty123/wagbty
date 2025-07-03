
'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initialUsers, allDishes, initialOrders, initialCoupons, initialStatusReactions, initialViewedStatuses, DEFAULT_CUSTOMER_AVATAR, DEFAULT_CHEF_AVATAR, DEFAULT_DELIVERY_AVATAR } from './data';
import type { User, Dish, Order, Coupon, Notification, ChatMessage, StatusReaction, ViewedStatus, UserRole, NotDeliveredResponsibility, DishRating, OrderStatus } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_PATH = path.join(DATA_DIR, 'users.json');
const DISHES_PATH = path.join(DATA_DIR, 'dishes.json');
const ORDERS_PATH = path.join(DATA_DIR, 'orders.json');
const COUPONS_PATH = path.join(DATA_DIR, 'coupons.json');
const NOTIFICATIONS_PATH = path.join(DATA_DIR, 'notifications.json');
const CHAT_MESSAGES_PATH = path.join(DATA_DIR, 'chat_messages.json');
const STATUS_REACTIONS_PATH = path.join(DATA_DIR, 'status_reactions.json');
const VIEWED_STATUSES_PATH = path.join(DATA_DIR, 'viewed_statuses.json');
const DELIVERY_ZONES_PATH = path.join(DATA_DIR, 'delivery_zones.json');

type StoredUser = User & { hashedPassword?: string };

// Helper to read data from a file
async function readData<T>(filePath: string): Promise<T> {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as T;
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return [] as T; // File not found, return empty array
        }
        throw error;
    }
}

// Helper to write data to a file
async function writeData<T>(filePath: string, data: T): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize data if files don't exist
async function initializeData() {
    try {
        await fs.access(USERS_PATH);
    } catch {
        console.log('Initializing database files...');
        const salt = await bcrypt.genSalt(10);
        const usersWithHashedPasswords = await Promise.all(
            initialUsers.map(async (user) => {
                const { password, ...rest } = user;
                const hashedPassword = await bcrypt.hash(password!, salt);
                return { ...rest, hashedPassword };
            })
        );

        await writeData(USERS_PATH, usersWithHashedPasswords);
        await writeData(DISHES_PATH, allDishes);
        await writeData(ORDERS_PATH, initialOrders);
        await writeData(COUPONS_PATH, initialCoupons);
        await writeData(NOTIFICATIONS_PATH, []);
        await writeData(CHAT_MESSAGES_PATH, []);
        await writeData(STATUS_REACTIONS_PATH, initialStatusReactions);
        await writeData(VIEWED_STATUSES_PATH, initialViewedStatuses);
        await writeData(DELIVERY_ZONES_PATH, []);
        console.log('Database files initialized.');
    }
}

// Run initialization once on server start
initializeData();

// --- Users ---
export async function getUsers(): Promise<User[]> {
    const storedUsers = await readData<StoredUser[]>(USERS_PATH);
    return storedUsers.map(({ hashedPassword, ...user }) => user);
}

export async function loginUser(identifier: string, password: string): Promise<User> {
    const users = await readData<StoredUser[]>(USERS_PATH);
    const isEmail = identifier.includes('@');
    
    // Special case for admin login
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser && adminUser.email.toLowerCase() === identifier.toLowerCase()) {
        const isMatch = await bcrypt.compare(password, adminUser.hashedPassword!);
        if (isMatch) {
            const { hashedPassword, ...userToSet } = adminUser;
            return userToSet;
        } else {
            throw new Error('Incorrect password.');
        }
    }
    
    const targetUser = isEmail
        ? users.find(u => u.email.toLowerCase() === identifier.toLowerCase())
        : users.find(u => u.phone === identifier);

    if (!targetUser || !targetUser.hashedPassword) {
      throw new Error('Identifier not found.');
    }

    const isMatch = await bcrypt.compare(password, targetUser.hashedPassword);
    if (!isMatch) {
      throw new Error('Incorrect password.');
    }
    
    if (targetUser.accountStatus === 'pending_approval') {
        throw new Error('Your account is pending approval. You will be notified once it has been reviewed.');
    }
    if (targetUser.accountStatus === 'rejected') {
        throw new Error('Your application has been rejected. Please contact support for more information.');
    }
    if (targetUser.accountStatus === 'suspended') {
        throw new Error('Your account has been suspended. Please contact support for more information.');
    }


    const { hashedPassword, ...userToSet } = targetUser;
    return userToSet;
}

const validatePassword = (password: string) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length > 7;
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol || !isLongEnough) {
      throw new Error('Password does not meet requirements.');
    }
}

export async function signupUser(details: Partial<User> & { password: string, role: 'customer' | 'chef' }): Promise<User> {
    const users = await readData<StoredUser[]>(USERS_PATH);

    const emailExists = users.some(u => u.email.toLowerCase() === details.email!.toLowerCase());
    if (emailExists) throw new Error('Email is already in use.');

    if (details.phone) {
        const phoneExists = users.some(u => u.phone && u.phone === details.phone);
        if (phoneExists) throw new Error('Phone number is already in use.');
    }
    
    validatePassword(details.password);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(details.password, salt);
    
    const accountStatus = details.role === 'chef' ? 'pending_approval' : 'active';
    
    const newUser: StoredUser = {
        id: `user_${Date.now()}`,
        name: details.name!,
        email: details.email!,
        role: details.role,
        accountStatus: accountStatus,
        gender: details.gender,
        phone: details.phone,
        address: details.role === 'customer' ? details.address : undefined,
        deliveryZone: details.role === 'customer' ? details.deliveryZone : undefined,
        specialty: details.role === 'chef' ? details.specialty : undefined,
        bio: details.role === 'chef' ? `New chef specializing in ${details.specialty}` : undefined,
        imageUrl: details.imageUrl || (details.role === 'chef' ? DEFAULT_CHEF_AVATAR : DEFAULT_CUSTOMER_AVATAR),
        availabilityStatus: details.role === 'chef' ? 'available' : undefined,
        favoriteDishIds: details.role === 'customer' ? [] : undefined,
        hashedPassword: hashedPassword
    };
    
    const updatedUsers = [...users, newUser];
    await writeData(USERS_PATH, updatedUsers);

    const { hashedPassword: _, ...userToSet } = newUser;
    return userToSet;
}

export async function createUserByAdmin(details: Partial<User> & { password: string, role: UserRole }): Promise<User> {
    const users = await readData<StoredUser[]>(USERS_PATH);

    if (details.email) {
        const emailExists = users.some(u => u.email.toLowerCase() === details.email!.toLowerCase());
        if (emailExists) throw new Error('Email is already in use.');
    }

    if (details.phone) {
        const phoneExists = users.some(u => u.phone && u.phone === details.phone);
        if (phoneExists) throw new Error('Phone number is already in use.');
    }
    
    validatePassword(details.password);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(details.password, salt);
    
    const newUser: StoredUser = {
        id: `user_${Date.now()}`,
        name: details.name!,
        email: details.email!,
        role: details.role,
        accountStatus: 'active', // Accounts created by admin are active by default
        gender: details.gender,
        phone: details.phone,
        address: details.role === 'customer' ? details.address : undefined,
        deliveryZone: details.role === 'customer' ? details.deliveryZone : undefined,
        specialty: details.role === 'chef' ? details.specialty : undefined,
        bio: details.role === 'chef' ? `New chef specializing in ${details.specialty}` : undefined,
        imageUrl: details.imageUrl || (details.role === 'chef' ? DEFAULT_CHEF_AVATAR : details.role === 'delivery' ? DEFAULT_DELIVERY_AVATAR : DEFAULT_CUSTOMER_AVATAR),
        availabilityStatus: details.role === 'chef' ? 'available' : undefined,
        favoriteDishIds: details.role === 'customer' ? [] : undefined,
        vehicleType: details.role === 'delivery' ? details.vehicleType : undefined,
        licensePlate: details.role === 'delivery' ? details.licensePlate : undefined,
        hashedPassword: hashedPassword
    };
    
    const updatedUsers = [...users, newUser];
    await writeData(USERS_PATH, updatedUsers);

    const { hashedPassword: _, ...userToSet } = newUser;
    return userToSet;
}

export async function updateUser(userId: string, updatedDetails: Partial<User>): Promise<User> {
    const users = await readData<StoredUser[]>(USERS_PATH);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    const updatedUser = { ...users[userIndex], ...updatedDetails };
    users[userIndex] = updatedUser;
    
    await writeData(USERS_PATH, users);
    const { hashedPassword, ...userToReturn } = updatedUser;
    return userToReturn;
}

export async function changeUserPassword(userId: string, { currentPassword, newPassword, confirmPassword }: any) {
    const users = await readData<StoredUser[]>(USERS_PATH);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const storedUser = users[userIndex];
    if (!storedUser.hashedPassword) throw new Error("User has no password set.");

    const isMatch = await bcrypt.compare(currentPassword, storedUser.hashedPassword);
    if (!isMatch) throw new Error('Incorrect current password.');

    if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");
    validatePassword(newPassword);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    users[userIndex] = { ...storedUser, hashedPassword };
    await writeData(USERS_PATH, users);
}

export async function deleteUser(userId: string) {
    let users = await readData<StoredUser[]>(USERS_PATH);
    users = users.filter(u => u.id !== userId);
    await writeData(USERS_PATH, users);
}

// --- Dishes ---
export const getDishes = async (): Promise<Dish[]> => readData<Dish[]>(DISHES_PATH);
export const createDish = async (dishData: Omit<Dish, 'id' | 'ratings'>, chefId: string) => {
    const dishes = await getDishes();
    const newDish: Dish = { ...dishData, id: `dish_${Date.now()}`, ratings: [], chefId };
    await writeData(DISHES_PATH, [...dishes, newDish]);
    return newDish;
};
export const updateDish = async (dishId: string, updatedData: Partial<Dish>) => {
    let dishes = await getDishes();
    const index = dishes.findIndex(d => d.id === dishId);
    if (index === -1) throw new Error("Dish not found");
    dishes[index] = { ...dishes[index], ...updatedData };
    await writeData(DISHES_PATH, dishes);
    return dishes[index];
};
export const deleteDish = async (dishId: string) => {
    let dishes = await getDishes();
    dishes = dishes.filter(d => d.id !== dishId);
    await writeData(DISHES_PATH, dishes);
};

// --- Delivery Zones ---
export const getDeliveryZones = async (): Promise<any[]> => readData<any[]>(DELIVERY_ZONES_PATH);

export const updateDeliveryZones = async (zones: any[]) => {
    await writeData(DELIVERY_ZONES_PATH, zones);
    return zones;
};

// --- Orders ---
export const getOrders = async (): Promise<Order[]> => readData<Order[]>(ORDERS_PATH);
export const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'chef' | 'dailyDishOrderNumber'> & { chef: User }) => {
    const orders = await getOrders();
    const isChefBusy = orderData.chef.availabilityStatus === 'busy';
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todaysOrdersForDishByCustomer = orders.filter(o =>
        o.customerId === orderData.customerId &&
        o.dish.id === orderData.dish.id &&
        new Date(o.createdAt) >= startOfToday
    );

    const newOrder: Order = {
        ...orderData,
        id: `order_${Date.now()}`,
        status: isChefBusy ? 'waiting_for_chef' : 'pending_review',
        createdAt: new Date().toISOString(),
        chef: { id: orderData.chef.id, name: orderData.chef.name },
        dailyDishOrderNumber: todaysOrdersForDishByCustomer.length + 1,
    };
    await writeData(ORDERS_PATH, [newOrder, ...orders]);
    return newOrder;
}
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
    let orders = await getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error("Order not found");
    orders[index].status = status;
    await writeData(ORDERS_PATH, orders);
    return orders[index];
}
export const assignOrderToDelivery = async (orderId: string, deliveryPersonId: string, deliveryPersonName: string): Promise<Order> => {
    let orders = await getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error("Order not found");
    if (orders[index].deliveryPersonId) throw new Error("Order already assigned");

    orders[index].deliveryPersonId = deliveryPersonId;
    orders[index].deliveryPersonName = deliveryPersonName;
    await writeData(ORDERS_PATH, orders);
    return orders[index];
}

export const markOrderAsNotDelivered = async (orderId: string, details: { reason: string; responsibility: NotDeliveredResponsibility }): Promise<Order> => {
    let orders = await getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error("Order not found");
    orders[index].status = 'not_delivered';
    orders[index].notDeliveredInfo = { ...details, timestamp: new Date().toISOString() };
    await writeData(ORDERS_PATH, orders);
    return orders[index];
}

export const addReviewToOrder = async (orderId: string, reviewData: { rating: number, review?: string }): Promise<Order> => {
    let orders = await getOrders();
    let dishes = await getDishes();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");
    if (orders[orderIndex].rating) throw new Error("Order already reviewed");

    orders[orderIndex].rating = reviewData.rating;
    orders[orderIndex].review = reviewData.review;

    const dishIndex = dishes.findIndex(d => d.id === orders[orderIndex].dish.id);
    if (dishIndex !== -1) {
        const newRating: DishRating = {
            customerId: orders[orderIndex].customerId,
            customerName: orders[orderIndex].customerName,
            rating: reviewData.rating,
            review: reviewData.review,
            createdAt: new Date().toISOString(),
        };
        if (!dishes[dishIndex].ratings) dishes[dishIndex].ratings = [];
        dishes[dishIndex].ratings!.push(newRating);
    }
    
    await writeData(ORDERS_PATH, orders);
    await writeData(DISHES_PATH, dishes);
    return orders[orderIndex];
}

// --- Coupons ---
export const getCoupons = async (): Promise<Coupon[]> => readData<Coupon[]>(COUPONS_PATH);
export const createCoupon = async (couponData: Omit<Coupon, 'id'|'timesUsed'>) => {
    const coupons = await getCoupons();
    const newCoupon: Coupon = { ...couponData, id: `coupon_${Date.now()}`, timesUsed: 0 };
    await writeData(COUPONS_PATH, [newCoupon, ...coupons]);
    return newCoupon;
};
export const updateCoupon = async (couponId: string, updatedData: Partial<Coupon>) => {
    let coupons = await getCoupons();
    const index = coupons.findIndex(c => c.id === couponId);
    if (index === -1) throw new Error("Coupon not found");
    coupons[index] = { ...coupons[index], ...updatedData };
    await writeData(COUPONS_PATH, coupons);
    return coupons[index];
};

// --- Notifications ---
export const getNotifications = async (): Promise<Notification[]> => readData<Notification[]>(NOTIFICATIONS_PATH);
export const createNotification = async (data: Omit<Notification, 'id'|'createdAt'|'isRead'>) => {
    const notifications = await getNotifications();
    const newNotification: Notification = {
      ...data,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    await writeData(NOTIFICATIONS_PATH, [newNotification, ...notifications]);
};
export const markNotificationAsRead = async (notificationId: string) => {
    let notifications = await getNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
        notifications[index].isRead = true;
        await writeData(NOTIFICATIONS_PATH, notifications);
    }
};
export const markAllNotificationsAsRead = async (userId: string) => {
    let notifications = await getNotifications();
    notifications.forEach(n => {
        if (n.recipientId === userId) n.isRead = true;
    });
    await writeData(NOTIFICATIONS_PATH, notifications);
}

// --- Chat ---
export const getChatMessages = async (): Promise<ChatMessage[]> => readData<ChatMessage[]>(CHAT_MESSAGES_PATH);
export const createChatMessage = async (data: Omit<ChatMessage, 'id'|'createdAt'>) => {
    const messages = await getChatMessages();
    const newMessage: ChatMessage = {
        ...data,
        id: `msg_${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    await writeData(CHAT_MESSAGES_PATH, [...messages, newMessage]);
}

// --- Status ---
export const getStatusReactions = async (): Promise<StatusReaction[]> => readData<StatusReaction[]>(STATUS_REACTIONS_PATH);
export const createStatusReaction = async (data: Omit<StatusReaction, 'id'|'createdAt'>) => {
    const reactions = await getStatusReactions();
    const newReaction: StatusReaction = {
        ...data,
        id: `reaction_${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    await writeData(STATUS_REACTIONS_PATH, [newReaction, ...reactions]);
};

export const getViewedStatuses = async (): Promise<ViewedStatus[]> => readData<ViewedStatus[]>(VIEWED_STATUSES_PATH);
export const createViewedStatus = async (data: Omit<ViewedStatus, 'id'|'createdAt'>) => {
    const views = await getViewedStatuses();
    const newView: ViewedStatus = {
        ...data,
        id: `view_${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    await writeData(VIEWED_STATUSES_PATH, [...views, newView]);
};
