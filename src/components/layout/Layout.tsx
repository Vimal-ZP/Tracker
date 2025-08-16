'use client';

import React from 'react';
import { useAuth } from '@/contexts';
import { useUI } from '@/contexts/UIContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AuthDebug from '@/components/debug/AuthDebug';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { user, loading } = useAuth();
    const { isSidebarOpen, openSidebar, closeSidebar, globalLoading } = useUI();

    // Get current path
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isAuthPage = currentPath === '/login' || currentPath === '/register';

    // Show loading spinner for global loading
    if (globalLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // If we're on auth pages, show minimal layout
    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className={`h-screen flex flex-col bg-gray-50 ${user ? 'auth-loaded' : 'auth-loading'}`}>
            <Navbar onToggleSidebar={openSidebar} />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={closeSidebar}
                />

                <main className="flex-1 overflow-auto lg">
                    <div className="h-full">
                        <div className="h-full px-4 py-6 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
            <AuthDebug />
        </div>
    );
}
