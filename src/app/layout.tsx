import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/contexts';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';

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
            <body className={inter.className}>
                <AppProviders>
                    <Layout>
                        {children}
                    </Layout>
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
