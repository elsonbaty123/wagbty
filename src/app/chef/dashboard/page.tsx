import { OrderCard } from '@/components/order-card';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Utensils, ClipboardList } from 'lucide-react';

const mockChefOrders: Order[] = [
  {
    id: 'ORD125',
    customerName: 'Jane Doe',
    customerPhone: '(555) 123-4567',
    deliveryAddress: '456 Oak Ave, Springfield, USA',
    dish: { id: 'd5', name: 'Crème Brûlée', description: '', price: 11.5, imageUrl: '' },
    chef: { id: '2', name: 'Chef Antoine Dubois' },
    status: 'Pending',
  },
  {
    id: 'ORD126',
    customerName: 'John Smith',
    customerPhone: '(555) 987-6543',
    deliveryAddress: '789 Pine St, Metroville, USA',
    dish: { id: 'd4', name: 'Chocolate Lava Cake', description: '', price: 14.0, imageUrl: '' },
    chef: { id: '2', name: 'Chef Antoine Dubois' },
    status: 'Pending',
  },
  {
    id: 'ORD127',
    customerName: 'Emily Johnson',
    customerPhone: '(555) 555-5555',
    deliveryAddress: '101 Maple Rd, Gotham, USA',
    dish: { id: 'd6', name: 'Macaron Assortment', description: '', price: 18.0, imageUrl: '' },
    chef: { id: '2', name: 'Chef Antoine Dubois' },
    status: 'Confirmed',
  },
];

export default function ChefDashboardPage() {
  const pendingOrders = mockChefOrders.filter(o => o.status === 'Pending');
  const otherOrders = mockChefOrders.filter(o => o.status !== 'Pending');

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Chef Dashboard</h1>
        <p className="font-semibold text-lg">Welcome back, Chef Antoine!</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5</div>
             <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingOrders.length} <Badge>Pending</Badge>
            </div>
             <p className="text-xs text-muted-foreground">Require your confirmation</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-headline text-2xl font-bold mb-4">New Orders</h2>
        {pendingOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} isChefView />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No new orders at the moment.</p>
        )}
      </div>

      <div className="mt-12">
        <h2 className="font-headline text-2xl font-bold mb-4">Order History</h2>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
