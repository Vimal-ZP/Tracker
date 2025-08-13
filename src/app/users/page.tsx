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
            <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
                <p className="mt-1 text-sm text-gray-500">
                    You don't have permission to view this page.
                </p>
            </div>
        );
    }

    return <UserList />;
}
