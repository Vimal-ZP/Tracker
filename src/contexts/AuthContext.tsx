'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials, CreateUserData } from '@/types/user';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (userData: CreateUserData) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Try to get token from localStorage first, then from cookies
            let token = localStorage.getItem('auth_token');

            if (!token && typeof document !== 'undefined') {
                // Fallback to cookie if localStorage doesn't have token
                const cookieMatch = document.cookie.match(/auth_token=([^;]+)/);
                token = cookieMatch ? cookieMatch[1] : null;

                // If found in cookie, sync to localStorage
                if (token) {
                    localStorage.setItem('auth_token', token);
                }
            }

            if (token) {
                apiClient.setToken(token);
                const response = await apiClient.getProfile();
                setUser(response.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('auth_token');
            // Clear cookie
            if (typeof document !== 'undefined') {
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
            apiClient.setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            console.log('AuthContext: Starting login process');
            setLoading(true);
            const response = await apiClient.login(credentials);
            console.log('AuthContext: Login API response received', response.user);
            setUser(response.user);
            console.log('AuthContext: User state updated');
            toast.success('Login successful!');
        } catch (error: any) {
            console.error('AuthContext: Login failed', error);
            toast.error(error.message || 'Login failed');
            throw error;
        } finally {
            setLoading(false);
            console.log('AuthContext: Login process completed');
        }
    };

    const register = async (userData: CreateUserData) => {
        try {
            setLoading(true);
            const response = await apiClient.register(userData);
            setUser(response.user);
            toast.success('Registration successful!');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        console.log('AuthContext: Starting logout process');
        apiClient.logout();
        setUser(null);
        // Clear cookie as well
        if (typeof document !== 'undefined') {
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        console.log('AuthContext: User state cleared, showing success message');
        toast.success('Logged out successfully');
    };

    const refreshUser = async () => {
        try {
            const response = await apiClient.getProfile();
            setUser(response.user);
        } catch (error) {
            console.error('Failed to refresh user:', error);
            logout();
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
