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
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-semibold text-gray-900">
                          {release.title}
                        </div>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium ml-2 flex-shrink-0 ${release.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {release.isPublished ? (
                            <>
                              <CheckCircle className="w-2.5 h-2.5 mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <Clock className="w-2.5 h-2.5 mr-1" />
                              Draft
                            </>
                          )}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 truncate max-w-xs">
                        {release.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getApplicationColors(release.applicationName).bg} ${getApplicationColors(release.applicationName).text} border border-opacity-20`}>
                      {release.applicationName}
                    </span>
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

                      const workItemTypes = [
                        { key: 'epic', count: counts.epic, bgColor: 'bg-purple-100', iconColor: 'text-purple-600', textColor: 'text-purple-800', badgeBg: 'bg-purple-100', label: 'Epic' },
                        { key: 'feature', count: counts.feature, bgColor: 'bg-blue-100', iconColor: 'text-blue-600', textColor: 'text-blue-800', badgeBg: 'bg-blue-100', label: 'Feature' },
                        { key: 'user_story', count: counts.user_story, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', textColor: 'text-emerald-800', badgeBg: 'bg-emerald-100', label: 'Story' },
                        { key: 'bug', count: counts.bug, bgColor: 'bg-red-100', iconColor: 'text-red-600', textColor: 'text-red-800', badgeBg: 'bg-red-100', label: 'Bug' },
                        { key: 'incident', count: counts.incident, bgColor: 'bg-amber-100', iconColor: 'text-amber-600', textColor: 'text-amber-800', badgeBg: 'bg-amber-100', label: 'Incident' }
                      ].filter(item => item.count > 0);

                      return (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {workItemTypes.length > 0 ? (
                            workItemTypes.map((item) => (
                              <div key={item.key} className="flex items-center space-x-1">
                                <div className={`w-3 h-3 ${item.bgColor} rounded-sm flex items-center justify-center`}>
                                  <div className={`w-2 h-2 ${item.iconColor}`}>
                                    {getWorkItemIcon(item.key)}
                                  </div>
                                </div>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${item.badgeBg} ${item.textColor}`}>
                                  {item.count}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">None</span>
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
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onView?.(release)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => onEdit?.(release)}
                            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
                            title="Edit Release"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => onDelete?.(release._id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
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
    <div className={`space-y-4 ${className}`}>
      {releases.map((release) => (
        <div key={release._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between">
              <div className="flex-1">
                {/* Clean Header Section */}
                <div className="mb-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {release.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${release.isPublished
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
                  {/* Description below title */}
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {release.description}
                  </p>
                </div>

                {/* Compact Metadata Row */}
                <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
                  {/* Application Name - First Priority */}
                  <div className="flex items-center space-x-1.5">
                    <div className={`w-4 h-4 ${getApplicationColors(release.applicationName).gradient} rounded-sm flex items-center justify-center`}>
                      <Building className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${getApplicationColors(release.applicationName).bg} ${getApplicationColors(release.applicationName).text}`}>
                      {release.applicationName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 bg-indigo-100 rounded-sm flex items-center justify-center">
                      <Calendar className="w-2.5 h-2.5 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-900">{formatDate(release.releaseDate)}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 bg-gray-100 rounded-sm flex items-center justify-center">
                      <Tag className="w-2.5 h-2.5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-900">
                      {release.version ? `v${release.version}` : 'No version'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${getTypeColor(release.type)}`}>
                      {release.type === 'major' && '🚀'}
                      {release.type === 'minor' && '✨'}
                      {release.type === 'patch' && '🔧'}
                      {release.type === 'hotfix' && '🔥'}
                      <span className="ml-1 capitalize">{release.type}</span>
                    </span>
                  </div>

                  {release.author && (
                    <div className="flex items-center space-x-1.5">
                      <div className="w-4 h-4 bg-green-100 rounded-sm flex items-center justify-center">
                        <User className="w-2.5 h-2.5 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-900">{release.author.name}</span>
                    </div>
                  )}
                </div>

                {/* Work Items - Following Metadata Pattern */}
                {(() => {
                  const counts = getWorkItemCounts(release.workItems);
                  const totalItems = Object.values(counts).reduce((sum, count) => sum + count, 0);

                  const workItemTypes = [
                    { key: 'epic', count: counts.epic, bgColor: 'bg-purple-100', iconColor: 'text-purple-600', textColor: 'text-purple-800', badgeBg: 'bg-purple-100', label: 'Epic' },
                    { key: 'feature', count: counts.feature, bgColor: 'bg-blue-100', iconColor: 'text-blue-600', textColor: 'text-blue-800', badgeBg: 'bg-blue-100', label: 'Feature' },
                    { key: 'user_story', count: counts.user_story, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', textColor: 'text-emerald-800', badgeBg: 'bg-emerald-100', label: 'Story' },
                    { key: 'bug', count: counts.bug, bgColor: 'bg-red-100', iconColor: 'text-red-600', textColor: 'text-red-800', badgeBg: 'bg-red-100', label: 'Bug' },
                    { key: 'incident', count: counts.incident, bgColor: 'bg-amber-100', iconColor: 'text-amber-600', textColor: 'text-amber-800', badgeBg: 'bg-amber-100', label: 'Incident' }
                  ].filter(item => item.count > 0);

                  return (
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {workItemTypes.length > 0 ? (
                        workItemTypes.map((item) => (
                          <div key={item.key} className="flex items-center space-x-1.5">
                            <div className={`w-4 h-4 ${item.bgColor} rounded-sm flex items-center justify-center`}>
                              <div className={`w-2.5 h-2.5 ${item.iconColor}`}>
                                {getWorkItemIcon(item.key)}
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${item.badgeBg} ${item.textColor}`}>
                              {item.count} {item.label}{item.count > 1 ? 's' : ''}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <div className="w-4 h-4 bg-gray-100 rounded-sm flex items-center justify-center">
                            <Layers className="w-2.5 h-2.5 text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-500">No work items</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {showActions && (
                <div className="flex flex-col space-y-2 ml-4 self-start">
                  <button
                    onClick={() => onView?.(release)}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => onEdit?.(release)}
                      className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium border border-gray-300 transition-all duration-200 text-sm"
                      title="Edit Release"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => onDelete?.(release._id)}
                      className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium border border-red-300 transition-all duration-200 text-sm"
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
