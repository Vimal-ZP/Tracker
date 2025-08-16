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
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        User Details
                    </h2>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="text-sm text-gray-500 mb-1">Your Role</div>
                            <div className="text-lg font-semibold text-gray-900">Basic User</div>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 ${user.isActive ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mb-3`}>
                                <Activity className={`w-6 h-6 ${user.isActive ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                            <div className="text-sm text-gray-500 mb-1">Account Status</div>
                            <div className="text-lg font-semibold text-gray-900">{user.isActive ? "Active" : "Inactive"}</div>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-sm text-gray-500 mb-1">Member Since</div>
                            <div className="text-lg font-semibold text-gray-900">{new Date(user.createdAt).getFullYear()}</div>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="text-sm text-gray-500 mb-1">Access Level</div>
                            <div className="text-lg font-semibold text-gray-900">Standard</div>
                        </div>
                    </div>
                </div>
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
        <div className="card">
            <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    User Statistics
                </h2>
            </div>
            <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-sm text-gray-500 mb-1">Total Users</div>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                        <div className="text-xs text-green-600 font-medium mt-1">+12%</div>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-sm text-gray-500 mb-1">Active Users</div>
                        <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
                        <div className="text-xs text-gray-600 font-medium mt-1">
                            {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total
                        </div>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                            <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-sm text-gray-500 mb-1">Admin Users</div>
                        <div className="text-2xl font-bold text-gray-900">{stats.adminUsers}</div>
                        <div className="text-xs text-gray-600 font-medium mt-1">
                            {Math.round((stats.adminUsers / stats.totalUsers) * 100)}% of total
                        </div>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                            <TrendingUp className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="text-sm text-gray-500 mb-1">Basic Users</div>
                        <div className="text-2xl font-bold text-gray-900">{stats.basicUsers}</div>
                        <div className="text-xs text-gray-600 font-medium mt-1">
                            {Math.round((stats.basicUsers / stats.totalUsers) * 100)}% of total
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
