import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/order-card';
import type { Order } from '@/lib/types';

const mockOrders: Order[] = [
  {
    id: 'ORD123',
    customerName: 'Jane Doe',
    customerPhone: '(555) 123-4567',
    deliveryAddress: '456 Oak Ave, Springfield, USA',
    dish: { id: 'd1', name: 'Handmade Tagliatelle al Ragù', description: '', price: 24.0, imageUrl: '' },
    chef: { id: '1', name: 'Chef Isabella Rossi' },
    status: 'Delivered',
  },
  {
    id: 'ORD124',
    customerName: 'Jane Doe',
    customerPhone: '(555) 123-4567',
    deliveryAddress: '456 Oak Ave, Springfield, USA',
    dish: { id: 'd7', name: 'Omakase Sushi Set', description: '', price: 65.0, imageUrl: '' },
    chef: { id: '3', name: 'Chef Kenji Tanaka' },
    status: 'Confirmed',
  },
  {
    id: 'ORD125',
    customerName: 'Jane Doe',
    customerPhone: '(555) 123-4567',
    deliveryAddress: '456 Oak Ave, Springfield, USA',
    dish: { id: 'd5', name: 'Crème Brûlée', description: '', price: 11.5, imageUrl: '' },
    chef: { id: '2', name: 'Chef Antoine Dubois' },
    status: 'Pending',
  },
];

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-8">My Profile</h1>
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your past and current orders.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal and delivery details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="jane.doe@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="(555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Default Delivery Address</Label>
                <Textarea id="address" defaultValue="456 Oak Ave, Springfield, USA" />
              </div>
              <div className="flex justify-end">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
