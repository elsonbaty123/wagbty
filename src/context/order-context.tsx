
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Order, Dish } from '@/lib/types';
import { initialOrders, allDishes as initialDishes } from '@/lib/data';

type OrderStatus = Order['status'];

interface OrderContextType {
  orders: Order[];
  dishes: Dish[];
  getOrdersByCustomerId: (customerId: string) => Order[];
  getOrdersByChefId: (chefId: string) => Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'status'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addDish: (dishData: Omit<Dish, 'id'>) => void;
  updateDish: (dishData: Dish) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [dishes, setDishes] = useState<Dish[]>(initialDishes);

  const getOrdersByCustomerId = (customerId: string) => {
    return orders.filter((order) => order.customerId === customerId);
  };

  const getOrdersByChefId = (chefId: string) => {
    return orders.filter((order) => order.chef.id === chefId);
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD${Date.now()}`,
      status: 'قيد الانتظار',
    };
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };
    
  const addDish = (dishData: Omit<Dish, 'id'>) => {
    const newDish: Dish = {
      ...dishData,
      id: `d${Date.now()}`,
    };
    setDishes((prevDishes) => [newDish, ...prevDishes]);
  };

  const updateDish = (updatedDish: Dish) => {
    setDishes((prevDishes) =>
      prevDishes.map((dish) =>
        dish.id === updatedDish.id ? updatedDish : dish
      )
    );
  };

  const value = {
    orders,
    dishes,
    getOrdersByCustomerId,
    getOrdersByChefId,
    createOrder,
    updateOrderStatus,
    addDish,
    updateDish,
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
