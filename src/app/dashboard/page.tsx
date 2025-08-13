'use client';

import React from 'react';
import { useAuth } from '@/contexts';
import { UserRole, rolePermissions } from '@/types/user';
import DashboardStats from '@/components/dashboard/DashboardStats';
import {
    Calendar,
    Clock,
    Users,
    Settings,
    BarChart3,
    Shield,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();

    if (!user) return null;

    const permissions = rolePermissions[user.role];

    const getRoleDisplayName = (role: UserRole) => {
        switch (role) {
            case UserRole.SUPER_ADMIN:
                return 'Super Administrator';
            case UserRole.ADMIN:
                return 'Administrator';
            case UserRole.BASIC:
                return 'Basic User';
            default:
                return role;
        }
    };

    const getWelcomeMessage = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const quickActions = [
        {
            title: 'Manage Users',
            description: 'Add, edit, or remove users from the system',
            icon: Users,
            href: '/users',
            color: 'bg-blue-500',
            show: permissions.canViewAllUsers,
        },
        {
            title: 'View Reports',
            description: 'Access system reports and analytics',
            icon: BarChart3,
            href: '/reports',
            color: 'bg-green-500',
            show: permissions.canViewReports,
        },
        {
            title: 'System Settings',
            description: 'Configure system settings and preferences',
            icon: Settings,
            href: '/settings',
            color: 'bg-purple-500',
            show: permissions.canManageSettings,
        },
        {
            title: 'Security Center',
            description: 'Manage security settings and permissions',
            icon: Shield,
            href: '/security',
            color: 'bg-red-500',
            show: permissions.canManageRoles,
        },
    ].filter(action => action.show);

    const recentActivities = [
        {
            id: 1,
            type: 'user_created',
            message: 'New user account created',
            time: '2 hours ago',
            icon: Users,
            color: 'text-green-600',
        },
        {
            id: 2,
            type: 'login',
            message: 'User logged in successfully',
            time: '4 hours ago',
            icon: CheckCircle,
            color: 'text-blue-600',
        },
        {
            id: 3,
            type: 'security',
            message: 'Security settings updated',
            time: '1 day ago',
            icon: Shield,
            color: 'text-purple-600',
        },
        {
            id: 4,
            type: 'alert',
            message: 'System maintenance scheduled',
            time: '2 days ago',
            icon: AlertCircle,
            color: 'text-yellow-600',
        },
    ];

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-sm flex-shrink-0">
                <div className="px-6 py-8 text-white">
                    <h1 className="text-3xl font-bold">
                        {getWelcomeMessage()}, {user.name}!
                    </h1>
                    <p className="mt-2 text-primary-100">
                        Welcome to your dashboard. You are logged in as {getRoleDisplayName(user.role)}.
                    </p>
                    <div className="mt-4 flex items-center space-x-4 text-sm text-primary-100">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date().toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="flex-shrink-0">
                <DashboardStats />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Quick Actions */}
                <div className="lg:col-span-2 flex flex-col">
                    <div className="card flex-1 flex flex-col">
                        <div className="card-header flex-shrink-0">
                            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="card-body flex-1">
                            {quickActions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                    {quickActions.map((action) => (
                                        <a
                                            key={action.title}
                                            href={action.href}
                                            className="group relative rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center"
                                        >
                                            <div className="flex items-center w-full">
                                                <div className={`flex-shrink-0 w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                                                    <action.icon className="w-6 h-6" />
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                                                        {action.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {action.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 flex-1 flex flex-col justify-center">
                                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No actions available</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Your current role doesn't have access to administrative actions.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1 flex flex-col">
                    <div className="card flex-1 flex flex-col">
                        <div className="card-header flex-shrink-0">
                            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                        </div>
                        <div className="card-body flex-1 overflow-y-auto">
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {recentActivities.map((activity, activityIdx) => (
                                        <li key={activity.id}>
                                            <div className="relative pb-8">
                                                {activityIdx !== recentActivities.length - 1 ? (
                                                    <span
                                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                        aria-hidden="true"
                                                    />
                                                ) : null}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-100`}>
                                                            <activity.icon className={`h-4 w-4 ${activity.color}`} />
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-900">
                                                                {activity.message}
                                                            </p>
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                            {activity.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
