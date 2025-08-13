'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rolePermissions } from '@/types/user';
import { Shield, BarChart3, TrendingUp, Users, Activity } from 'lucide-react';

export default function ReportsPage() {
    const { user } = useAuth();

    if (!user) return null;

    const permissions = rolePermissions[user.role];

    if (!permissions.canViewReports) {
        return (
            <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
                <p className="mt-1 text-sm text-gray-500">
                    You don't have permission to view reports.
                </p>
            </div>
        );
    }

    const reportCards = [
        {
            title: 'User Analytics',
            description: 'Detailed analytics about user behavior and engagement',
            icon: Users,
            color: 'bg-blue-500',
            stats: '1,234 total users',
        },
        {
            title: 'Activity Reports',
            description: 'System activity and usage patterns',
            icon: Activity,
            color: 'bg-green-500',
            stats: '89% uptime',
        },
        {
            title: 'Growth Metrics',
            description: 'User growth and retention metrics',
            icon: TrendingUp,
            color: 'bg-purple-500',
            stats: '+12% this month',
        },
        {
            title: 'Performance Data',
            description: 'System performance and optimization insights',
            icon: BarChart3,
            color: 'bg-red-500',
            stats: '2.3s avg response',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {reportCards.map((report) => (
                    <div key={report.title} className="card hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="card-body">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 w-12 h-12 ${report.color} rounded-lg flex items-center justify-center text-white`}>
                                    <report.icon className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {report.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {report.description}
                                    </p>
                                    <p className="text-sm font-medium text-primary-600 mt-2">
                                        {report.stats}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
                </div>
                <div className="card-body">
                    <div className="text-center py-12">
                        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No reports available</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Reports will appear here once data is available.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
