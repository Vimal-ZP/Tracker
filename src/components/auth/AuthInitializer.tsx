'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthInitializerProps {
    children: React.ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
    const { isInitialized } = useAuth();

    useEffect(() => {
        // Mark React as ready once this component mounts
        if (typeof document !== 'undefined') {
            document.documentElement.classList.add('react-ready');
        }
    }, []);

    if (!isInitialized) {
        return (
            <div className="auth-initializing">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="auth-ready">
            {children}
        </div>
    );
}
