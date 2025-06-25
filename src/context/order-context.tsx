
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Order, Dish, DishRating } from '@/lib/types';

type OrderStatus = Order['status'];

interface OrderContextType {
  orders: Order[];
  dishes: Dish[];
  loading: boolean;
  getOrdersByCustomerId: (customerId: string) => Order[];
  getOrdersByChefId: (chefId: string) => Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addDish: (dishData: Omit<Dish, 'id' | 'ratings'>) => void;
  updateDish: (dishData: Dish) => void;
  deleteDish: (dishId: string) => void;
  addReviewToOrder: (orderId: string, rating: number, review: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem('chefconnect_orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
      const storedDishes = localStorage.getItem('chefconnect_dishes');
      if (storedDishes) {
        setDishes(JSON.parse(storedDishes));
      }
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


  const getOrdersByCustomerId = (customerId: string) => {
    return orders.filter((order) => order.customerId === customerId);
  };

  const getOrdersByChefId = (chefId: string) => {
    return orders.filter((order) => order.chef.id === chefId);
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD${Date.now()}`,
      status: 'جارٍ المراجعة',
      createdAt: new Date().toISOString(),
    };
    persistOrders([newOrder, ...orders]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const newOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      );
    persistOrders(newOrders);
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
          return { ...d, ratings: [...d.ratings, newRating] };
        }
        return d;
      });

      persistDishes(newDishes);
      persistOrders(newOrders);
    }
  };


  const value = {
    orders,
    dishes,
    loading,
    getOrdersByCustomerId,
    getOrdersByChefId,
    createOrder,
    updateOrderStatus,
    addDish,
    updateDish,
    deleteDish,
    addReviewToOrder,
  };

  return (
    <OrderContext.Provider value={value}>
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
