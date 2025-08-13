'use client';

import React from 'react';
import { ReleasePlan, ReleasePlanStatus, ReleasePlanPriority } from '@/types/project';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Target,
  Users,
  Zap,
  Package,
  AlertTriangle
} from 'lucide-react';

interface ReleasePlanGridProps {
  releasePlans: ReleasePlan[];
  loading: boolean;
}

export default function ReleasePlanGrid({ releasePlans, loading }: ReleasePlanGridProps) {
  const getStatusIcon = (status: ReleasePlanStatus) => {
    switch (status) {
      case ReleasePlanStatus.PLANNED:
        return <Clock className="w-4 h-4 text-blue-500" />;
      case ReleasePlanStatus.IN_PROGRESS:
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case ReleasePlanStatus.TESTING:
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case ReleasePlanStatus.READY:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case ReleasePlanStatus.RELEASED:
        return <Package className="w-4 h-4 text-purple-500" />;
      case ReleasePlanStatus.CANCELLED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ReleasePlanStatus) => {
    switch (status) {
      case ReleasePlanStatus.PLANNED:
        return 'bg-blue-100 text-blue-800';
      case ReleasePlanStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case ReleasePlanStatus.TESTING:
        return 'bg-orange-100 text-orange-800';
      case ReleasePlanStatus.READY:
        return 'bg-green-100 text-green-800';
      case ReleasePlanStatus.RELEASED:
        return 'bg-purple-100 text-purple-800';
      case ReleasePlanStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ReleasePlanPriority) => {
    switch (priority) {
      case ReleasePlanPriority.LOW:
        return 'bg-gray-100 text-gray-800';
      case ReleasePlanPriority.MEDIUM:
        return 'bg-blue-100 text-blue-800';
      case ReleasePlanPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case ReleasePlanPriority.CRITICAL:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: ReleasePlanPriority) => {
    switch (priority) {
      case ReleasePlanPriority.CRITICAL:
        return <AlertTriangle className="w-3 h-3" />;
      case ReleasePlanPriority.HIGH:
        return <Target className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const isOverdue = (plannedDate: Date, status: ReleasePlanStatus) => {
    const now = new Date();
    const planned = new Date(plannedDate);
    return planned < now && status !== ReleasePlanStatus.RELEASED && status !== ReleasePlanStatus.CANCELLED;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (releasePlans.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No release plans found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create your first release plan to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {releasePlans.map((plan) => (
        <div
          key={plan._id}
          className={`card hover:shadow-lg transition-shadow ${
            isOverdue(plan.plannedDate, plan.status) ? 'border-red-200 bg-red-50' : ''
          }`}
        >
          <div className="card-body">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{plan.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="font-medium">{plan.project.code}</span>
                  <span>•</span>
                  <span>v{plan.version}</span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                  {getStatusIcon(plan.status)}
                  <span className="ml-1">{plan.status}</span>
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(plan.priority)}`}>
                  {getPriorityIcon(plan.priority)}
                  <span className={getPriorityIcon(plan.priority) ? 'ml-1' : ''}>{plan.priority}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            {plan.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {plan.description}
              </p>
            )}

            {/* Planned Date */}
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(plan.plannedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              {isOverdue(plan.plannedDate, plan.status) && (
                <span className="text-xs text-red-600 font-medium">Overdue</span>
              )}
            </div>

            {/* Assigned To */}
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{plan.assignedTo.name}</span>
            </div>

            {/* Effort */}
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{plan.estimatedEffort}h estimated</span>
            </div>

            {/* Features Count */}
            {plan.features.length > 0 && (
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {plan.features.length} feature{plan.features.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Dependencies & Risks */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {plan.dependencies.length > 0 && (
                  <span>{plan.dependencies.length} dependencies</span>
                )}
                {plan.risks.length > 0 && (
                  <span className="text-orange-600">{plan.risks.length} risks</span>
                )}
              </div>
              <span>
                Created {new Date(plan.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
