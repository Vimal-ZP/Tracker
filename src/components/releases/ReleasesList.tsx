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
  MoreVertical,
  Layers,
  Zap,
  FileText,
  Bug,
  Building
} from 'lucide-react';
import { Release, ReleaseType, WorkItemType } from '@/types/release';
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

// Work item counting functions
const getWorkItemCounts = (workItems: any[] = []) => {
  const counts = {
    epic: 0,
    feature: 0,
    user_story: 0,
    bug: 0
  };

  workItems.forEach(item => {
    const type = item.type?.toLowerCase();
    if (type in counts) {
      counts[type as keyof typeof counts]++;
    }
  });

  return counts;
};

// Work item type icon mapping
const getWorkItemIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'epic':
      return <Layers className="w-3 h-3" />;
    case 'feature':
      return <Zap className="w-3 h-3" />;
    case 'user_story':
      return <FileText className="w-3 h-3" />;
    case 'bug':
      return <Bug className="w-3 h-3" />;
    default:
      return <FileText className="w-3 h-3" />;
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
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Items
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
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      {release.projectName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Tag className="w-4 h-4 text-gray-400 mr-2" />
                      {release.version ? `v${release.version}` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const counts = getWorkItemCounts(release.workItems);
                      return (
                        <div className="flex items-center space-x-3 text-xs">
                          {counts.epic > 0 && (
                            <div className="flex items-center text-purple-600">
                              {getWorkItemIcon('epic')}
                              <span className="ml-1">{counts.epic}</span>
                            </div>
                          )}
                          {counts.feature > 0 && (
                            <div className="flex items-center text-blue-600">
                              {getWorkItemIcon('feature')}
                              <span className="ml-1">{counts.feature}</span>
                            </div>
                          )}
                          {counts.user_story > 0 && (
                            <div className="flex items-center text-green-600">
                              {getWorkItemIcon('user_story')}
                              <span className="ml-1">{counts.user_story}</span>
                            </div>
                          )}
                          {counts.bug > 0 && (
                            <div className="flex items-center text-red-600">
                              {getWorkItemIcon('bug')}
                              <span className="ml-1">{counts.bug}</span>
                            </div>
                          )}
                          {Object.values(counts).every(count => count === 0) && (
                            <span className="text-gray-400">No items</span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(release.type)}`}>
                      {release.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div>{formatDate(release.releaseDate)}</div>
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
                  <div className="flex items-center text-xs text-gray-600">
                    <Building className="w-3 h-3 mr-1" />
                    <span>{release.projectName}</span>
                  </div>
                  {(() => {
                    const counts = getWorkItemCounts(release.workItems);
                    const totalItems = Object.values(counts).reduce((sum, count) => sum + count, 0);
                    return totalItems > 0 ? (
                      <div className="flex items-center space-x-2 text-xs">
                        {counts.epic > 0 && (
                          <div className="flex items-center text-purple-600">
                            {getWorkItemIcon('epic')}
                            <span className="ml-1">{counts.epic}</span>
                          </div>
                        )}
                        {counts.feature > 0 && (
                          <div className="flex items-center text-blue-600">
                            {getWorkItemIcon('feature')}
                            <span className="ml-1">{counts.feature}</span>
                          </div>
                        )}
                        {counts.user_story > 0 && (
                          <div className="flex items-center text-green-600">
                            {getWorkItemIcon('user_story')}
                            <span className="ml-1">{counts.user_story}</span>
                          </div>
                        )}
                        {counts.bug > 0 && (
                          <div className="flex items-center text-red-600">
                            {getWorkItemIcon('bug')}
                            <span className="ml-1">{counts.bug}</span>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
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
                  <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    <Building className="w-4 h-4 mr-1" />
                    <span>{release.projectName}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {release.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(release.releaseDate)}</span>
                  </div>

                  {release.version && (
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      <span>v{release.version}</span>
                    </div>
                  )}

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

                {/* Work Items Summary */}
                {(() => {
                  const counts = getWorkItemCounts(release.workItems);
                  const totalItems = Object.values(counts).reduce((sum, count) => sum + count, 0);
                  return totalItems > 0 ? (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-500 font-medium">Work Items:</span>
                        {counts.epic > 0 && (
                          <div className="flex items-center text-purple-600">
                            {getWorkItemIcon('epic')}
                            <span className="ml-1 font-medium">{counts.epic}</span>
                            <span className="ml-1 text-gray-500">Epic{counts.epic > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {counts.feature > 0 && (
                          <div className="flex items-center text-blue-600">
                            {getWorkItemIcon('feature')}
                            <span className="ml-1 font-medium">{counts.feature}</span>
                            <span className="ml-1 text-gray-500">Feature{counts.feature > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {counts.user_story > 0 && (
                          <div className="flex items-center text-green-600">
                            {getWorkItemIcon('user_story')}
                            <span className="ml-1 font-medium">{counts.user_story}</span>
                            <span className="ml-1 text-gray-500">User Stor{counts.user_story > 1 ? 'ies' : 'y'}</span>
                          </div>
                        )}
                        {counts.bug > 0 && (
                          <div className="flex items-center text-red-600">
                            {getWorkItemIcon('bug')}
                            <span className="ml-1 font-medium">{counts.bug}</span>
                            <span className="ml-1 text-gray-500">Bug{counts.bug > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-400">
                        <span>No work items</span>
                      </div>
                    </div>
                  );
                })()}
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
