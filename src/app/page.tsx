import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import HomeContent from './home-content';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="container mx-auto px-4 h-full flex items-center justify-center">
            <div className="text-center">
              <Skeleton className="h-16 w-96 max-w-full mx-auto mb-6" />
              <Skeleton className="h-6 w-3/4 max-w-xl mx-auto mb-8" />
              <Skeleton className="h-16 w-full max-w-2xl mx-auto rounded-full" />
            </div>
          </div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
