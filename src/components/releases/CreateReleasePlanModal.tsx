'use client';

import React, { useState } from 'react';
import { Project, CreateReleasePlanData, ReleasePlanPriority } from '@/types/project';
import { X, Plus, Trash2 } from 'lucide-react';

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
    priority: ReleasePlanPriority.MEDIUM,
    features: [],
    dependencies: [],
    risks: []
  });
  const [newFeature, setNewFeature] = useState('');
  const [newDependency, setNewDependency] = useState('');
  const [newRisk, setNewRisk] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.plannedDate || !formData.version || !formData.title || !formData.estimatedEffort) {
      return;
    }

    onSubmit(formData as CreateReleasePlanData);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const addDependency = () => {
    if (newDependency.trim()) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...(prev.dependencies || []), newDependency.trim()]
      }));
      setNewDependency('');
    }
  };

  const removeDependency = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies?.filter((_, i) => i !== index) || []
    }));
  };

  const addRisk = () => {
    if (newRisk.trim()) {
      setFormData(prev => ({
        ...prev,
        risks: [...(prev.risks || []), newRisk.trim()]
      }));
      setNewRisk('');
    }
  };

  const removeRisk = (index: number) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks?.filter((_, i) => i !== index) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Create Release Plan</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

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

            {/* Priority and Effort */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Effort (hours) *
                </label>
                <input
                  type="number"
                  value={formData.estimatedEffort || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedEffort: Number(e.target.value) }))}
                  placeholder="Hours"
                  min="1"
                  max="10000"
                  className="input w-full"
                  required
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    className="input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="btn btn-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.features && formData.features.length > 0 && (
                  <div className="space-y-1">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dependencies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dependencies
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newDependency}
                    onChange={(e) => setNewDependency(e.target.value)}
                    placeholder="Add a dependency"
                    className="input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDependency())}
                  />
                  <button
                    type="button"
                    onClick={addDependency}
                    className="btn btn-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.dependencies && formData.dependencies.length > 0 && (
                  <div className="space-y-1">
                    {formData.dependencies.map((dependency, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm">{dependency}</span>
                        <button
                          type="button"
                          onClick={() => removeDependency(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Risks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risks
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value)}
                    placeholder="Add a risk"
                    className="input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRisk())}
                  />
                  <button
                    type="button"
                    onClick={addRisk}
                    className="btn btn-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.risks && formData.risks.length > 0 && (
                  <div className="space-y-1">
                    {formData.risks.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm">{risk}</span>
                        <button
                          type="button"
                          onClick={() => removeRisk(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
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
