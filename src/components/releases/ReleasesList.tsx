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
  Building,
  AlertTriangle
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
    bug: 0,
    incident: 0
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
    case 'incident':
      return <AlertTriangle className="w-3 h-3" />;
    default:
      return <FileText className="w-3 h-3" />;
  }
};

// Enhanced type color mapping with gradients
const getTypeColor = (type: ReleaseType): string => {
  switch (type) {
    case 'major':
      return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md';
    case 'minor':
      return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md';
    case 'patch':
      return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md';
    case 'hotfix':
      return 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md';
  }
};

// Application color mapping (similar to reports table)
const getApplicationColors = (applicationName: string) => {
  const colorMap: Record<string, { bg: string; text: string; gradient: string }> = {
    'NRE': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    'NVE': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    'E-Vite': {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    'Portal Plus': {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
    },
    'Fast 2.0': {
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-600'
    },
    'FMS': {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    }
  };

  return colorMap[applicationName] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    gradient: 'bg-gradient-to-br from-gray-500 to-gray-600'
  };
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

  // Enhanced Professional Table View
  if (viewMode === 'table') {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Release</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>Application</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>Version</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Work Items</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Type</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Date</span>
                  </div>
                </th>
                {showActions && (
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {releases.map((release, index) => (
                <tr key={release._id} className="hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {release.title}
                        </div>
                        <div className="text-sm text-gray-600 truncate max-w-xs">
                          {release.description}
                        </div>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            release.isPublished 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {release.isPublished ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Draft
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${getApplicationColors(release.applicationName).gradient} rounded-lg flex items-center justify-center shadow-sm`}>
                        <Building className="w-4 h-4 text-white" />
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getApplicationColors(release.applicationName).bg} ${getApplicationColors(release.applicationName).text} border border-opacity-20`}>
                        {release.applicationName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Tag className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {release.version ? `v${release.version}` : (
                          <span className="text-gray-400 italic">No version</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {(() => {
                      const counts = getWorkItemCounts(release.workItems);
                      const totalItems = Object.values(counts).reduce((sum, count) => sum + count, 0);
                      return (
                        <div className="flex items-center space-x-3">
                          {totalItems > 0 ? (
                            <>
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600">{totalItems}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs">
                                {counts.epic > 0 && (
                                  <div className="flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                    {getWorkItemIcon('epic')}
                                    <span className="ml-1 font-medium">{counts.epic}</span>
                                  </div>
                                )}
                                {counts.feature > 0 && (
                                  <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                    {getWorkItemIcon('feature')}
                                    <span className="ml-1 font-medium">{counts.feature}</span>
                                  </div>
                                )}
                                {counts.user_story > 0 && (
                                  <div className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                    {getWorkItemIcon('user_story')}
                                    <span className="ml-1 font-medium">{counts.user_story}</span>
                                  </div>
                                )}
                                {counts.bug > 0 && (
                                  <div className="flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                    {getWorkItemIcon('bug')}
                                    <span className="ml-1 font-medium">{counts.bug}</span>
                                  </div>
                                )}
                                {counts.incident > 0 && (
                                  <div className="flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                    {getWorkItemIcon('incident')}
                                    <span className="ml-1 font-medium">{counts.incident}</span>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center space-x-2 text-gray-400">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs">0</span>
                              </div>
                              <span className="text-sm">No work items</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${getTypeColor(release.type)}`}>
                      {release.type === 'major' && '🚀'}
                      {release.type === 'minor' && '✨'}
                      {release.type === 'patch' && '🔧'}
                      {release.type === 'hotfix' && '🔥'}
                      <span className="ml-1 capitalize">{release.type}</span>
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{formatDate(release.releaseDate)}</div>
                        <div className="text-xs text-gray-500">
                          {release.author?.name && `by ${release.author.name}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  {showActions && (
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onView?.(release)}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => onEdit?.(release)}
                            className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            title="Edit Release"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => onDelete?.(release._id)}
                            className="inline-flex items-center px-3 py-2 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                            title="Delete Release"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
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
                    <span>{release.applicationName}</span>
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
                        {counts.incident > 0 && (
                          <div className="flex items-center text-orange-600">
                            {getWorkItemIcon('incident')}
                            <span className="ml-1">{counts.incident}</span>
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

  // Enhanced Professional Card View (Default)
  return (
    <div className={`space-y-6 ${className}`}>
      {releases.map((release) => (
        <div key={release._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header Section */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {release.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        release.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {release.isPublished ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Draft
                          </>
                        )}
                      </span>
                    </div>
                    
                    {/* Application Badge */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-6 h-6 ${getApplicationColors(release.applicationName).gradient} rounded-lg flex items-center justify-center`}>
                        <Building className="w-3 h-3 text-white" />
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getApplicationColors(release.applicationName).bg} ${getApplicationColors(release.applicationName).text} border border-opacity-20`}>
                        {release.applicationName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 text-base leading-relaxed line-clamp-3">
                  {release.description}
                </p>

                {/* Enhanced Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Release Date</div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(release.releaseDate)}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Tag className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Version</div>
                      <div className="text-sm font-medium text-gray-900">
                        {release.version ? `v${release.version}` : 'No version'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Type</div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${getTypeColor(release.type)}`}>
                        {release.type === 'major' && '🚀'}
                        {release.type === 'minor' && '✨'}
                        {release.type === 'patch' && '🔧'}
                        {release.type === 'hotfix' && '🔥'}
                        <span className="ml-1 capitalize">{release.type}</span>
                      </span>
                    </div>
                  </div>

                  {release.author && (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Author</div>
                        <div className="text-sm font-medium text-gray-900">{release.author.name}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Work Items Summary */}
                {(() => {
                  const counts = getWorkItemCounts(release.workItems);
                  const totalItems = Object.values(counts).reduce((sum, count) => sum + count, 0);
                  return (
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Layers className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">Work Items</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{totalItems}</span>
                      </div>
                      
                      {totalItems > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {counts.epic > 0 && (
                            <div className="flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                              {getWorkItemIcon('epic')}
                              <span className="ml-1">{counts.epic} Epic{counts.epic > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {counts.feature > 0 && (
                            <div className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                              {getWorkItemIcon('feature')}
                              <span className="ml-1">{counts.feature} Feature{counts.feature > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {counts.user_story > 0 && (
                            <div className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                              {getWorkItemIcon('user_story')}
                              <span className="ml-1">{counts.user_story} User Stor{counts.user_story > 1 ? 'ies' : 'y'}</span>
                            </div>
                          )}
                          {counts.bug > 0 && (
                            <div className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                              {getWorkItemIcon('bug')}
                              <span className="ml-1">{counts.bug} Bug{counts.bug > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {counts.incident > 0 && (
                            <div className="flex items-center px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
                              {getWorkItemIcon('incident')}
                              <span className="ml-1">{counts.incident} Incident{counts.incident > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <span className="text-sm text-gray-500">No work items assigned</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {showActions && (
                <div className="flex flex-col space-y-3 ml-6">
                  <button
                    onClick={() => onView?.(release)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => onEdit?.(release)}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium border border-gray-300 transition-all duration-200 hover:shadow-md"
                      title="Edit Release"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => onDelete?.(release._id)}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium border border-red-300 transition-all duration-200 hover:shadow-md"
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
