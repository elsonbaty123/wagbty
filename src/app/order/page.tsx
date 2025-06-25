import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Dish } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

const mockDishes: Record<string, Dish> = {
  'd1': { id: 'd1', name: 'Handmade Tagliatelle al Ragù', description: 'Slow-cooked beef and pork ragù over fresh, handmade egg pasta.', price: 24.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd2': { id: 'd2', name: 'Risotto ai Funghi Porcini', description: 'Creamy risotto with wild porcini mushrooms, parmigiano, and white truffle oil.', price: 26.5, imageUrl: 'https://placehold.co/400x225.png' },
  'd3': { id: 'd3', name: 'Tiramisù Classico', description: 'The classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream.', price: 12.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd4': { id: 'd4', name: 'Chocolate Lava Cake', description: 'A decadent molten chocolate cake with a raspberry coulis center.', price: 14.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd5': { id: 'd5', name: 'Crème Brûlée', description: 'Rich vanilla bean custard with a perfectly caramelized sugar topping.', price: 11.5, imageUrl: 'https://placehold.co/400x225.png' },
  'd6': { id: 'd6', name: 'Macaron Assortment', description: 'A selection of six delicate French macarons in various flavors.', price: 18.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd7': { id: 'd7', name: 'Omakase Sushi Set', description: 'A chef\'s choice selection of 12 pieces of premium nigiri sushi.', price: 65.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd8': { id: 'd8', name: 'Wagyu Beef Skewers', description: 'Grilled A5 Wagyu beef skewers with a sweet soy glaze.', price: 35.0, imageUrl: 'https://placehold.co/400x225.png' },
  'd9': { id: 'd9', name: 'Spicy Tuna Crispy Rice', description: 'Crispy fried rice topped with spicy tuna and jalapeño.', price: 19.0, imageUrl: 'https://placehold.co/400x225.png' },
};

export default function OrderPage({ searchParams }: { searchParams: { dishId: string } }) {
  const dish = mockDishes[searchParams.dishId] || Object.values(mockDishes)[0];

  const subtotal = dish.price;
  const deliveryFee = 5.0;
  const total = subtotal + deliveryFee;

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chefs
          </Link>
        </Button>
      </div>
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary mb-6">Complete Your Order</h1>
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>Please provide your delivery address and contact number.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="(123) 456-7890" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea id="address" placeholder="123 Main St, Anytown, USA" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea id="notes" placeholder="e.g., Leave at the front door." />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
           <h2 className="font-headline text-2xl font-bold">Order Summary</h2>
            <Card>
                <CardContent className="p-6 flex items-center gap-4">
                    <Image
                      alt={dish.name}
                      className="rounded-md object-cover"
                      height="80"
                      src={dish.imageUrl}
                      data-ai-hint="food item"
                      width="80"
                    />
                    <div className="grid gap-1 flex-1">
                        <h3 className="font-semibold">{dish.name}</h3>
                        <p className="text-sm text-muted-foreground">{dish.description}</p>
                        <p className="font-bold text-primary">${dish.price.toFixed(2)}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                 <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                     <div className="flex items-center justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Place Order
                  </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
