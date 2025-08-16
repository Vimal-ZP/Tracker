'use client';

import React from 'react';
import { useAuth } from '@/contexts';

export default function AuthDebug() {
    const { user, loading, isInitialized } = useAuth();

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const hasToken = typeof window !== 'undefined' ?
        !!(localStorage.getItem('auth_token') || document.cookie.match(/auth_token=([^;]+)/)) :
        false;

    return (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded text-xs font-mono z-50">
            <div>Auth Debug:</div>
            <div>User: {user ? '✅' : '❌'}</div>
            <div>Loading: {loading ? '🔄' : '✅'}</div>
            <div>Initialized: {isInitialized ? '✅' : '❌'}</div>
            <div>Token: {hasToken ? '✅' : '❌'}</div>
            <div>Path: {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}</div>
        </div>
    );
}
