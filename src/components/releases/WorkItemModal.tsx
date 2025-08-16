'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { WorkItem, WorkItemType } from '@/types/release';

interface WorkItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: WorkItemFormData) => void;
    workItem?: WorkItem | null;
    parentItem?: WorkItem | null;
    mode: 'create' | 'edit' | 'createChild' | 'createEpic' | 'createIncident';
    availableParents?: WorkItem[];
}

export interface WorkItemFormData {
    type: WorkItemType;
    id: string;
    title: string;
    flagName: string;
    remarks: string;
    hyperlink: string;
    parentId: string;
}

export default function WorkItemModal({
    isOpen,
    onClose,
    onSubmit,
    workItem,
    parentItem,
    mode,
    availableParents = []
}: WorkItemModalProps) {
    const [formData, setFormData] = useState<WorkItemFormData>({
        type: WorkItemType.EPIC,
        id: '',
        title: '',
        flagName: '',
        remarks: '',
        hyperlink: '',
        parentId: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form data based on mode
    useEffect(() => {
        if (!isOpen) return;

        if (mode === 'edit' && workItem) {
            setFormData({
                type: workItem.type,
                id: workItem.id || '',
                title: workItem.title,
                flagName: workItem.flagName || '',
                remarks: workItem.remarks || '',
                hyperlink: workItem.hyperlink || '',
                parentId: workItem.parentId || ''
            });
        } else if (mode === 'createChild' && parentItem) {
            // Determine child type based on parent type
            let childType = WorkItemType.EPIC;

            if (parentItem.type === WorkItemType.EPIC) {
                childType = WorkItemType.FEATURE;
            } else if (parentItem.type === WorkItemType.FEATURE) {
                childType = WorkItemType.USER_STORY;
            } else if (parentItem.type === WorkItemType.USER_STORY) {
                childType = WorkItemType.BUG;
            }

            setFormData({
                type: childType,
                id: '',
                title: '',
                flagName: '',
                remarks: '',
                hyperlink: '',
                parentId: parentItem._id || ''
            });
        } else if (mode === 'createEpic') {
            // Create Epic mode - type fixed to Epic
            setFormData({
                type: WorkItemType.EPIC,
                id: '',
                title: '',
                flagName: '',
                remarks: '',
                hyperlink: '',
                parentId: ''
            });
        } else if (mode === 'createIncident') {
            // Create Incident mode - type fixed to Incident
            setFormData({
                type: WorkItemType.INCIDENT,
                id: '',
                title: '',
                flagName: '',
                remarks: '',
                hyperlink: '',
                parentId: ''
            });
        } else {
            // Create mode
            setFormData({
                type: WorkItemType.EPIC,
                id: '',
                title: '',
                flagName: '',
                remarks: '',
                hyperlink: '',
                parentId: ''
            });
        }

        setErrors({});
    }, [isOpen, mode, workItem, parentItem]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.id.trim()) {
            newErrors.id = 'ID is required';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.hyperlink.trim()) {
            newErrors.hyperlink = 'Hyperlink is required';
        } else if (formData.hyperlink.trim() && !/^https?:\/\/.+/.test(formData.hyperlink)) {
            newErrors.hyperlink = 'Hyperlink must be a valid URL starting with http:// or https://';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSubmit(formData);
    };

    const handleClose = () => {
        setFormData({
            type: WorkItemType.EPIC,
            id: '',
            title: '',
            flagName: '',
            remarks: '',
            hyperlink: '',
            parentId: ''
        });
        setErrors({});
        onClose();
    };

    const getModalTitle = () => {
        switch (mode) {
            case 'edit':
                return `Edit ${workItem?.type.replace('_', ' ')}`;
            case 'createChild':
                return `Add ${formData.type.replace('_', ' ')}`;
            case 'createEpic':
                return 'Add New Epic';
            case 'createIncident':
                return 'Add New Incident';
            case 'create':
            default:
                return `Add New ${formData.type.replace('_', ' ')}`;
        }
    };

    const getValidParents = () => {
        if (mode === 'createChild') {
            return []; // Parent is already determined
        }

        return availableParents.filter(parent => {
            if (formData.type === WorkItemType.EPIC) return false; // Epics have no parents
            if (formData.type === WorkItemType.INCIDENT) return false; // Incidents have no parents (standalone)
            if (formData.type === WorkItemType.FEATURE) return parent.type === WorkItemType.EPIC;
            if (formData.type === WorkItemType.USER_STORY) return parent.type === WorkItemType.FEATURE;
            if (formData.type === WorkItemType.BUG) return parent.type === WorkItemType.USER_STORY;
            return false;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        {getModalTitle()}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkItemType })}
                                className={`input w-full ${(mode === 'createChild' || mode === 'createEpic' || mode === 'createIncident') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                disabled={mode === 'edit' || mode === 'createChild' || mode === 'createEpic' || mode === 'createIncident'}
                            >
                                <option value={WorkItemType.EPIC}>Epic</option>
                                <option value={WorkItemType.FEATURE}>Feature</option>
                                <option value={WorkItemType.USER_STORY}>User Story</option>
                                <option value={WorkItemType.BUG}>Bug</option>
                                <option value={WorkItemType.INCIDENT}>Incident</option>
                            </select>


                        </div>

                        {/* ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ID *
                            </label>
                            <input
                                type="text"
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                className={`input w-full ${errors.id ? 'border-red-500' : ''}`}
                                placeholder="e.g., EPIC-001, FEAT-123"
                            />
                            {errors.id && (
                                <p className="mt-1 text-sm text-red-600">{errors.id}</p>
                            )}
                        </div>

                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
                                placeholder="Enter work item title"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        {/* Flag Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Flag Name
                            </label>
                            <input
                                type="text"
                                value={formData.flagName}
                                onChange={(e) => setFormData({ ...formData, flagName: e.target.value })}
                                className="input w-full"
                                placeholder="e.g., AUTH_SYSTEM"
                            />
                        </div>

                        {/* Hyperlink */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hyperlink *
                            </label>
                            <input
                                type="url"
                                value={formData.hyperlink}
                                onChange={(e) => setFormData({ ...formData, hyperlink: e.target.value })}
                                className={`input w-full ${errors.hyperlink ? 'border-red-500' : ''}`}
                                placeholder="https://example.com/link"
                            />
                            {errors.hyperlink && (
                                <p className="mt-1 text-sm text-red-600">{errors.hyperlink}</p>
                            )}
                        </div>

                        {/* Remarks */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Remarks
                            </label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                className="input w-full"
                                rows={3}
                                placeholder="Additional notes or remarks"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            {mode === 'edit' ? 'Update' : 'Create'} Work Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
