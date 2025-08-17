'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthInitializerProps {
    children: React.ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
    const { isInitialized, loading, user } = useAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Mark as client-side and add React ready class
        setIsClient(true);
        if (typeof document !== 'undefined') {
            document.documentElement.classList.add('react-ready');
        }
    }, []);



    // Always render the same structure, but conditionally show content
    return (
        <div className="auth-container">
            {!isClient || !isInitialized ? (
                <div className="auth-initializing">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="auth-ready">
                    {children}
                </div>
            )}
        </div>
    );
}
