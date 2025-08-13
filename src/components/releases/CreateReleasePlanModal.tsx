'use client';

import React, { useState } from 'react';
import { Project, CreateReleasePlanData, ReleasePlanPriority } from '@/types/project';
import { X } from 'lucide-react';

interface CreateReleasePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReleasePlanData) => void;
  projects: Project[];
  loading?: boolean;
}

export default function CreateReleasePlanModal({
  isOpen,
  onClose,
  onSubmit,
  projects,
  loading = false
}: CreateReleasePlanModalProps) {
  const [formData, setFormData] = useState<Partial<CreateReleasePlanData>>({
    priority: ReleasePlanPriority.MEDIUM
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.plannedDate || !formData.version || !formData.title) {
      return;
    }

    onSubmit(formData as CreateReleasePlanData);
    
    // Reset form
    setFormData({
      priority: ReleasePlanPriority.MEDIUM
    });
  };

  const handleClose = () => {
    setFormData({
      priority: ReleasePlanPriority.MEDIUM
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose} />

        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Create Release Plan</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                value={formData.projectId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                className="input w-full"
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name} ({project.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Planned Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planned Date *
              </label>
              <input
                type="date"
                value={formData.plannedDate ? new Date(formData.plannedDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, plannedDate: new Date(e.target.value) }))}
                className="input w-full"
                required
              />
            </div>

            {/* Version */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version *
              </label>
              <input
                type="text"
                value={formData.version || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="e.g., 1.0.0"
                className="input w-full"
                required
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Release title"
                className="input w-full"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Release description"
                rows={3}
                className="input w-full"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority || ReleasePlanPriority.MEDIUM}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as ReleasePlanPriority }))}
                className="input w-full"
              >
                {Object.values(ReleasePlanPriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}