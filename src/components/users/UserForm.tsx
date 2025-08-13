'use client';

import React, { useState } from 'react';
import { CreateUserData, UserRole, User } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { User as UserIcon, Mail, Lock } from 'lucide-react';

interface UserFormProps {
    user?: User;
    onSubmit: (userData: CreateUserData | Partial<User>) => Promise<void>;
    onCancel: () => void;
    isEditing?: boolean;
}

export default function UserForm({ user, onSubmit, onCancel, isEditing = false }: UserFormProps) {
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState<CreateUserData>({
        email: user?.email || '',
        name: user?.name || '',
        password: '',
        role: user?.role || UserRole.BASIC,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<CreateUserData>>({});

    const canManageRoles = currentUser?.role === UserRole.SUPER_ADMIN ||
        (currentUser?.role === UserRole.ADMIN && formData.role !== UserRole.SUPER_ADMIN);

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
        </form>
    );
}
