
'use client';

import { Suspense } from 'react';
import { ProfilePageContent } from '@/components/profile-page-content';


export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProfilePageContent />
        </Suspense>
    );
}
