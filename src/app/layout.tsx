import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/contexts';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import AuthInitializer from '@/components/auth/AuthInitializer';
import AuthGate from '@/components/auth/AuthGate';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Tracker - User Management System',
    description: 'A comprehensive user management system with role-based access control',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            // Pre-authentication check to prevent any flash
                            (function() {
                                if (typeof window !== 'undefined') {
                                    const hasToken = localStorage.getItem('auth_token') || 
                                                   document.cookie.match(/auth_token=([^;]+)/);
                                    
                                    // Add a class to body to indicate auth state
                                    if (hasToken) {
                                        document.documentElement.classList.add('has-token');
                                    } else {
                                        document.documentElement.classList.add('no-token');
                                    }
                                }
                            })();
                        `,
                    }}
                />
            </head>
            <body className={inter.className}>
                <AppProviders>
                    <ErrorBoundary>
                        <AuthInitializer>
                            <AuthGate>
                                <Layout>
                                    {children}
                                </Layout>
                            </AuthGate>
                        </AuthInitializer>
                    </ErrorBoundary>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                duration: 3000,
                                iconTheme: {
                                    primary: '#10B981',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                duration: 5000,
                                iconTheme: {
                                    primary: '#EF4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                </AppProviders>
            </body>
        </html>
    );
}
