
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { Order, Dish, DishRating, Coupon, User } from '@/lib/types';
import { useNotifications } from './notification-context';
import { useTranslation } from 'react-i18next';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, Timestamp, query, where } from 'firebase/firestore';

type OrderStatus = Order['status'];
type CreateOrderPayload = Omit<Order, 'id' | 'status' | 'createdAt' | 'chef'> & {
  chef: User;
};

interface OrderContextType {
  orders: Order[];
  dishes: Dish[];
  coupons: Coupon[];
  loading: boolean;
  getOrdersByCustomerId: (customerId: string) => Order[];
  getOrdersByChefId: (chefId: string) => Order[];
  createOrder: (orderData: CreateOrderPayload) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addDish: (dishData: Omit<Dish, 'id' | 'ratings'>) => Promise<void>;
  updateDish: (dishData: Dish) => Promise<void>;
  deleteDish: (dishId: string) => Promise<void>;
  addReviewToOrder: (orderId: string, rating: number, review: string) => Promise<void>;
  getCouponsByChefId: (chefId: string) => Coupon[];
  createCoupon: (couponData: Omit<Coupon, 'id' | 'timesUsed'>) => Promise<void>;
  updateCoupon: (couponData: Coupon) => Promise<void>;
  validateAndApplyCoupon: (code: string, chefId: string, dishId: string, subtotal: number) => { discount: number; error?: string };
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const parseDoc = (doc: any) => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        startDate: data.startDate instanceof Timestamp ? data.startDate.toDate().toISOString() : data.startDate,
        endDate: data.endDate instanceof Timestamp ? data.endDate.toDate().toISOString() : data.endDate,
        ratings: data.ratings?.map((r: any) => ({
            ...r,
            createdAt: r.createdAt instanceof Timestamp ? r.createdAt.toDate().toISOString() : r.createdAt,
        }))
    };
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { createNotification } = useNotifications();
  const { t } = useTranslation();

  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    }

    const fetchData = async () => {
      try {
        const ordersQuery = query(collection(db, 'orders'));
        const dishesQuery = query(collection(db, 'dishes'));
        const couponsQuery = query(collection(db, 'coupons'));

        const [ordersSnapshot, dishesSnapshot, couponsSnapshot] = await Promise.all([
          getDocs(ordersQuery),
          getDocs(dishesQuery),
          getDocs(couponsQuery),
        ]);

        setOrders(ordersSnapshot.docs.map(parseDoc));
        setDishes(dishesSnapshot.docs.map(parseDoc));
        setCoupons(couponsSnapshot.docs.map(parseDoc));

      } catch (error) {
        console.error("Failed to fetch data from Firestore", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getOrdersByCustomerId = (customerId: string) => {
    return orders.filter((order) => order.customerId === customerId);
  };

  const getOrdersByChefId = (chefId: string) => {
    return orders.filter((order) => order.chef.id === chefId);
  };

  const createOrder = async (orderData: CreateOrderPayload) => {
    if (!db) throw new Error("Firebase is not configured.");
    const isChefBusy = orderData.chef.availabilityStatus === 'busy';
    const newOrderData = {
        ...orderData,
        status: isChefBusy ? 'waiting_for_chef' : 'pending_review',
        createdAt: serverTimestamp(),
        chef: { id: orderData.chef.id, name: orderData.chef.name },
    };

    const docRef = await addDoc(collection(db, 'orders'), newOrderData);
    const newOrder = { ...newOrderData, id: docRef.id, createdAt: new Date().toISOString() } as Order;
    setOrders(prev => [newOrder, ...prev]);

    if (orderData.appliedCouponCode) {
        const coupon = coupons.find(c => c.code.toLowerCase() === orderData.appliedCouponCode!.toLowerCase());
        if (coupon) {
            const couponDocRef = doc(db, 'coupons', coupon.id);
            await updateDoc(couponDocRef, {
                timesUsed: coupon.timesUsed + 1
            });
            setCoupons(prev => prev.map(c => c.id === coupon.id ? {...c, timesUsed: c.timesUsed + 1} : c));
        }
    }

    if (isChefBusy) {
        createNotification({
            recipientId: orderData.customerId,
            titleKey: 'order_waitlisted_notification_title',
            messageKey: 'order_waitlisted_notification_desc',
            params: { dishName: orderData.dish.name },
            link: '/profile',
        });
        createNotification({
            recipientId: orderData.chef.id,
            titleKey: 'new_waitlisted_order_notification_title',
            messageKey: 'new_waitlisted_order_notification_desc',
            params: { customerName: orderData.customerName },
            link: '/chef/dashboard',
        });
    } else {
        createNotification({
          recipientId: orderData.chef.id,
          titleKey: 'new_order_notification_title',
          messageKey: 'new_order_notification_desc',
          params: { dishName: orderData.dish.name, customerName: orderData.customerName },
          link: '/chef/dashboard',
        });
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!db) throw new Error("Firebase is not configured.");
    const orderDocRef = doc(db, 'orders', orderId);
    await updateDoc(orderDocRef, { status });

    const updatedOrder = orders.find(o => o.id === orderId);
    if (updatedOrder) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

      const { customerId, dish: { name: dishName } } = updatedOrder;
      const notifications: {[key: string]: {titleKey: string, messageKey: string}} = {
        preparing: { titleKey: 'order_confirmed_notification_title', messageKey: 'order_confirmed_notification_desc' },
        ready_for_delivery: { titleKey: 'order_ready_notification_title', messageKey: 'order_ready_notification_desc' },
        out_for_delivery: { titleKey: 'order_on_the_way_notification_title', messageKey: 'order_on_the_way_notification_desc' },
        delivered: { titleKey: 'order_delivered_notification_title', messageKey: 'order_delivered_notification_desc' },
        rejected: { titleKey: 'order_rejected_notification_title', messageKey: 'order_rejected_notification_desc' }
      };

      if (notifications[status]) {
          createNotification({
              recipientId: customerId,
              titleKey: notifications[status].titleKey,
              messageKey: notifications[status].messageKey,
              params: { dishName },
              link: '/profile',
          });
      }
    }
  };
    
  const addDish = async (dishData: Omit<Dish, 'id' | 'ratings'>) => {
    if (!db) throw new Error("Firebase is not configured.");
    const newDishData = { ...dishData, ratings: [] };
    const docRef = await addDoc(collection(db, 'dishes'), newDishData);
    setDishes(prev => [{ ...newDishData, id: docRef.id }, ...prev]);
  };

  const updateDish = async (updatedDish: Dish) => {
    if (!db) throw new Error("Firebase is not configured.");
    const { id, ...dishData } = updatedDish;
    const dishDocRef = doc(db, 'dishes', id);
    await updateDoc(dishDocRef, dishData);
    setDishes(prev => prev.map(d => d.id === id ? updatedDish : d));
  };

  const deleteDish = async (dishId: string) => {
    if (!db) throw new Error("Firebase is not configured.");
    const dishDocRef = doc(db, 'dishes', dishId);
    await deleteDoc(dishDocRef);
    setDishes(prev => prev.filter(d => d.id !== dishId));
  };
  
  const addReviewToOrder = async (orderId: string, rating: number, review: string) => {
    if (!db) throw new Error("Firebase is not configured.");
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const orderDocRef = doc(db, 'orders', orderId);
    await updateDoc(orderDocRef, { rating, review });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, rating, review } : o));

    const newRating: DishRating = {
        customerName: orderToUpdate.customerName,
        rating,
        review,
        createdAt: new Date().toISOString(),
    };

    const dishToUpdate = dishes.find(d => d.id === orderToUpdate.dish.id);
    if(dishToUpdate) {
        const dishDocRef = doc(db, 'dishes', dishToUpdate.id);
        const updatedRatings = [...(dishToUpdate.ratings || []), newRating];
        await updateDoc(dishDocRef, { ratings: updatedRatings });
        setDishes(prev => prev.map(d => d.id === dishToUpdate.id ? { ...d, ratings: updatedRatings } : d));
    }
  };

  const getCouponsByChefId = (chefId: string) => {
    return coupons.filter(c => c.chefId === chefId).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  };

  const createCoupon = async (couponData: Omit<Coupon, 'id' | 'timesUsed'>) => {
    if (!db) throw new Error("Firebase is not configured.");
    const newCouponData = { ...couponData, timesUsed: 0 };
    const docRef = await addDoc(collection(db, 'coupons'), newCouponData);
    setCoupons(prev => [{ ...newCouponData, id: docRef.id }, ...prev]);
  };

  const updateCoupon = async (updatedCoupon: Coupon) => {
    if (!db) throw new Error("Firebase is not configured.");
    const { id, ...couponData } = updatedCoupon;
    const couponDocRef = doc(db, 'coupons', id);
    await updateDoc(couponDocRef, couponData);
    setCoupons(prev => prev.map(c => c.id === id ? updatedCoupon : c));
  };

  const validateAndApplyCoupon = (code: string, chefId: string, dishId: string, subtotal: number): { discount: number; error?: string } => {
    const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase() && c.chefId === chefId);

    if (!coupon) return { discount: 0, error: t('coupon_invalid_error') };
    if (!coupon.isActive) return { discount: 0, error: t('coupon_inactive_error') };
    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) return { discount: 0, error: t('coupon_expired_error') };
    if (coupon.timesUsed >= coupon.usageLimit) return { discount: 0, error: t('coupon_limit_reached_error') };
    if (coupon.appliesTo === 'specific' && (!coupon.applicableDishIds || !coupon.applicableDishIds.includes(dishId))) return { discount: 0, error: t('coupon_not_applicable_error') };

    let discount = coupon.discountType === 'fixed' ? coupon.discountValue : subtotal * (coupon.discountValue / 100);
    return { discount: Math.min(discount, subtotal) };
  };

  return (
    <OrderContext.Provider value={{ orders, dishes, coupons, loading, getOrdersByCustomerId, getOrdersByChefId, createOrder, updateOrderStatus, addDish, updateDish, deleteDish, addReviewToOrder, getCouponsByChefId, createCoupon, updateCoupon, validateAndApplyCoupon }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
