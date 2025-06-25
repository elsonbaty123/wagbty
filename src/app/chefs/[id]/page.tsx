import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Chef } from '@/lib/types';
import { DishCard } from '@/components/dish-card';

const mockChefs: Record<string, Chef> = {
  '1': {
    id: '1',
    name: 'Chef Isabella Rossi',
    specialty: 'Italian Cuisine',
    bio: 'With over 20 years of experience in traditional Italian cooking, Isabella brings the authentic taste of her hometown, Bologna, to your table. Her philosophy is simple: fresh, high-quality ingredients and a lot of love.',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.9,
    dishes: [
      { id: 'd1', name: 'Handmade Tagliatelle al Ragù', description: 'Slow-cooked beef and pork ragù over fresh, handmade egg pasta.', price: 24.0, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd2', name: 'Risotto ai Funghi Porcini', description: 'Creamy risotto with wild porcini mushrooms, parmigiano, and white truffle oil.', price: 26.5, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd3', name: 'Tiramisù Classico', description: 'The classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream.', price: 12.0, imageUrl: 'https://placehold.co/400x225.png' },
    ],
  },
   '2': {
    id: '2',
    name: 'Chef Antoine Dubois',
    specialty: 'French Pâtisserie',
    bio: 'Antoine is a Le Cordon Bleu-trained pastry chef who specializes in classic French desserts. He believes that dessert is not just an end to a meal, but an experience in itself.',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.8,
    dishes: [
      { id: 'd4', name: 'Chocolate Lava Cake', description: 'A decadent molten chocolate cake with a raspberry coulis center.', price: 14.0, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd5', name: 'Crème Brûlée', description: 'Rich vanilla bean custard with a perfectly caramelized sugar topping.', price: 11.5, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd6', name: 'Macaron Assortment', description: 'A selection of six delicate French macarons in various flavors.', price: 18.0, imageUrl: 'https://placehold.co/400x225.png' },
    ],
  },
   '3': {
    id: '3',
    name: 'Chef Kenji Tanaka',
    specialty: 'Sushi & Japanese Grill',
    bio: 'A third-generation sushi master from Tokyo, Kenji is dedicated to the art of Edomae sushi. His precision knife skills and respect for ingredients are evident in every piece.',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.9,
    dishes: [
      { id: 'd7', name: 'Omakase Sushi Set', description: 'A chef\'s choice selection of 12 pieces of premium nigiri sushi.', price: 65.0, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd8', name: 'Wagyu Beef Skewers', description: 'Grilled A5 Wagyu beef skewers with a sweet soy glaze.', price: 35.0, imageUrl: 'https://placehold.co/400x225.png' },
      { id: 'd9', name: 'Spicy Tuna Crispy Rice', description: 'Crispy fried rice topped with spicy tuna and jalapeño.', price: 19.0, imageUrl: 'https://placehold.co/400x225.png' },
    ],
  },
};

export default function ChefProfilePage({ params }: { params: { id: string } }) {
  const chef = mockChefs[params.id] || Object.values(mockChefs)[0];

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <Image
              alt={chef.name}
              className="aspect-square w-full rounded-xl object-cover shadow-lg"
              height="400"
              src={chef.imageUrl}
              data-ai-hint="chef cooking"
              width="400"
            />
            <h1 className="font-headline text-3xl font-bold mt-4">{chef.name}</h1>
            <p className="text-lg text-primary font-semibold mt-1">{chef.specialty}</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-lg">{chef.rating}</span>
              <span className="text-sm text-muted-foreground">(24 reviews)</span>
            </div>
            <p className="mt-4 text-muted-foreground">{chef.bio}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="font-headline text-3xl font-bold text-primary mb-6">Menu</h2>
          <div className="grid gap-6">
            {chef.dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
