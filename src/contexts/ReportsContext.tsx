'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';
import { useAuth } from './AuthContext';
import { apiClient } from '@/lib/api';

interface UserAnalytics {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    usersByRole: Record<UserRole, number>;
    userGrowthData: {
        month: string;
        users: number;
        active: number;
    }[];
    topActiveUsers: {
        user: User;
        lastLogin: Date;
        loginCount: number;
    }[];
}

interface SystemMetrics {
    uptime: number; // percentage
    responseTime: number; // in milliseconds
    errorRate: number; // percentage
    requestsPerMinute: number;
    memoryUsage: number; // percentage
    cpuUsage: number; // percentage
    diskUsage: number; // percentage
    databaseConnections: number;
}

interface SecurityReport {
    failedLoginAttempts: number;
    suspiciousActivities: number;
    blockedIPs: string[];
    securityAlerts: {
        id: string;
        type: 'failed_login' | 'suspicious_activity' | 'unauthorized_access' | 'data_breach';
        message: string;
        timestamp: Date;
        severity: 'low' | 'medium' | 'high' | 'critical';
        resolved: boolean;
    }[];
}

interface ActivityReport {
    totalActivities: number;
    activitiesByType: Record<string, number>;
    recentActivities: {
        id: string;
        type: string;
        user: string;
        timestamp: Date;
        details: string;
    }[];
    peakActivityHours: number[];
}

interface ReportFilters {
    dateRange: {
        start: Date;
        end: Date;
    };
    userRoles: UserRole[];
    activityTypes: string[];
    includeInactive: boolean;
}

interface ReportsContextType {
    userAnalytics: UserAnalytics | null;
    systemMetrics: SystemMetrics | null;
    securityReport: SecurityReport | null;
    activityReport: ActivityReport | null;
    filters: ReportFilters;
    loading: boolean;
    error: string | null;

    // Actions
    fetchUserAnalytics: () => Promise<void>;
    fetchSystemMetrics: () => Promise<void>;
    fetchSecurityReport: () => Promise<void>;
    fetchActivityReport: () => Promise<void>;
    fetchAllReports: () => Promise<void>;
    updateFilters: (newFilters: Partial<ReportFilters>) => void;
    exportReport: (reportType: 'users' | 'system' | 'security' | 'activity', format: 'json' | 'csv') => string;
    scheduleReport: (reportType: string, schedule: 'daily' | 'weekly' | 'monthly') => Promise<void>;
}

const defaultFilters: ReportFilters = {
    dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date(),
    },
    userRoles: [UserRole.BASIC, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    activityTypes: [],
    includeInactive: false,
};

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

interface ReportsProviderProps {
    children: React.ReactNode;
}

