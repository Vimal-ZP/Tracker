'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { useUI } from '@/contexts/UIContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { isSidebarOpen, openSidebar, closeSidebar, globalLoading } = useUI();

    // Redirect to login if user becomes null (after logout)
    useEffect(() => {
        console.log('Layout: User state changed', { user: !!user, loading });
        if (!loading && !user && typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            console.log('Layout: User is null, current path:', currentPath);
            // Only redirect if not already on login/register pages
            if (currentPath !== '/login' && currentPath !== '/register') {
                console.log('Layout: Redirecting to login');
                router.push('/login');
            }
        }
    }, [user, loading, router]);

    if (loading || globalLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return <>{children}</>;
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
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
        </div>
    );
}
