'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rolePermissions, getUserAccessibleApplications } from '@/types/user';
import { Release } from '@/types/release';
import { apiClient } from '@/lib/api';
import { Shield, BarChart3, TrendingUp, Users, Activity, RefreshCw } from 'lucide-react';
import { ReleaseCharts, ReleaseTable, ReleaseStats } from '@/components/reports';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const { user } = useAuth();
    const [releases, setReleases] = useState<Release[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'table'>('overview');

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

    useEffect(() => {
        fetchReleases();
    }, []);

    const fetchReleases = async () => {
        try {
            setLoading(true);
            const accessibleApplications = getUserAccessibleApplications(user);
            
            // Fetch all releases for the user's accessible applications
            const response = await apiClient.getReleases({
                limit: 1000, // Get all releases for reporting
                page: 1
            });
            
            setReleases(response.releases || []);
        } catch (error) {
            console.error('Error fetching releases for reports:', error);
            toast.error('Failed to load release data');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchReleases();
        setRefreshing(false);
        toast.success('Data refreshed successfully');
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: BarChart3 },
        { id: 'charts', name: 'Charts', icon: TrendingUp },
        { id: 'table', name: 'Detailed Table', icon: Activity },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Release Reports & Analytics</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Comprehensive insights into release patterns and trends
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="btn btn-secondary flex items-center space-x-2"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-96">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <ReleaseStats releases={releases} />
                        {releases.length === 0 && (
                            <div className="text-center py-12">
                                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No release data available</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Create some releases to see analytics and insights here.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'charts' && (
                    <div>
                        {releases.length > 0 ? (
                            <ReleaseCharts releases={releases} />
                        ) : (
                            <div className="text-center py-12">
                                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No data to visualize</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Charts will appear here once you have release data.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'table' && (
                    <div>
                        <ReleaseTable releases={releases} />
                    </div>
                )}
            </div>
        </div>
    );
}
