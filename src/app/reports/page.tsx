'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rolePermissions, getUserAccessibleApplications } from '@/types/user';
import { Release } from '@/types/release';
import { apiClient } from '@/lib/api';
import { Shield, BarChart3, Activity, RefreshCw } from 'lucide-react';
import { ReleaseCharts, ReleaseTable, ReleaseStats } from '@/components/reports';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const { user } = useAuth();
    const [releases, setReleases] = useState<Release[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);


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



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Professional Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
                <div className="p-4">
                    <div className="flex justify-between items-center">
                        {/* Left Section - Title and Icon */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Release Reports & Analytics</h1>
                                <p className="text-sm text-gray-600">Comprehensive insights into release patterns and trends</p>
                            </div>
                        </div>

                        {/* Right Section - Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh Data</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Consolidated Content */}
            <div className="flex-1 space-y-6">
                {releases.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No release data available</h3>
                            <p className="text-sm text-gray-500">
                                Create some releases to see comprehensive analytics and insights here.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Statistics Overview */}
                        <ReleaseStats releases={releases} />
                        
                        {/* Visual Charts */}
                        <ReleaseCharts releases={releases} />
                        
                        {/* Detailed Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                        <Activity className="w-4 h-4 text-gray-600" />
                                    </div>
                                    Detailed Release Table
                                </h3>
                            </div>
                            <div className="p-4">
                                <ReleaseTable releases={releases} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
