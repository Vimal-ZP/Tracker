'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Package,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Release, ReleaseStatus, ReleaseType } from '@/types/release';

interface ReleasesListSimpleProps {
  releases: Release[];
  loading?: boolean;
  showDescription?: boolean;
  showStats?: boolean;
  maxItems?: number;
  className?: string;
}

// Status color and icon mapping
const getStatusDisplay = (status: ReleaseStatus) => {
  switch (status) {
    case 'draft':
      return {
        color: 'text-gray-600 bg-gray-100',
        icon: <Clock className="w-3 h-3" />,
        label: 'Draft'
      };
    case 'beta':
      return {
        color: 'text-yellow-600 bg-yellow-100',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Beta'
      };
    case 'stable':
      return {
        color: 'text-green-600 bg-green-100',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Stable'
      };
    case 'deprecated':
      return {
        color: 'text-red-600 bg-red-100',
        icon: <XCircle className="w-3 h-3" />,
        label: 'Deprecated'
      };
    default:
      return {
        color: 'text-gray-600 bg-gray-100',
        icon: <Clock className="w-3 h-3" />,
        label: 'Unknown'
      };
  }
};

// Type color mapping
const getTypeColor = (type: ReleaseType): string => {
  switch (type) {
    case 'major':
      return 'text-purple-600 bg-purple-100';
    case 'minor':
      return 'text-blue-600 bg-blue-100';
    case 'patch':
      return 'text-green-600 bg-green-100';
    case 'hotfix':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Format date
const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format relative time
const getRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const releaseDate = new Date(date);
  const diffInDays = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
  return `${Math.floor(diffInDays / 365)}y ago`;
};

export default function ReleasesListSimple({
  releases,
  loading = false,
  showDescription = true,
  showStats = true,
  maxItems,
  className = ''
}: ReleasesListSimpleProps) {

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (releases.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Package className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No releases found</p>
      </div>
    );
  }

  const displayReleases = maxItems ? releases.slice(0, maxItems) : releases;

  return (
    <div className={`space-y-3 ${className}`}>
      {displayReleases.map((release) => {
        const statusDisplay = getStatusDisplay(release.status);

        return (
          <div key={release._id} className="group">
            <Link
              href={`/releases/${release._id}`}
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and Version */}
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {release.title}
                    </h3>
                    {release.version && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        <Tag className="w-3 h-3 mr-1" />
                        v{release.version}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {showDescription && release.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {release.description}
                    </p>
                  )}

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {/* Status */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${statusDisplay.color}`}>
                      {statusDisplay.icon}
                      <span className="ml-1">{statusDisplay.label}</span>
                    </span>

                    {/* Type */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium ${getTypeColor(release.type)}`}>
                      {release.type}
                    </span>

                    {/* Date */}
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(release.releaseDate)}
                      <span className="ml-1 text-gray-400">
                        ({getRelativeTime(release.releaseDate)})
                      </span>
                    </span>


                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        );
      })}

      {/* Show more link if there are more items */}
      {maxItems && releases.length > maxItems && (
        <div className="text-center pt-2">
          <Link
            href="/releases"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all {releases.length} releases →
          </Link>
        </div>
      )}
    </div>
  );
}
