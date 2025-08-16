'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Eye,
  Edit,
  Trash2,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Package,
  User,
  MoreVertical
} from 'lucide-react';
import { Release, ReleaseStatus, ReleaseType } from '@/types/release';
import { UserRole } from '@/types/user';

interface ReleasesListProps {
  releases: Release[];
  loading?: boolean;
  viewMode?: 'card' | 'table' | 'compact';
  showActions?: boolean;
  userRole?: UserRole;
  onEdit?: (release: Release) => void;
  onDelete?: (releaseId: string) => void;
  onView?: (release: Release) => void;
  className?: string;
}

// Status color mapping
const getStatusColor = (status: ReleaseStatus): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'beta':
      return 'bg-yellow-100 text-yellow-800';
    case 'stable':
      return 'bg-green-100 text-green-800';
    case 'deprecated':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Status icon mapping
const getStatusIcon = (status: ReleaseStatus) => {
  switch (status) {
    case 'draft':
      return <Clock className="w-3 h-3" />;
    case 'beta':
      return <AlertCircle className="w-3 h-3" />;
    case 'stable':
      return <CheckCircle className="w-3 h-3" />;
    case 'deprecated':
      return <XCircle className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};

// Type color mapping
const getTypeColor = (type: ReleaseType): string => {
  switch (type) {
    case 'major':
      return 'bg-purple-100 text-purple-800';
    case 'minor':
      return 'bg-blue-100 text-blue-800';
    case 'patch':
      return 'bg-green-100 text-green-800';
    case 'hotfix':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const releaseDate = new Date(date);
  const diffInDays = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

export default function ReleasesList({
  releases,
  loading = false,
  viewMode = 'card',
  showActions = true,
  userRole,
  onEdit,
  onDelete,
  onView,
  className = ''
}: ReleasesListProps) {
  const canEdit = userRole === 'super_admin' || userRole === 'admin';
  const canDelete = userRole === 'super_admin';

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (releases.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No releases found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {canEdit ? 'Get started by creating a new release.' : 'No releases available at the moment.'}
        </p>
      </div>
    );
  }

  // Table View
  if (viewMode === 'table') {
    return (
      <div className={`card ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Release
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {showActions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {releases.map((release) => (
                <tr key={release._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {release.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {release.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Tag className="w-4 h-4 text-gray-400 mr-2" />
                      {release.version ? `v${release.version}` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                      {getStatusIcon(release.status)}
                      <span className="ml-1 capitalize">{release.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(release.type)}`}>
                      {release.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div>{formatDate(release.releaseDate)}</div>
                        <div className="text-xs text-gray-500">
                          {formatRelativeTime(release.releaseDate)}
                        </div>
                      </div>
                    </div>
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onView?.(release)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => onEdit?.(release)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="Edit Release"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => onDelete?.(release._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Release"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Compact View
  if (viewMode === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        {releases.map((release) => (
          <div key={release._id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {release.title}
                  </h3>
                  <span className="text-xs text-gray-500">v{release.version}</span>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(release.status)}`}>
                    {getStatusIcon(release.status)}
                    <span className="ml-1 capitalize">{release.status}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(release.releaseDate)}
                  </span>

                </div>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center space-x-1 ml-4">
                <button
                  onClick={() => onView?.(release)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {canEdit && (
                  <button
                    onClick={() => onEdit?.(release)}
                    className="text-gray-600 hover:text-gray-900 p-1"
                    title="Edit Release"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={() => onDelete?.(release._id)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Delete Release"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Card View (Default)
  return (
    <div className={`space-y-4 ${className}`}>
      {releases.map((release) => (
        <div key={release._id} className="card hover:shadow-lg transition-shadow">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {release.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                    {getStatusIcon(release.status)}
                    <span className="ml-1 capitalize">{release.status}</span>
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {release.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {release.version && (
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      <span>v{release.version}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(release.releaseDate)}</span>
                  </div>

                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(release.type)}`}>
                    {release.type}
                  </span>

                  {release.author && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{release.author.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {showActions && (
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onView?.(release)}
                    className="btn btn-sm btn-secondary flex items-center space-x-1"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => onEdit?.(release)}
                      className="btn btn-sm btn-secondary flex items-center space-x-1"
                      title="Edit Release"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => onDelete?.(release._id)}
                      className="btn btn-sm btn-danger flex items-center space-x-1"
                      title="Delete Release"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
