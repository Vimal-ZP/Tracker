'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rolePermissions } from '@/types/user';
import UserList from '@/components/users/UserList';
import { Shield } from 'lucide-react';

export default function UsersPage() {
    const { user } = useAuth();

    if (!user) return null;

    const permissions = rolePermissions[user.role];

    if (!permissions.canViewAllUsers) {
        return (
            <div className="h-full flex flex-col space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                        <p className="text-sm text-gray-500">
                            You don't have permission to view this page.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <UserList />
        </div>
    );
}
