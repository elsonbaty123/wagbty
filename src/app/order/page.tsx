import { Suspense } from 'react';
import OrderContent from './order-content';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    }>
      <OrderContent />
    </Suspense>
  );
}
