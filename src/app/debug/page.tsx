'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts';

export default function DebugPage() {
    const { user, loading, login } = useAuth();
    const [testCredentials] = useState({
        email: 'test@example.com',
        password: 'password123'
    });

    const handleTestLogin = async () => {
        try {
            console.log('Testing login with:', testCredentials);
            await login(testCredentials);
            console.log('Login completed successfully');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const checkCookies = () => {
        console.log('All cookies:', document.cookie);
        console.log('Auth token from localStorage:', localStorage.getItem('auth_token'));
    };

    const checkAuthState = () => {
        console.log('Current user state:', user);
        console.log('Loading state:', loading);
    };

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>

            <div className="space-y-4">
                <div className="card p-4">
                    <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
                    <p><strong>User:</strong> {user ? `${user.name} (${user.email})` : 'Not logged in'}</p>
                    <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                    <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
                </div>

                <div className="card p-4">
                    <h2 className="text-lg font-semibold mb-2">Debug Actions</h2>
                    <div className="space-x-2">
                        <button onClick={handleTestLogin} className="btn-primary">
                            Test Login
                        </button>
                        <button onClick={checkCookies} className="btn-secondary">
                            Check Cookies
                        </button>
                        <button onClick={checkAuthState} className="btn-secondary">
                            Check Auth State
                        </button>
                    </div>
                </div>

                <div className="card p-4">
                    <h2 className="text-lg font-semibold mb-2">Test Credentials</h2>
                    <p><strong>Email:</strong> {testCredentials.email}</p>
                    <p><strong>Password:</strong> {testCredentials.password}</p>
                </div>
            </div>
        </div>
    );
}
