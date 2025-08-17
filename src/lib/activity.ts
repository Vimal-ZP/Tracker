import { ActivityAction, ActivityResource, CreateActivityData } from '@/types/activity';
import { User } from '@/types/user';

/**
 * Utility function to log user activities
 */
export async function logActivity(
    user: User,
    action: ActivityAction,
    resource: ActivityResource,
    details: string,
    options?: {
        resourceId?: string;
        application?: string;
        metadata?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
    }
): Promise<boolean> {
    try {
        const activityData: CreateActivityData = {
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            userRole: user.role,
            action,
            resource,
            details,
            ...options
        };

        const response = await fetch('/api/activities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(activityData),
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to log activity:', error);
        return false;
    }
}

/**
 * Get client IP address and user agent for activity logging
 */
export function getClientInfo(request?: Request): { ipAddress?: string; userAgent?: string } {
    if (typeof window !== 'undefined') {
        // Client-side
        return {
            userAgent: navigator.userAgent
        };
    }

    if (request) {
        // Server-side
        const forwarded = request.headers.get('x-forwarded-for');
        const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || undefined;
        const userAgent = request.headers.get('user-agent') || undefined;

        return { ipAddress, userAgent };
    }

    return {};
}

/**
 * Activity logging helpers for common actions
 */
export const ActivityLogger = {
    // Authentication activities
    login: (user: User, options?: { ipAddress?: string; userAgent?: string }) =>
        logActivity(user, ActivityAction.LOGIN, ActivityResource.AUTH, 'User logged in successfully', options),

    logout: (user: User, options?: { ipAddress?: string; userAgent?: string }) =>
        logActivity(user, ActivityAction.LOGOUT, ActivityResource.AUTH, 'User logged out', options),

    loginFailed: (email: string, options?: { ipAddress?: string; userAgent?: string }) =>
        fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'anonymous',
                userName: 'Anonymous',
                userEmail: email,
                userRole: 'unknown',
                action: ActivityAction.LOGIN_FAILED,
                resource: ActivityResource.AUTH,
                details: `Failed login attempt for ${email}`,
                ...options
            })
        }),

    // User management activities
    userCreated: (actor: User, targetUser: User, application?: string) =>
        logActivity(actor, ActivityAction.USER_CREATED, ActivityResource.USER, 
            `Created user account for ${targetUser.name} (${targetUser.email})`, 
            { resourceId: targetUser._id, application }),

    userUpdated: (actor: User, targetUser: User, changes: string[], application?: string) =>
        logActivity(actor, ActivityAction.USER_UPDATED, ActivityResource.USER,
            `Updated user ${targetUser.name}: ${changes.join(', ')}`,
            { resourceId: targetUser._id, application, metadata: { changes } }),

    userDeleted: (actor: User, targetUser: User, application?: string) =>
        logActivity(actor, ActivityAction.USER_DELETED, ActivityResource.USER,
            `Deleted user account for ${targetUser.name} (${targetUser.email})`,
            { resourceId: targetUser._id, application }),

    roleChanged: (actor: User, targetUser: User, oldRole: string, newRole: string, application?: string) =>
        logActivity(actor, ActivityAction.ROLE_CHANGED, ActivityResource.USER,
            `Changed role for ${targetUser.name} from ${oldRole} to ${newRole}`,
            { resourceId: targetUser._id, application, metadata: { oldRole, newRole } }),

    // Prompt activities
    promptCreated: (user: User, promptId: string, promptTitle: string, application?: string) =>
        logActivity(user, ActivityAction.PROMPT_CREATED, ActivityResource.PROMPT,
            `Created prompt: ${promptTitle}`,
            { resourceId: promptId, application }),

    promptUsed: (user: User, promptId: string, promptTitle: string, application?: string) =>
        logActivity(user, ActivityAction.PROMPT_USED, ActivityResource.PROMPT,
            `Used prompt: ${promptTitle}`,
            { resourceId: promptId, application }),

    promptUpdated: (user: User, promptId: string, promptTitle: string, application?: string) =>
        logActivity(user, ActivityAction.PROMPT_UPDATED, ActivityResource.PROMPT,
            `Updated prompt: ${promptTitle}`,
            { resourceId: promptId, application }),

    promptDeleted: (user: User, promptId: string, promptTitle: string, application?: string) =>
        logActivity(user, ActivityAction.PROMPT_DELETED, ActivityResource.PROMPT,
            `Deleted prompt: ${promptTitle}`,
            { resourceId: promptId, application }),

    // Release activities
    releaseCreated: (user: User, releaseId: string, releaseTitle: string, application?: string) =>
        logActivity(user, ActivityAction.RELEASE_CREATED, ActivityResource.RELEASE,
            `Created release: ${releaseTitle}`,
            { resourceId: releaseId, application }),

    releaseUpdated: (user: User, releaseId: string, releaseTitle: string, application?: string) =>
        logActivity(user, ActivityAction.RELEASE_UPDATED, ActivityResource.RELEASE,
            `Updated release: ${releaseTitle}`,
            { resourceId: releaseId, application }),

    releasePublished: (user: User, releaseId: string, releaseTitle: string, application?: string) =>
        logActivity(user, ActivityAction.RELEASE_PUBLISHED, ActivityResource.RELEASE,
            `Published release: ${releaseTitle}`,
            { resourceId: releaseId, application }),

    releaseDeleted: (user: User, releaseId: string, releaseTitle: string, application?: string) =>
        logActivity(user, ActivityAction.RELEASE_DELETED, ActivityResource.RELEASE,
            `Deleted release: ${releaseTitle}`,
            { resourceId: releaseId, application }),

    // System activities
    settingsUpdated: (user: User, settingName: string, application?: string) =>
        logActivity(user, ActivityAction.SETTINGS_UPDATED, ActivityResource.SYSTEM,
            `Updated system setting: ${settingName}`,
            { application }),

    reportGenerated: (user: User, reportType: string, application?: string) =>
        logActivity(user, ActivityAction.REPORT_GENERATED, ActivityResource.REPORT,
            `Generated ${reportType} report`,
            { application }),

    dataExported: (user: User, dataType: string, application?: string) =>
        logActivity(user, ActivityAction.DATA_EXPORTED, ActivityResource.SYSTEM,
            `Exported ${dataType} data`,
            { application })
};
