'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials, CreateUserData } from '@/types/user';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isInitialized: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (userData: CreateUserData) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(() => {
        // Synchronous check - only show loading if we have a token to validate
        if (typeof window !== 'undefined') {
            const hasToken = localStorage.getItem('auth_token') ||
                document.cookie.match(/auth_token=([^;]+)/);
            return !!hasToken;
        }
        return true;
    });
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        // Don't re-initialize if we're in the middle of a logout
        if (isLoggingOut) {
            console.log('AuthContext: Skipping initialization - logout in progress');
            return;
        }

                // Immediate synchronous check to prevent flash
        const initAuth = async () => {
            if (typeof window === 'undefined') {
                setLoading(false);
                setIsInitialized(true);
                return;
            }

            // Check for token immediately
            const token = localStorage.getItem('auth_token') || 
                         document.cookie.match(/auth_token=([^;]+)/)?.[1];

            if (!token) {
                // No token, user is definitely not authenticated
                setUser(null);
                setLoading(false);
                setIsInitialized(true);
                return;
            }

            // We have a token, validate it
            try {
                apiClient.setToken(token);
                const response = await apiClient.getProfile();

                // Validate user object structure
                if (response.user && !Array.isArray(response.user.assignedApplications)) {
                    response.user.assignedApplications = [];
                }

                setUser(response.user);
            } catch (error) {
                console.error('Auth validation failed:', error);
                // Token is invalid, clear it
                localStorage.removeItem('auth_token');
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                apiClient.setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
                setIsInitialized(true);
            }
        };

        initAuth();
    }, [isLoggingOut]);



    const login = async (credentials: LoginCredentials) => {
        try {
            console.log('AuthContext: Starting login process');
            setLoading(true);
            const response = await apiClient.login(credentials);
            console.log('AuthContext: Login API response received', response.user);

            // Validate user object structure
            if (response.user && !Array.isArray(response.user.assignedApplications)) {
                console.warn('AuthContext: assignedApplications is not an array, fixing...', response.user.assignedApplications);
                response.user.assignedApplications = [];
            }

            // Set user state and mark as initialized
            setUser(response.user);
            setIsInitialized(true);
            setLoading(false);

            console.log('AuthContext: User state updated');

        } catch (error: any) {
            console.error('AuthContext: Login failed', error);
            setLoading(false);
            toast.error(error.message || 'Login failed');
            throw error;
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
        try {
            console.log('AuthContext: Starting logout process');

            // Set logout flag to prevent re-initialization
            setIsLoggingOut(true);

            // Clear user state immediately
            setUser(null);

            // Ensure auth state is properly set for logout
            setLoading(false);
            setIsInitialized(true);

            // Clear API client token
            apiClient.logout();

            // Clear localStorage token
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
            }

            // Clear cookie as well
            if (typeof document !== 'undefined') {
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }

            console.log('AuthContext: Logout completed successfully');

            // Clear logout flag after a brief delay
            setTimeout(() => {
                setIsLoggingOut(false);
            }, 100);

        } catch (error) {
            console.error('AuthContext: Error during logout:', error);
            // Even if there's an error, ensure user is logged out
            setUser(null);
            setLoading(false);
            setIsInitialized(true);

            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
            }
            if (typeof document !== 'undefined') {
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }

            // Clear logout flag
            setTimeout(() => {
                setIsLoggingOut(false);
            }, 100);
        }
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
        isInitialized,
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
