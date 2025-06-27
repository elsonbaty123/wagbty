
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { Order, Dish, DishRating, Coupon, User } from '@/lib/types';
import { useNotifications } from './notification-context';
import { useTranslation } from 'react-i18next';
import { initialOrders, allDishes, initialCoupons } from '@/lib/data';
import localforage from 'localforage';

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

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { createNotification } = useNotifications();
  const { t } = useTranslation();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [storedOrders, storedDishes, storedCoupons] = await Promise.all([
          localforage.getItem<Order[]>('orders'),
          localforage.getItem<Dish[]>('dishes'),
          localforage.getItem<Coupon[]>('coupons'),
        ]);

        setOrders(storedOrders || initialOrders);
        setDishes(storedDishes || allDishes);
        setCoupons(storedCoupons || initialCoupons);

      } catch (error) {
        console.error("Failed to load data from localforage", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Persist data to localforage whenever it changes
  useEffect(() => { if (!loading) localforage.setItem('orders', orders); }, [orders, loading]);
  useEffect(() => { if (!loading) localforage.setItem('dishes', dishes); }, [dishes, loading]);
  useEffect(() => { if (!loading) localforage.setItem('coupons', coupons); }, [coupons, loading]);

  const getOrdersByCustomerId = (customerId: string) => {
    return orders.filter((order) => order.customerId === customerId);
  };

  const getOrdersByChefId = (chefId: string) => {
    return orders.filter((order) => order.chef.id === chefId);
  };

  const createOrder = async (orderData: CreateOrderPayload) => {
    const isChefBusy = orderData.chef.availabilityStatus === 'busy';
    
    const newOrder: Order = {
        ...orderData,
        id: `order_${Date.now()}`,
        status: isChefBusy ? 'waiting_for_chef' : 'pending_review',
        createdAt: new Date().toISOString(),
        chef: { id: orderData.chef.id, name: orderData.chef.name },
    };

    setOrders(prev => [newOrder, ...prev]);

    if (orderData.appliedCouponCode) {
        const coupon = coupons.find(c => c.code.toLowerCase() === orderData.appliedCouponCode!.toLowerCase());
        if (coupon) {
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
    const newDish: Dish = { ...dishData, id: `dish_${Date.now()}`, ratings: [] };
    setDishes(prev => [newDish, ...prev]);
  };

  const updateDish = async (updatedDish: Dish) => {
    setDishes(prev => prev.map(d => d.id === updatedDish.id ? updatedDish : d));
  };

  const deleteDish = async (dishId: string) => {
    setDishes(prev => prev.filter(d => d.id !== dishId));
  };
  
  const addReviewToOrder = async (orderId: string, rating: number, review: string) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, rating, review } : o));

    const newRating: DishRating = {
        customerName: orderToUpdate.customerName,
        rating,
        review,
        createdAt: new Date().toISOString(),
    };

    const dishToUpdate = dishes.find(d => d.id === orderToUpdate.dish.id);
    if(dishToUpdate) {
        const updatedRatings = [...(dishToUpdate.ratings || []), newRating];
        setDishes(prev => prev.map(d => d.id === dishToUpdate.id ? { ...d, ratings: updatedRatings } : d));
    }
  };

  const getCouponsByChefId = (chefId: string) => {
    return coupons.filter(c => c.chefId === chefId).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  };

  const createCoupon = async (couponData: Omit<Coupon, 'id' | 'timesUsed'>) => {
    const newCoupon: Coupon = { ...couponData, id: `coupon_${Date.now()}`, timesUsed: 0 };
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const updateCoupon = async (updatedCoupon: Coupon) => {
    setCoupons(prev => prev.map(c => c.id === updatedCoupon.id ? updatedCoupon : c));
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
