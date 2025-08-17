'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Release, ReleaseType } from '@/types/release';
import { BarChart3, Package, TrendingUp, CheckCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ReleaseChartsProps {
  releases: Release[];
}

export default function ReleaseCharts({ releases }: ReleaseChartsProps) {
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Releases by Application
  const releasesByApplication = releases.reduce((acc, release) => {
    acc[release.applicationName] = (acc[release.applicationName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const applicationChartData = {
    labels: Object.keys(releasesByApplication),
    datasets: [
      {
        label: 'Number of Releases',
        data: Object.values(releasesByApplication),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Releases by Type
  const releasesByType = releases.reduce((acc, release) => {
    acc[release.type] = (acc[release.type] || 0) + 1;
    return acc;
  }, {} as Record<ReleaseType, number>);

  const typeChartData = {
    labels: Object.keys(releasesByType).map(type => {
      switch (type) {
        case ReleaseType.MAJOR: return 'Major';
        case ReleaseType.MINOR: return 'Minor';
        case ReleaseType.PATCH: return 'Patch';
        case ReleaseType.HOTFIX: return 'Hotfix';
        default: return type;
      }
    }),
    datasets: [
      {
        data: Object.values(releasesByType),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Major - Red
          'rgba(245, 158, 11, 0.8)',  // Minor - Orange
          'rgba(16, 185, 129, 0.8)',  // Patch - Green
          'rgba(59, 130, 246, 0.8)',  // Hotfix - Blue
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Releases Timeline (last 6 months)
  const getMonthlyReleases = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: date.getMonth(),
        year: date.getFullYear()
      });
    }

    const monthlyData = months.map(month => {
      return releases.filter(release => {
        const releaseDate = new Date(release.releaseDate);
        return releaseDate.getMonth() === month.value && releaseDate.getFullYear() === month.year;
      }).length;
    });

    return {
      labels: months.map(m => m.label),
      data: monthlyData
    };
  };

  const timelineData = getMonthlyReleases();
  const timelineChartData = {
    labels: timelineData.labels,
    datasets: [
      {
        label: 'Releases',
        data: timelineData.data,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Published vs Unpublished
  const publishedCount = releases.filter(r => r.isPublished).length;
  const unpublishedCount = releases.length - publishedCount;

  const publishStatusData = {
    labels: ['Published', 'Unpublished'],
    datasets: [
      {
        data: [publishedCount, unpublishedCount],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',  // Published - Green
          'rgba(156, 163, 175, 0.8)', // Unpublished - Gray
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Releases by Application */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              Releases by Application
            </h3>
          </div>
          <div className="p-4">
            <div className="h-64">
              <Bar data={applicationChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Releases by Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mr-3">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              Releases by Type
            </h3>
          </div>
          <div className="p-4">
            <div className="h-64">
              <Pie data={typeChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Release Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center mr-3">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              Release Timeline (Last 6 Months)
            </h3>
          </div>
          <div className="p-4">
            <div className="h-64">
              <Line data={timelineChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Published Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mr-3">
                <CheckCircle className="w-4 h-4 text-purple-600" />
              </div>
              Publication Status
            </h3>
          </div>
          <div className="p-4">
            <div className="h-64">
              <Pie data={publishStatusData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
