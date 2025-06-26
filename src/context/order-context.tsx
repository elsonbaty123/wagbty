
'use client';

import * as React from 'react';
import type { Order, Dish, DishRating, Coupon, User } from '@/lib/types';
import { useNotifications } from './notification-context';
import i18n from '@/i18n';

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
  createOrder: (orderData: CreateOrderPayload) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addDish: (dishData: Omit<Dish, 'id' | 'ratings'>) => void;
  updateDish: (dishData: Dish) => void;
  deleteDish: (dishId: string) => void;
  addReviewToOrder: (orderId: string, rating: number, review: string) => void;
  getCouponsByChefId: (chefId: string) => Coupon[];
  createCoupon: (couponData: Omit<Coupon, 'id' | 'timesUsed'>) => void;
  updateCoupon: (couponData: Coupon) => void;
  validateAndApplyCoupon: (code: string, chefId: string, dishId: string, subtotal: number) => { discount: number; error?: string };
}

const OrderContext = React.createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [dishes, setDishes] = React.useState<Dish[]>([]);
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { createNotification } = useNotifications();
  const t = i18n.t;

  React.useEffect(() => {
    try {
      const storedOrders = localStorage.getItem('chefconnect_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      
      const storedDishes = localStorage.getItem('chefconnect_dishes');
      if (storedDishes) setDishes(JSON.parse(storedDishes));

      const storedCoupons = localStorage.getItem('chefconnect_coupons');
      if (storedCoupons) setCoupons(JSON.parse(storedCoupons));

    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('chefconnect_orders', JSON.stringify(newOrders));
  }

  const persistDishes = (newDishes: Dish[]) => {
    setDishes(newDishes);
    localStorage.setItem('chefconnect_dishes', JSON.stringify(newDishes));
  }
  
  const persistCoupons = (newCoupons: Coupon[]) => {
    setCoupons(newCoupons);
    localStorage.setItem('chefconnect_coupons', JSON.stringify(newCoupons));
  }

  const getOrdersByCustomerId = (customerId: string) => {
    return orders.filter((order) => order.customerId === customerId);
  };

  const getOrdersByChefId = (chefId: string) => {
    return orders.filter((order) => order.chef.id === chefId);
  };

  const createOrder = (orderData: CreateOrderPayload) => {
    const isChefBusy = orderData.chef.availabilityStatus === 'busy';

    const newOrder: Order = {
      ...orderData,
      id: `ORD${Date.now()}`,
      status: isChefBusy ? 'Waiting for Chef' : 'Pending Review',
      createdAt: new Date().toISOString(),
      chef: { id: orderData.chef.id, name: orderData.chef.name },
    };
    
    if (orderData.appliedCouponCode) {
        const couponIndex = coupons.findIndex(c => c.code.toLowerCase() === orderData.appliedCouponCode!.toLowerCase());
        if (couponIndex !== -1) {
            const newCoupons = [...coupons];
            newCoupons[couponIndex] = {
                ...newCoupons[couponIndex],
                timesUsed: newCoupons[couponIndex].timesUsed + 1
            };
            persistCoupons(newCoupons);
        }
    }
    
    persistOrders([newOrder, ...orders]);
    
    if (isChefBusy) {
        createNotification({
            recipientId: orderData.customerId,
            title: t('order_waitlisted_notification_title'),
            message: t('order_waitlisted_notification_desc', { dishName: orderData.dish.name }),
            link: '/profile',
        });
        createNotification({
            recipientId: orderData.chef.id,
            title: t('new_waitlisted_order_notification_title'),
            message: t('new_waitlisted_order_notification_desc', { customerName: orderData.customerName }),
            link: '/chef/dashboard',
        });
    } else {
        createNotification({
          recipientId: orderData.chef.id,
          title: t('new_order_notification_title'),
          message: t('new_order_notification_desc', { dishName: orderData.dish.name, customerName: orderData.customerName }),
          link: '/chef/dashboard',
        });
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    let updatedOrder: Order | undefined;
    const newOrders = orders.map((order) => {
      if (order.id === orderId) {
        updatedOrder = { ...order, status };
        return updatedOrder;
      }
      return order;
    });

    if (updatedOrder) {
      persistOrders(newOrders);

      const { customerId, dish: { name: dishName } } = updatedOrder;
      
      switch (status) {
        case 'Preparing':
          createNotification({
            recipientId: customerId,
            title: t('order_confirmed_notification_title'),
            message: t('order_confirmed_notification_desc', { dishName }),
            link: '/profile',
          });
          break;
        case 'Ready for Delivery':
          createNotification({
            recipientId: customerId,
            title: t('order_on_the_way_notification_title'),
            message: t('order_on_the_way_notification_desc', { dishName }),
            link: '/profile',
          });
          break;
        case 'Delivered':
          createNotification({
            recipientId: customerId,
            title: t('order_delivered_notification_title'),
            message: t('order_delivered_notification_desc', { dishName }),
            link: '/profile',
          });
          break;
        case 'Rejected':
          createNotification({
            recipientId: customerId,
            title: t('order_rejected_notification_title'),
            message: t('order_rejected_notification_desc', { dishName }),
            link: '/profile',
          });
          break;
      }
    }
  };
    
  const addDish = (dishData: Omit<Dish, 'id' | 'ratings'>) => {
    const newDish: Dish = {
      ...dishData,
      id: `d${Date.now()}`,
      ratings: [],
    };
    persistDishes([newDish, ...dishes]);
  };

  const updateDish = (updatedDish: Dish) => {
    const newDishes = dishes.map((dish) =>
        dish.id === updatedDish.id ? updatedDish : dish
      );
    persistDishes(newDishes);
  };

  const deleteDish = (dishId: string) => {
    const newDishes = dishes.filter((dish) => dish.id !== dishId);
    persistDishes(newDishes);
  };
  
  const addReviewToOrder = (orderId: string, rating: number, review: string) => {
    let orderToUpdate: Order | undefined;

    const newOrders = orders.map(o => {
      if (o.id === orderId) {
        orderToUpdate = { ...o, rating, review };
        return orderToUpdate;
      }
      return o;
    });

    if (orderToUpdate) {
      const newRating: DishRating = {
        customerName: orderToUpdate.customerName,
        rating,
        review,
        createdAt: new Date().toISOString(),
      };
      
      const newDishes = dishes.map(d => {
        if (d.id === orderToUpdate!.dish.id) {
          return { ...d, ratings: [...(d.ratings || []), newRating] };
        }
        return d;
      });

      persistDishes(newDishes);
      persistOrders(newOrders);
    }
  };

  const getCouponsByChefId = (chefId: string) => {
    return coupons.filter(c => c.chefId === chefId).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  };

  const createCoupon = (couponData: Omit<Coupon, 'id' | 'timesUsed'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `COUP${Date.now()}`,
      timesUsed: 0,
    };
    persistCoupons([newCoupon, ...coupons]);
  };

  const updateCoupon = (updatedCoupon: Coupon) => {
    const newCoupons = coupons.map(c => c.id === updatedCoupon.id ? updatedCoupon : c);
    persistCoupons(newCoupons);
  };

  const validateAndApplyCoupon = (code: string, chefId: string, dishId: string, subtotal: number): { discount: number; error?: string } => {
    const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase() && c.chefId === chefId);

    if (!coupon) {
      return { discount: 0, error: t('coupon_invalid_error') };
    }
    if (!coupon.isActive) {
      return { discount: 0, error: t('coupon_inactive_error') };
    }
    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
      return { discount: 0, error: t('coupon_expired_error') };
    }
    if (coupon.timesUsed >= coupon.usageLimit) {
      return { discount: 0, error: t('coupon_limit_reached_error') };
    }
    
    if (coupon.appliesTo === 'specific') {
      if (!coupon.applicableDishIds || !coupon.applicableDishIds.includes(dishId)) {
        return { discount: 0, error: t('coupon_not_applicable_error') };
      }
    }


    let discount = 0;
    if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
    } else { // percentage
      discount = subtotal * (coupon.discountValue / 100);
    }
    
    discount = Math.min(discount, subtotal);

    return { discount };
  };

  const value = {
    orders,
    dishes,
    coupons,
    loading,
    getOrdersByCustomerId,
    getOrdersByChefId,
    createOrder,
    updateOrderStatus,
    addDish,
    updateDish,
    deleteDish,
    addReviewToOrder,
    getCouponsByChefId,
    createCoupon,
    updateCoupon,
    validateAndApplyCoupon,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = React.useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
