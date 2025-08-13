export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    BASIC = 'basic'
}

export interface User {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserData {
    email: string;
    name: string;
    password: string;
    role: UserRole;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface UserPermissions {
    canCreateUsers: boolean;
    canDeleteUsers: boolean;
    canEditUsers: boolean;
    canViewAllUsers: boolean;
    canManageRoles: boolean;
    canAccessAdminPanel: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
}

export const rolePermissions: Record<UserRole, UserPermissions> = {
    [UserRole.SUPER_ADMIN]: {
        canCreateUsers: true,
        canDeleteUsers: true,
        canEditUsers: true,
        canViewAllUsers: true,
        canManageRoles: true,
        canAccessAdminPanel: true,
        canViewReports: true,
        canManageSettings: true,
    },
    [UserRole.ADMIN]: {
        canCreateUsers: true,
        canDeleteUsers: false,
        canEditUsers: true,
        canViewAllUsers: true,
        canManageRoles: false,
        canAccessAdminPanel: true,
        canViewReports: true,
        canManageSettings: false,
    },
    [UserRole.BASIC]: {
        canCreateUsers: false,
        canDeleteUsers: false,
        canEditUsers: false,
        canViewAllUsers: false,
        canManageRoles: false,
        canAccessAdminPanel: false,
        canViewReports: false,
        canManageSettings: false,
    },
};
