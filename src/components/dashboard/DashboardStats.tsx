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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        User Details
                    </h2>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">Your Role</p>
                                <p className="text-lg font-semibold text-gray-900">Basic User</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${user.isActive ? 'bg-green-100' : 'bg-red-100'} rounded-md flex items-center justify-center`}>
                                <Activity className={`w-5 h-5 ${user.isActive ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">Account Status</p>
                                <p className="text-lg font-semibold text-gray-900">{user.isActive ? "Active" : "Inactive"}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">Member Since</p>
                                <p className="text-lg font-semibold text-gray-900">{new Date(user.createdAt).getFullYear()}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                                <Shield className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">Access Level</p>
                                <p className="text-lg font-semibold text-gray-900">Standard</p>
                            </div>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    User Statistics
                </h2>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Total Users</p>
                            <p className="text-lg font-semibold text-gray-900">{stats.totalUsers}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                            <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Active Users</p>
                            <p className="text-lg font-semibold text-gray-900">{stats.activeUsers}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                            <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Admin Users</p>
                            <p className="text-lg font-semibold text-gray-900">{stats.adminUsers}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-md flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Basic Users</p>
                            <p className="text-lg font-semibold text-gray-900">{stats.basicUsers}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