export function ReportsProvider({ children }: ReportsProviderProps) {
    const { user } = useAuth();
    const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
    const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
    const [activityReport, setActivityReport] = useState<ActivityReport | null>(null);
    const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateMockUserAnalytics = (users: User[]): UserAnalytics => {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.isActive).length,
            newUsersThisMonth: users.filter(u => new Date(u.createdAt) >= thisMonth).length,
            usersByRole: {
                [UserRole.BASIC]: users.filter(u => u.role === UserRole.BASIC).length,
                [UserRole.ADMIN]: users.filter(u => u.role === UserRole.ADMIN).length,
                [UserRole.SUPER_ADMIN]: users.filter(u => u.role === UserRole.SUPER_ADMIN).length,
            },
            userGrowthData: [
                { month: 'Jan', users: Math.floor(users.length * 0.6), active: Math.floor(users.length * 0.5) },
                { month: 'Feb', users: Math.floor(users.length * 0.7), active: Math.floor(users.length * 0.6) },
                { month: 'Mar', users: Math.floor(users.length * 0.8), active: Math.floor(users.length * 0.7) },
                { month: 'Apr', users: Math.floor(users.length * 0.9), active: Math.floor(users.length * 0.8) },
                { month: 'May', users: users.length, active: users.filter(u => u.isActive).length },
            ],
            topActiveUsers: users.slice(0, 5).map(user => ({
                user,
                lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                loginCount: Math.floor(Math.random() * 100) + 10,
            })),
        };
    };

    const generateMockSystemMetrics = (): SystemMetrics => ({
        uptime: 99.5,
        responseTime: 245,
        errorRate: 0.2,
        requestsPerMinute: 150,
        memoryUsage: 68,
        cpuUsage: 45,
        diskUsage: 32,
        databaseConnections: 12,
    });

    const generateMockSecurityReport = (): SecurityReport => ({
        failedLoginAttempts: 23,
        suspiciousActivities: 5,
        blockedIPs: ['192.168.1.100', '10.0.0.50'],
        securityAlerts: [
            {
                id: '1',
                type: 'failed_login',
                message: 'Multiple failed login attempts from IP 192.168.1.100',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                severity: 'medium',
                resolved: false,
            },
            {
                id: '2',
                type: 'suspicious_activity',
                message: 'Unusual access pattern detected for user john@example.com',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                severity: 'high',
                resolved: true,
            },
        ],
    });

    const generateMockActivityReport = (): ActivityReport => ({
        totalActivities: 1250,
        activitiesByType: {
            'user_login': 450,
            'user_logout': 420,
            'user_created': 25,
            'user_updated': 180,
            'role_changed': 15,
            'settings_updated': 8,
        },
        recentActivities: [
            {
                id: '1',
                type: 'user_login',
                user: 'john@example.com',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                details: 'Successful login from Chrome browser',
            },
            {
                id: '2',
                type: 'user_created',
                user: 'admin@example.com',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                details: 'New user account created: jane@example.com',
            },
        ],
        peakActivityHours: [9, 10, 11, 14, 15, 16], // Hours with peak activity
    });

    const fetchUserAnalytics = async () => {
        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            throw new Error('Insufficient permissions to view user analytics');
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch users data
            const response = await apiClient.getUsers({ limit: 1000 });
            const analytics = generateMockUserAnalytics(response.users);
            setUserAnalytics(analytics);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch user analytics');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemMetrics = async () => {
        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            throw new Error('Insufficient permissions to view system metrics');
        }

        try {
            setLoading(true);
            setError(null);

            // In a real app, this would fetch from a monitoring API
            const metrics = generateMockSystemMetrics();
            setSystemMetrics(metrics);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch system metrics');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchSecurityReport = async () => {
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Insufficient permissions to view security reports');
        }

        try {
            setLoading(true);
            setError(null);

            // In a real app, this would fetch from a security monitoring API
            const report = generateMockSecurityReport();
            setSecurityReport(report);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch security report');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchActivityReport = async () => {
        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            throw new Error('Insufficient permissions to view activity reports');
        }

        try {
            setLoading(true);
            setError(null);

            // In a real app, this would fetch from an activity logging API
            const report = generateMockActivityReport();
            setActivityReport(report);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch activity report');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchAllReports = async () => {
        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await Promise.all([
                fetchUserAnalytics(),
                fetchSystemMetrics(),
                fetchActivityReport(),
                ...(user.role === UserRole.SUPER_ADMIN ? [fetchSecurityReport()] : []),
            ]);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (newFilters: Partial<ReportFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const exportReport = (reportType: 'users' | 'system' | 'security' | 'activity', format: 'json' | 'csv'): string => {
        let data: any = null;

        switch (reportType) {
            case 'users':
                data = userAnalytics;
                break;
            case 'system':
                data = systemMetrics;
                break;
            case 'security':
                data = securityReport;
                break;
            case 'activity':
                data = activityReport;
                break;
        }

        if (!data) {
            throw new Error(`No data available for ${reportType} report`);
        }

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else {
            // Simple CSV conversion (would need a proper CSV library in production)
            return 'CSV export not implemented yet';
        }
    };

    const scheduleReport = async (reportType: string, schedule: 'daily' | 'weekly' | 'monthly') => {
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Insufficient permissions to schedule reports');
        }

        try {
            setLoading(true);
            setError(null);

            // In a real app, this would create a scheduled job
            console.log(`Scheduling ${reportType} report to run ${schedule}`);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err: any) {
            setError(err.message || 'Failed to schedule report');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch reports when user changes or filters change
    useEffect(() => {
        if (user && (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN)) {
            fetchAllReports();
        }
    }, [user, filters]);

    const value: ReportsContextType = {
        userAnalytics,
        systemMetrics,
        securityReport,
        activityReport,
        filters,
        loading,
        error,
        fetchUserAnalytics,
        fetchSystemMetrics,
        fetchSecurityReport,
        fetchActivityReport,
        fetchAllReports,
        updateFilters,
        exportReport,
        scheduleReport,
    };

    return (
        <ReportsContext.Provider value={value}>
            {children}
        </ReportsContext.Provider>
    );
}

export function useReports() {
    const context = useContext(ReportsContext);
    if (context === undefined) {
        throw new Error('useReports must be used within a ReportsProvider');
    }
    return context;
}
