import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Chef } from '@/lib/types';
import { Star } from 'lucide-react';

interface ChefCardProps {
  chef: Chef;
}

export function ChefCard({ chef }: ChefCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <Image
          alt={chef.name}
          className="aspect-[4/3] w-full object-cover"
          height="300"
          src={chef.imageUrl}
          data-ai-hint="chef portrait"
          width="400"
        />
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="font-headline text-2xl mb-2">{chef.name}</CardTitle>
        <CardDescription className="text-primary font-semibold mb-2">{chef.specialty}</CardDescription>
        <p className="mb-4 text-sm text-muted-foreground">{chef.bio}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold">{chef.rating}</span>
          </div>
          <Button asChild variant="link" className="text-accent hover:text-accent/80 p-0 h-auto">
            <Link href={`/chefs/${chef.id}`}>
              View Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
