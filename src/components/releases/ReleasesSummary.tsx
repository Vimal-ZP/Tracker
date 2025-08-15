'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { Release, ReleaseStatus } from '@/types/release';

interface ReleasesSummaryProps {
  releases: Release[];
  loading?: boolean;
  showViewAll?: boolean;
  className?: string;
}

interface ReleaseStats {
  total: number;
  draft: number;
  beta: number;
  stable: number;
  deprecated: number;
  recentReleases: Release[];
  popularReleases: Release[];
}

// Calculate release statistics
const calculateStats = (releases: Release[]): ReleaseStats => {
  const stats: ReleaseStats = {
    total: releases.length,
    draft: 0,
    beta: 0,
    stable: 0,
    deprecated: 0,
    recentReleases: [],
    popularReleases: []
  };

  releases.forEach(release => {
    // Count by status
    stats[release.status]++;


  });

  // Get recent releases (last 5, sorted by date)
  stats.recentReleases = [...releases]
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, 5);

  // Get popular releases (top 5 by most recent)
  stats.popularReleases = [...releases]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return stats;
};

// Status display configuration
const statusConfig = {
  draft: {
    icon: <Clock className="w-4 h-4" />,
    color: 'text-gray-600 bg-gray-100',
    label: 'Draft'
  },
  beta: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-yellow-600 bg-yellow-100',
    label: 'Beta'
  },
  stable: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-green-600 bg-green-100',
    label: 'Stable'
  },
  deprecated: {
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-red-600 bg-red-100',
    label: 'Deprecated'
  }
};

// Format number with K/M suffix
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Format date
const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export default function ReleasesSummary({
  releases,
  loading = false,
  showViewAll = true,
  className = ''
}: ReleasesSummaryProps) {

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Stats Cards Loading */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Releases Loading */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (releases.length === 0) {
    return (
      <div className={`text-center py-12 bg-white rounded-lg border border-gray-200 ${className}`}>
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No releases yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating your first release.
        </p>
        <div className="mt-6">
          <Link
            href="/releases/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Release
          </Link>
        </div>
      </div>
    );
  }

  const stats = calculateStats(releases);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Releases */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Releases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Stable Releases */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stable</p>
              <p className="text-2xl font-bold text-green-600">{stats.stable}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Beta Releases */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Beta</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.beta}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>


      </div>

      {/* Status Breakdown */}
      {stats.total > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Release Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = stats[status as ReleaseStatus];
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

              return (
                <div key={status} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${config.color} mb-2`}>
                    {config.icon}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500">{config.label}</p>
                  <p className="text-xs text-gray-400">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Releases */}
      {stats.recentReleases.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Releases</h3>
            {showViewAll && (
              <Link
                href="/releases"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {stats.recentReleases.map((release) => {
              const statusDisplay = statusConfig[release.status];

              return (
                <Link
                  key={release._id}
                  href={`/releases/${release._id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded ${statusDisplay.color}`}>
                      {statusDisplay.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {release.title}
                      </p>
                      {release.version && (
                        <p className="text-xs text-gray-500">
                          v{release.version}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(release.releaseDate)}
                    </p>

                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Releases */}
      {stats.popularReleases.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Latest Releases</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {stats.popularReleases.slice(0, 3).map((release, index) => (
              <Link
                key={release._id}
                href={`/releases/${release._id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {release.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      v{release.version}
                    </p>
                  </div>
                </div>


              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
