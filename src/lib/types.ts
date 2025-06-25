export type Dish = {
  id: string;
  chefId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

export type Chef = {
  id:string;
  name: string;
  phone?: string;
  specialty: string;
  bio: string;
  imageUrl: string;
  rating: number;
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  dish: Dish;
  chef: Pick<Chef, 'id' | 'name'>;
  quantity: number;
  status: 'قيد الانتظار' | 'مؤكد' | 'مرفوض' | 'تم التوصيل';
};
