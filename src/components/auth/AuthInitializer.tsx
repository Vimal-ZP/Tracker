'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthInitializerProps {
    children: React.ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
    const { isInitialized, loading, user } = useAuth();

    useEffect(() => {
        // Mark React as ready once this component mounts
        if (typeof document !== 'undefined') {
            document.documentElement.classList.add('react-ready');
        }
    }, []);

    // Add debugging
    useEffect(() => {
        console.log('AuthInitializer: State changed', {
            isInitialized,
            loading,
            user: !!user,
            pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR'
        });
    }, [isInitialized, loading, user]);

    if (!isInitialized) {
        console.log('AuthInitializer: Showing loading - not initialized');
        return (
            <div className="auth-initializing">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    console.log('AuthInitializer: Auth ready, rendering children');
    return (
        <div className="auth-ready">
            {children}
        </div>
    );
}
