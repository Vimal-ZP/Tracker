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
    assignedApplications: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserData {
    email: string;
    name: string;
    password: string;
    role: UserRole;
    assignedApplications?: string[];
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
    canManageUsers: boolean;
    canManageRoles: boolean;
    canAccessAdminPanel: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canEditReleases: boolean;
}

// Available applications in the system
export const AVAILABLE_APPLICATIONS = ['NRE', 'NVE', 'E-Vite', 'Portal Plus', 'Fast 2.0', 'FMS'] as const;

// Helper function to get user's accessible applications
export const getUserAccessibleApplications = (user: User): string[] => {
    if (!user) {
        return [];
    }
    if (user.role === UserRole.SUPER_ADMIN) {
        return [...AVAILABLE_APPLICATIONS]; // Super Admin has access to all applications by default
    }
    return Array.isArray(user.assignedApplications) ? user.assignedApplications : [];
};

// Helper function to check if user has access to a specific application
export const userHasApplicationAccess = (user: User, applicationName: string): boolean => {
    const accessibleApplications = getUserAccessibleApplications(user);
    return accessibleApplications.includes(applicationName);
};

// Helper function to check if user has access to any of the specified applications
export const userHasAnyApplicationAccess = (user: User, applicationNames: string[]): boolean => {
    const accessibleApplications = getUserAccessibleApplications(user);
    return applicationNames.some(application => accessibleApplications.includes(application));
};

export const rolePermissions: Record<UserRole, UserPermissions> = {
    [UserRole.SUPER_ADMIN]: {
        canCreateUsers: true,
        canDeleteUsers: true,
        canEditUsers: true,
        canViewAllUsers: true,
        canManageUsers: true,
        canManageRoles: true,
        canAccessAdminPanel: true,
        canViewReports: true,
        canManageSettings: true,
        canEditReleases: true,
    },
    [UserRole.ADMIN]: {
        canCreateUsers: true,
        canDeleteUsers: false,
        canEditUsers: true,
        canViewAllUsers: true,
        canManageUsers: true,
        canManageRoles: false,
        canAccessAdminPanel: true,
        canViewReports: true,
        canManageSettings: false,
        canEditReleases: true,
    },
    [UserRole.BASIC]: {
        canCreateUsers: false,
        canDeleteUsers: false,
        canEditUsers: false,
        canViewAllUsers: false,
        canManageUsers: false,
        canManageRoles: false,
        canAccessAdminPanel: false,
        canViewReports: false,
        canManageSettings: false,
        canEditReleases: false,
    },
};
