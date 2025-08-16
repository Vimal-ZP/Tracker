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
    assignedProjects: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserData {
    email: string;
    name: string;
    password: string;
    role: UserRole;
    assignedProjects?: string[];
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

// Available projects in the system
export const AVAILABLE_PROJECTS = ['NRE', 'NVE', 'E-Vite', 'Portal Plus', 'Fast 2.0', 'FMS'] as const;

// Helper function to get user's accessible projects
export const getUserAccessibleProjects = (user: User): string[] => {
    if (user.role === UserRole.SUPER_ADMIN) {
        return [...AVAILABLE_PROJECTS]; // Super Admin has access to all projects by default
    }
    return user.assignedProjects || [];
};

// Helper function to check if user has access to a specific project
export const userHasProjectAccess = (user: User, projectName: string): boolean => {
    const accessibleProjects = getUserAccessibleProjects(user);
    return accessibleProjects.includes(projectName);
};

// Helper function to check if user has access to any of the specified projects
export const userHasAnyProjectAccess = (user: User, projectNames: string[]): boolean => {
    const accessibleProjects = getUserAccessibleProjects(user);
    return projectNames.some(project => accessibleProjects.includes(project));
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
