'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthGateProps {
    children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
    const { user, loading, isInitialized } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isReady, setIsReady] = useState(false);

    const isAuthPage = pathname === '/login' || pathname === '/register';

    useEffect(() => {
        console.log('AuthGate: State check', {
            user: !!user,
            loading,
            isInitialized,
            pathname,
            isAuthPage
        });

        // Only proceed once auth is fully initialized
        if (!isInitialized || loading) {
            console.log('AuthGate: Still initializing...');
            setIsReady(false);
            return;
        }

        // Auth is initialized, now determine what to do
        if (user) {
            // User is authenticated
            if (isAuthPage) {
                // Authenticated user on auth page - redirect to dashboard
                console.log('AuthGate: Authenticated user on auth page, redirecting to dashboard');
                router.replace('/dashboard');
                return;
            } else {
                // Authenticated user on protected page - allow access
                console.log('AuthGate: Authenticated user on protected page, allowing access');
                setIsReady(true);
            }
        } else {
            // User is not authenticated
            if (isAuthPage) {
                // Unauthenticated user on auth page - allow access
                console.log('AuthGate: Unauthenticated user on auth page, allowing access');
                setIsReady(true);
            } else {
                // Unauthenticated user on protected page - redirect to login
                console.log('AuthGate: Unauthenticated user on protected page, redirecting to login');
                router.replace('/login');
                return;
            }
        }
    }, [user, loading, isInitialized, pathname, isAuthPage, router]);

    // Show loading until auth is resolved and routing decisions are made
    if (!isInitialized || loading || !isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return <>{children}</>;
}
