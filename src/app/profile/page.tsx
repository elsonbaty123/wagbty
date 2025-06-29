
import { Suspense } from 'react';
import { ProfilePageContent } from '@/components/profile-page-content';
import { Skeleton } from '@/components/ui/skeleton';


function ProfilePageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <Skeleton className="h-12 w-48 mb-8" />
            <Skeleton className="h-10 w-72 mb-4" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    )
}


export default function ProfilePage({ searchParams }: { searchParams?: { tab?: string } }) {
    let tab = searchParams?.tab || 'ongoing';
    // Ensure the tab value is valid, otherwise default to 'ongoing'
    if (tab !== 'ongoing' && tab !== 'completed') {
        tab = 'ongoing';
    }
    
    return (
        <Suspense fallback={<ProfilePageSkeleton />}>
            <ProfilePageContent tab={tab} />
        </Suspense>
    );
}
