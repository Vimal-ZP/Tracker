'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function HomePage() {
    const { user, loading, isInitialized } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Only redirect after auth is fully initialized
        if (isInitialized && !loading) {
            if (user) {
                router.replace('/dashboard');
            } else {
                router.replace('/login');
            }
        }
    }, [user, loading, isInitialized, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    );
}
