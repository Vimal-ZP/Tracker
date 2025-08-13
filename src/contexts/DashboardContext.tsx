'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';
import { apiClient } from '@/lib/api';
import { useAuth } from './AuthContext';

interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    basicUsers: number;
    superAdminUsers: number;
    inactiveUsers: number;
    recentUsers: User[];
    userGrowth: {
        thisMonth: number;
        lastMonth: number;
        percentageChange: number;
    };
}

interface ActivityItem {
    id: string;
    type: 'user_created' | 'user_updated' | 'user_deleted' | 'login' | 'logout' | 'role_changed';
    message: string;
    timestamp: Date;
    userId?: string;
    userName?: string;
}

interface DashboardContextType {
    stats: DashboardStats | null;
    activities: ActivityItem[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchDashboardData: () => Promise<void>;
    addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
    clearActivities: () => void;
    refreshStats: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
    children: React.ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateMockActivities = (): ActivityItem[] => {
        const mockActivities: ActivityItem[] = [
            {
                id: '1',
                type: 'user_created',
                message: 'New user account created',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                userName: 'John Doe',
            },
            {
                id: '2',
                type: 'login',
                message: 'User logged in successfully',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                userName: 'Jane Smith',
            },
            {
                id: '3',
                type: 'role_changed',
                message: 'User role updated to Admin',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                userName: 'Mike Johnson',
            },
            {
                id: '4',
                type: 'user_updated',
                message: 'User profile updated',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                userName: 'Sarah Wilson',
            },
        ];
        return mockActivities;
    };

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Only fetch user stats if user has permission
            if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
                const response = await apiClient.getUsers({ limit: 1000 });
                const users = response.users;

                // Calculate stats
                const now = new Date();
                const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

                const thisMonthUsers = users.filter(u => new Date(u.createdAt) >= thisMonth);
                const lastMonthUsers = users.filter(u => {
                    const createdAt = new Date(u.createdAt);
                    return createdAt >= lastMonth && createdAt < thisMonth;
                });

                const percentageChange = lastMonthUsers.length > 0
                    ? ((thisMonthUsers.length - lastMonthUsers.length) / lastMonthUsers.length) * 100
                    : 100;

                const dashboardStats: DashboardStats = {
                    totalUsers: users.length,
                    activeUsers: users.filter(u => u.isActive).length,
                    inactiveUsers: users.filter(u => !u.isActive).length,
                    adminUsers: users.filter(u => u.role === UserRole.ADMIN).length,
                    superAdminUsers: users.filter(u => u.role === UserRole.SUPER_ADMIN).length,
                    basicUsers: users.filter(u => u.role === UserRole.BASIC).length,
                    recentUsers: users
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5),
                    userGrowth: {
                        thisMonth: thisMonthUsers.length,
                        lastMonth: lastMonthUsers.length,
                        percentageChange: Math.round(percentageChange),
                    },
                };

                setStats(dashboardStats);
            } else {
                // For basic users, provide limited stats
                setStats({
                    totalUsers: 1,
                    activeUsers: user.isActive ? 1 : 0,
                    inactiveUsers: user.isActive ? 0 : 1,
                    adminUsers: 0,
                    superAdminUsers: 0,
                    basicUsers: 1,
                    recentUsers: [user],
                    userGrowth: {
                        thisMonth: 1,
                        lastMonth: 0,
                        percentageChange: 100,
                    },
                });
            }

            // Set mock activities
            setActivities(generateMockActivities());

        } catch (err: any) {
            setError(err.message || 'Failed to fetch dashboard data');
            console.error('Dashboard data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = async () => {
        await fetchDashboardData();
    };

    const addActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
        const newActivity: ActivityItem = {
            ...activity,
            id: Date.now().toString(),
            timestamp: new Date(),
        };

        setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only 10 most recent
    };

    const clearActivities = () => {
        setActivities([]);
    };

    // Fetch data when user changes or component mounts
    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const value: DashboardContextType = {
        stats,
        activities,
        loading,
        error,
        fetchDashboardData,
        addActivity,
        clearActivities,
        refreshStats,
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
