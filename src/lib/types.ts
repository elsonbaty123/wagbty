export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

export type Chef = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  imageUrl: string;
  rating: number;
  dishes: Dish[];
};

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  dish: Dish;
  chef: Pick<Chef, 'id' | 'name'>;
  status: 'قيد الانتظار' | 'مؤكد' | 'مرفوض' | 'تم التوصيل';
};
