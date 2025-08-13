'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { UserRole, rolePermissions } from '@/types/user';
import { apiClient } from '@/lib/api';
import StatsCard from './StatsCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Users, Shield, Activity, TrendingUp } from 'lucide-react';

interface DashboardStatsData {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    basicUsers: number;
}

export default function DashboardStats() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && rolePermissions[user.role].canViewAllUsers) {
            fetchStats();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            // Fetch all users to calculate stats
            const response = await apiClient.getUsers({ limit: 1000 });
            const users = response.users;

            const statsData: DashboardStatsData = {
                totalUsers: users.length,
                activeUsers: users.filter(u => u.isActive).length,
                adminUsers: users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN).length,
                basicUsers: users.filter(u => u.role === UserRole.BASIC).length,
            };

            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const permissions = rolePermissions[user.role];

    // Basic users see limited stats
    if (user.role === UserRole.BASIC) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Your Role"
                    value="Basic User"
                    icon={Users}
                    color="green"
                />
                <StatsCard
                    title="Account Status"
                    value={user.isActive ? "Active" : "Inactive"}
                    icon={Activity}
                    color={user.isActive ? "green" : "red"}
                />
                <StatsCard
                    title="Member Since"
                    value={new Date(user.createdAt).getFullYear()}
                    icon={TrendingUp}
                    color="blue"
                />
                <StatsCard
                    title="Access Level"
                    value="Standard"
                    icon={Shield}
                    color="purple"
                />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!stats || !permissions.canViewAllUsers) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No statistics available</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Total Users"
                value={stats.totalUsers}
                change={{
                    value: "+12%",
                    type: "increase"
                }}
                icon={Users}
                color="blue"
            />
            <StatsCard
                title="Active Users"
                value={stats.activeUsers}
                change={{
                    value: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`,
                    type: "neutral"
                }}
                icon={Activity}
                color="green"
            />
            <StatsCard
                title="Admin Users"
                value={stats.adminUsers}
                icon={Shield}
                color="purple"
            />
            <StatsCard
                title="Basic Users"
                value={stats.basicUsers}
                icon={TrendingUp}
                color="yellow"
            />
        </div>
    );
}
