'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CreateUserData, UserRole, User, AVAILABLE_PROJECTS } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { User as UserIcon, Mail, Lock, FolderOpen, ChevronDown, X } from 'lucide-react';

interface UserFormProps {
    user?: User;
    onSubmit: (userData: CreateUserData | Partial<User>) => Promise<void>;
    onCancel: () => void;
    isEditing?: boolean;
}

export default function UserForm({ user, onSubmit, onCancel, isEditing = false }: UserFormProps) {
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState<CreateUserData & { assignedProjects: string[] }>({
        email: user?.email || '',
        name: user?.name || '',
        password: '',
        role: user?.role || UserRole.BASIC,
        assignedProjects: user?.assignedProjects || [],
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<CreateUserData>>({});
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const portalDropdownRef = useRef<HTMLDivElement>(null);

    const canManageRoles = currentUser?.role === UserRole.SUPER_ADMIN ||
        (currentUser?.role === UserRole.ADMIN && formData.role !== UserRole.SUPER_ADMIN);

    const canManageProjects = currentUser?.role === UserRole.SUPER_ADMIN;

    const availableProjects = AVAILABLE_PROJECTS;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showProjectDropdown) {
                const target = event.target as Node;
                const isClickOnButton = buttonRef.current && buttonRef.current.contains(target);
                const isClickOnDropdown = portalDropdownRef.current && portalDropdownRef.current.contains(target);

                if (!isClickOnButton && !isClickOnDropdown) {
                    setShowProjectDropdown(false);
                }
            }
        };

        if (showProjectDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProjectDropdown]);

    // Update dropdown position on window resize
    useEffect(() => {
        const handleResize = () => {
            if (showProjectDropdown && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        if (showProjectDropdown) {
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', handleResize);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleResize);
        };
    }, [showProjectDropdown]);

    const validateForm = () => {
        const newErrors: Partial<CreateUserData> = {};

        if (!formData.name) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!isEditing && !formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const submitData = isEditing
                ? { ...formData, password: formData.password || undefined }
                : formData;

            await onSubmit(submitData);
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof CreateUserData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleProjectToggle = (project: string) => {
        setFormData(prev => ({
            ...prev,
            assignedProjects: prev.assignedProjects.includes(project)
                ? prev.assignedProjects.filter(p => p !== project)
                : [...prev.assignedProjects, project]
        }));
    };

    const handleRemoveProject = (project: string) => {
        setFormData(prev => ({
            ...prev,
            assignedProjects: prev.assignedProjects.filter(p => p !== project)
        }));
    };

    const handleDropdownToggle = () => {
        if (!showProjectDropdown && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setShowProjectDropdown(!showProjectDropdown);
    };

    const getRoleDisplayName = (role: UserRole) => {
        switch (role) {
            case UserRole.SUPER_ADMIN:
                return 'Super Admin';
            case UserRole.ADMIN:
                return 'Admin';
            case UserRole.BASIC:
                return 'Basic User';
            default:
                return role;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                </label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                </label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password {isEditing && <span className="text-gray-500">(leave blank to keep current)</span>}
                </label>
                <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
                        placeholder={isEditing ? "Enter new password (optional)" : "Enter password"}
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
            </div>

            {canManageRoles && (
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                    </label>
                    <select
                        id="role"
                        name="role"
                        className="input mt-1"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value={UserRole.BASIC}>{getRoleDisplayName(UserRole.BASIC)}</option>
                        <option value={UserRole.ADMIN}>{getRoleDisplayName(UserRole.ADMIN)}</option>
                        {currentUser?.role === UserRole.SUPER_ADMIN && (
                            <option value={UserRole.SUPER_ADMIN}>{getRoleDisplayName(UserRole.SUPER_ADMIN)}</option>
                        )}
                    </select>
                </div>
            )}

            {canManageProjects && (formData.role === UserRole.ADMIN || formData.role === UserRole.BASIC) && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Assigned Projects
                        </div>
                    </label>

                    {/* Selected Projects Display */}
                    {formData.assignedProjects.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                            {formData.assignedProjects.map((project) => (
                                <span
                                    key={project}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                >
                                    {project}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveProject(project)}
                                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none focus:bg-blue-200"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Multi-Select Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            ref={buttonRef}
                            type="button"
                            onClick={handleDropdownToggle}
                            className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <span className="block truncate text-gray-500">
                                {formData.assignedProjects.length === 0
                                    ? "Select projects..."
                                    : `${formData.assignedProjects.length} project${formData.assignedProjects.length === 1 ? '' : 's'} selected`
                                }
                            </span>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </span>
                        </button>


                    </div>

                    {formData.assignedProjects.length === 0 && (
                        <p className="mt-2 text-sm text-amber-600">
                            No projects assigned. User will have limited access.
                        </p>
                    )}
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading ? (
                        <LoadingSpinner size="sm" className="text-white" />
                    ) : (
                        isEditing ? 'Update User' : 'Create User'
                    )}
                </button>
            </div>

            {/* Portal-based dropdown to avoid modal overflow issues */}
            {showProjectDropdown && typeof window !== 'undefined' && createPortal(
                <div
                    ref={portalDropdownRef}
                    className="fixed z-[9999] bg-white shadow-lg h-32 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-y-auto focus:outline-none sm:text-sm border border-gray-200"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                    }}
                >
                    {availableProjects.map((project) => (
                        <div
                            key={project}
                            onClick={() => {
                                handleProjectToggle(project);
                            }}
                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 ${formData.assignedProjects.includes(project)
                                ? 'text-blue-900 bg-blue-50'
                                : 'text-gray-900'
                                }`}
                        >
                            <span className={`block truncate ${formData.assignedProjects.includes(project) ? 'font-semibold' : 'font-normal'
                                }`}>
                                {project}
                            </span>
                            {formData.assignedProjects.includes(project) && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            )}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </form>
    );
}
