'use client';

import React from 'react';
import { Release, ReleaseType } from '@/types/release';
import { 
  Package, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  Building,
  Tag,
  Clock,
  BarChart3
} from 'lucide-react';

interface ReleaseStatsProps {
  releases: Release[];
}

export default function ReleaseStats({ releases }: ReleaseStatsProps) {
  // Calculate statistics
  const totalReleases = releases.length;
  const publishedReleases = releases.filter(r => r.isPublished).length;
  const unpublishedReleases = totalReleases - publishedReleases;
  
  // Releases by type
  const releasesByType = releases.reduce((acc, release) => {
    acc[release.type] = (acc[release.type] || 0) + 1;
    return acc;
  }, {} as Record<ReleaseType, number>);

  // Releases by application
  const releasesByApplication = releases.reduce((acc, release) => {
    acc[release.applicationName] = (acc[release.applicationName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueApplications = Object.keys(releasesByApplication).length;
  const mostActiveApplication = Object.entries(releasesByApplication)
    .sort(([,a], [,b]) => b - a)[0];

  // Recent releases (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentReleases = releases.filter(r => new Date(r.releaseDate) >= thirtyDaysAgo).length;

  // Average releases per month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const releasesLast6Months = releases.filter(r => new Date(r.releaseDate) >= sixMonthsAgo).length;
  const avgReleasesPerMonth = Math.round(releasesLast6Months / 6 * 10) / 10;

  const stats = [
    {
      title: 'Total Releases',
      value: totalReleases.toString(),
      icon: Package,
      color: 'bg-blue-500',
      description: 'All time releases'
    },
    {
      title: 'Published',
      value: publishedReleases.toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
      description: `${unpublishedReleases} in draft`
    },
    {
      title: 'Applications',
      value: uniqueApplications.toString(),
      icon: Building,
      color: 'bg-purple-500',
      description: mostActiveApplication ? `${mostActiveApplication[0]} leads` : 'No releases yet'
    },
    {
      title: 'Recent Activity',
      value: recentReleases.toString(),
      icon: Clock,
      color: 'bg-orange-500',
      description: 'Last 30 days'
    },
    {
      title: 'Monthly Average',
      value: avgReleasesPerMonth.toString(),
      icon: TrendingUp,
      color: 'bg-indigo-500',
      description: 'Last 6 months'
    },
    {
      title: 'Major Releases',
      value: (releasesByType[ReleaseType.MAJOR] || 0).toString(),
      icon: Tag,
      color: 'bg-red-500',
      description: `${(releasesByType[ReleaseType.MINOR] || 0)} minor releases`
    }
  ];

  // Release type breakdown
  const typeBreakdown = [
    {
      type: 'Major',
      count: releasesByType[ReleaseType.MAJOR] || 0,
      color: 'bg-red-500',
      percentage: totalReleases > 0 ? Math.round(((releasesByType[ReleaseType.MAJOR] || 0) / totalReleases) * 100) : 0
    },
    {
      type: 'Minor',
      count: releasesByType[ReleaseType.MINOR] || 0,
      color: 'bg-yellow-500',
      percentage: totalReleases > 0 ? Math.round(((releasesByType[ReleaseType.MINOR] || 0) / totalReleases) * 100) : 0
    },
    {
      type: 'Patch',
      count: releasesByType[ReleaseType.PATCH] || 0,
      color: 'bg-green-500',
      percentage: totalReleases > 0 ? Math.round(((releasesByType[ReleaseType.PATCH] || 0) / totalReleases) * 100) : 0
    },
    {
      type: 'Hotfix',
      count: releasesByType[ReleaseType.HOTFIX] || 0,
      color: 'bg-blue-500',
      percentage: totalReleases > 0 ? Math.round(((releasesByType[ReleaseType.HOTFIX] || 0) / totalReleases) * 100) : 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Release Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Release Type Distribution
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {typeBreakdown.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                    <span className="text-sm font-medium text-gray-900">{item.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    <span className="text-xs text-gray-500">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Applications */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Top Applications
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {Object.entries(releasesByApplication)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([app, count], index) => (
                  <div key={app} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{app}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count} releases</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(count / Math.max(...Object.values(releasesByApplication))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              {Object.keys(releasesByApplication).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No applications found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
