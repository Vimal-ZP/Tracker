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

    const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';

    useEffect(() => {
        // Only proceed once auth is fully initialized
        if (!isInitialized || loading) {
            setIsReady(false);
            return;
        }

        // Auth is initialized, now determine what to do
        if (user) {
            // User is authenticated
            if (isAuthPage) {
                // Authenticated user on auth page - redirect to dashboard
                router.replace('/dashboard');
                return;
            } else {
                // Authenticated user on protected page - allow access
                setIsReady(true);
            }
        } else {
            // User is not authenticated
            if (isAuthPage) {
                // Unauthenticated user on auth page - allow access
                setIsReady(true);
            } else {
                // Unauthenticated user on protected page - redirect to login
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
