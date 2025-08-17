export interface Activity {
    _id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    action: ActivityAction;
    resource: ActivityResource;
    resourceId?: string;
    application?: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export enum ActivityAction {
    // Authentication
    LOGIN = 'login',
    LOGOUT = 'logout',
    LOGIN_FAILED = 'login_failed',
    
    // User Management
    USER_CREATED = 'user_created',
    USER_UPDATED = 'user_updated',
    USER_DELETED = 'user_deleted',
    USER_ACTIVATED = 'user_activated',
    USER_DEACTIVATED = 'user_deactivated',
    ROLE_CHANGED = 'role_changed',
    PASSWORD_CHANGED = 'password_changed',
    PROFILE_UPDATED = 'profile_updated',
    
    // Prompt Management
    PROMPT_CREATED = 'prompt_created',
    PROMPT_UPDATED = 'prompt_updated',
    PROMPT_DELETED = 'prompt_deleted',
    PROMPT_USED = 'prompt_used',
    PROMPT_FAVORITED = 'prompt_favorited',
    PROMPT_UNFAVORITED = 'prompt_unfavorited',
    PROMPT_DUPLICATED = 'prompt_duplicated',
    
    // Release Management
    RELEASE_CREATED = 'release_created',
    RELEASE_UPDATED = 'release_updated',
    RELEASE_DELETED = 'release_deleted',
    RELEASE_PUBLISHED = 'release_published',
    RELEASE_UNPUBLISHED = 'release_unpublished',
    RELEASE_VIEWED = 'release_viewed',
    
    // System
    SETTINGS_UPDATED = 'settings_updated',
    APPLICATION_ASSIGNED = 'application_assigned',
    APPLICATION_UNASSIGNED = 'application_unassigned',
    REPORT_GENERATED = 'report_generated',
    DATA_EXPORTED = 'data_exported'
}

export enum ActivityResource {
    USER = 'user',
    PROMPT = 'prompt',
    RELEASE = 'release',
    SYSTEM = 'system',
    AUTH = 'auth',
    REPORT = 'report'
}

export interface ActivityFilters {
    dateRange?: {
        start: Date;
        end: Date;
    };
    applications?: string[];
    actions?: ActivityAction[];
    resources?: ActivityResource[];
    users?: string[];
    limit?: number;
    skip?: number;
}

export interface ActivityStats {
    totalActivities: number;
    uniqueUsers: number;
    activitiesByAction: Record<string, number>;
    activitiesByApplication: Record<string, number>;
    activitiesByResource: Record<string, number>;
    recentActivities: Activity[];
    topUsers: {
        userId: string;
        userName: string;
        activityCount: number;
    }[];
}

export interface ActivityByApplication {
    application: string;
    activities: Activity[];
    stats: {
        totalActivities: number;
        uniqueUsers: number;
        mostCommonAction: string;
        lastActivity: Date;
    };
}

export interface CreateActivityData {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    action: ActivityAction;
    resource: ActivityResource;
    resourceId?: string;
    application?: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}
