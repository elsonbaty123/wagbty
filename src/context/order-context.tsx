
'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { Order, Dish, DishRating, Coupon, User, OrderStatus, NotDeliveredResponsibility } from '@/lib/types';
import { useNotifications } from './notification-context';
import { useTranslation } from 'react-i18next';
import * as db from '@/lib/db';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';

type CreateOrderPayload = Omit<Order, 'id' | 'status' | 'createdAt' | 'chef' | 'dailyDishOrderNumber'> & {
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
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  assignOrderToDelivery: (orderId: string) => Promise<void>;
  markOrderAsNotDelivered: (orderId: string, details: { reason: string; responsibility: NotDeliveredResponsibility }) => Promise<void>;
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
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  const refreshData = async () => {
    const [freshOrders, freshDishes, freshCoupons] = await Promise.all([
        db.getOrders(),
        db.getDishes(),
        db.getCoupons(),
    ]);
    setOrders(freshOrders);
    setDishes(freshDishes);
    setCoupons(freshCoupons);
    return { freshOrders, freshDishes, freshCoupons };
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await refreshData();
      } catch (error) {
        console.error("Failed to load data from db", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getOrdersByCustomerId = (customerId: string) => {
    return orders.filter((order) => order.customerId === customerId);
  };

  const getOrdersByChefId = (chefId: string) => {
    return orders.filter((order) => order.chef.id === chefId);
  };

  const createOrder = async (orderData: CreateOrderPayload) => {
    await db.createOrder(orderData);
    const { freshOrders, freshCoupons } = await refreshData();

    if (orderData.appliedCouponCode) {
        const coupon = freshCoupons.find(c => c.code.toLowerCase() === orderData.appliedCouponCode!.toLowerCase());
        if (coupon) {
            await db.updateCoupon(coupon.id, {...coupon, timesUsed: coupon.timesUsed + 1});
            await refreshData();
        }
    }

    const isChefBusy = orderData.chef.availabilityStatus === 'busy';

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
            link: '/chef/orders',
        });
    } else {
        createNotification({
          recipientId: orderData.chef.id,
          titleKey: 'new_order_notification_title',
          messageKey: 'new_order_notification_desc',
          params: { dishName: orderData.dish.name, customerName: orderData.customerName },
          link: '/chef/orders',
        });
    }
  };

  const assignOrderToDelivery = async (orderId: string) => {
    if (!user || user.role !== 'delivery') return;
    try {
        const updatedOrder = await db.assignOrderToDelivery(orderId, user.id, user.name);
        await refreshData();
        
        toast({
            title: t('order_accepted_for_delivery', 'Order Accepted for Delivery'),
            description: t('order_accepted_for_delivery_desc', { id: orderId.slice(-6) }),
        });

        createNotification({
            recipientId: updatedOrder.customerId,
            titleKey: 'delivery_driver_assigned_title',
            messageKey: 'delivery_driver_assigned_desc',
            params: { driverName: user.name },
            link: '/profile',
        });

        createNotification({
            recipientId: updatedOrder.chef.id,
            titleKey: 'driver_assigned_for_order_title',
            messageKey: 'driver_assigned_for_order_desc',
            params: { driverName: user.name, orderId: updatedOrder.id.slice(-6) },
            link: '/chef/orders',
        });
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: t('order_unavailable_title', 'Order No Longer Available'),
            description: error.message || t('order_unavailable_desc', 'This order was just accepted by another driver.'),
        });
        await refreshData();
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updatedOrder = await db.updateOrderStatus(orderId, status);
    if (updatedOrder) {
      await refreshData();

      const { customerId, chef, dish: { name: dishName } } = updatedOrder;
      
      const notifications: Partial<Record<OrderStatus, {titleKey: string, messageKey: string, link: string}>> = {
        preparing: { titleKey: 'order_confirmed_notification_title', messageKey: 'order_confirmed_notification_desc', link: '/profile' },
        out_for_delivery: { titleKey: 'order_on_the_way_notification_title', messageKey: 'order_on_the_way_notification_desc', link: '/profile' },
        delivered: { titleKey: 'order_delivered_notification_title', messageKey: 'order_delivered_notification_desc', link: '/profile?tab=completed' },
        rejected: { titleKey: 'order_rejected_notification_title', messageKey: 'order_rejected_notification_desc', link: '/profile?tab=completed' }
      };

      const notificationInfo = notifications[status];
      if (notificationInfo) {
          createNotification({
              recipientId: customerId,
              titleKey: notificationInfo.titleKey,
              messageKey: notificationInfo.messageKey,
              params: { dishName },
              link: notificationInfo.link,
          });
      }
      
      if (status === 'ready_for_delivery' && updatedOrder.deliveryPersonId) {
          createNotification({
              recipientId: updatedOrder.deliveryPersonId,
              titleKey: 'order_ready_for_pickup_title',
              messageKey: 'order_ready_for_pickup_desc',
              params: { orderId: updatedOrder.id.slice(-6), chefName: chef.name },
              link: '/delivery/dashboard',
          });
      }

      if (status === 'delivered') {
          createNotification({
              recipientId: chef.id,
              titleKey: 'order_delivered_to_customer_title',
              messageKey: 'order_delivered_to_customer_desc',
              params: { orderId: updatedOrder.id.slice(-6) },
              link: '/chef/orders?tab=completed',
          });
      }
    }
  };

  const markOrderAsNotDelivered = async (orderId: string, details: { reason: string; responsibility: NotDeliveredResponsibility }) => {
    const updatedOrder = await db.markOrderAsNotDelivered(orderId, details);
    if(updatedOrder) {
        await refreshData();
        createNotification({
            recipientId: updatedOrder.customerId,
            titleKey: 'order_not_delivered_title',
            messageKey: 'order_not_delivered_desc',
            params: { dishName: updatedOrder.dish.name, reason: details.reason },
            link: `/profile?tab=completed`,
        });
    }
  };
    
  const addDish = async (dishData: Omit<Dish, 'id' | 'ratings'>) => {
    if(!user) throw new Error("User must be logged in.");
    await db.createDish(dishData, user.id);
    await refreshData();
  };

  const updateDish = async (updatedDishData: Dish) => {
    await db.updateDish(updatedDishData.id, updatedDishData);
    await refreshData();
  };

  const deleteDish = async (dishId: string) => {
    await db.deleteDish(dishId);
    await refreshData();
  };
  
  const addReviewToOrder = async (orderId: string, rating: number, review: string) => {
    const updatedOrder = await db.addReviewToOrder(orderId, { rating, review });
    await refreshData();
  };

  const getCouponsByChefId = (chefId: string) => {
    return coupons.filter(c => c.chefId === chefId).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  };

  const createCoupon = async (couponData: Omit<Coupon, 'id' | 'timesUsed'>) => {
    await db.createCoupon(couponData);
    await refreshData();
  };

  const updateCoupon = async (couponData: Coupon) => {
    await db.updateCoupon(couponData.id, couponData);
    await refreshData();
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
    <OrderContext.Provider value={{ orders, dishes, coupons, loading, getOrdersByCustomerId, getOrdersByChefId, createOrder, updateOrderStatus, assignOrderToDelivery, markOrderAsNotDelivered, addDish, updateDish, deleteDish, addReviewToOrder, getCouponsByChefId, createCoupon, updateCoupon, validateAndApplyCoupon }}>
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
