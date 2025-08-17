import mongoose, { Document, Schema } from 'mongoose';
import { AVAILABLE_APPLICATIONS } from '@/types/user';

export interface IActivity extends Document {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    action: string;
    resource: string;
    resourceId?: string;
    application?: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

const ActivitySchema = new Schema<IActivity>({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    userRole: {
        type: String,
        required: true,
        enum: ['super_admin', 'admin', 'basic']
    },
    action: {
        type: String,
        required: true,
        enum: [
            // Authentication
            'login', 'logout', 'login_failed',
            // User Management
            'user_created', 'user_updated', 'user_deleted', 'user_activated', 'user_deactivated',
            'role_changed', 'password_changed', 'profile_updated',
            // Prompt Management
            'prompt_created', 'prompt_updated', 'prompt_deleted', 'prompt_used', 'prompt_favorited',
            'prompt_unfavorited', 'prompt_duplicated',
            // Release Management
            'release_created', 'release_updated', 'release_deleted', 'release_published',
            'release_unpublished', 'release_viewed',
            // System
            'settings_updated', 'application_assigned', 'application_unassigned',
            'report_generated', 'data_exported'
        ],
        index: true
    },
    resource: {
        type: String,
        required: true,
        enum: ['user', 'prompt', 'release', 'system', 'auth', 'report'],
        index: true
    },
    resourceId: {
        type: String,
        index: true
    },
    application: {
        type: String,
        enum: [...AVAILABLE_APPLICATIONS, null],
        index: true
    },
    details: {
        type: String,
        required: true,
        maxlength: 1000
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for better query performance
ActivitySchema.index({ userId: 1, timestamp: -1 });
ActivitySchema.index({ application: 1, timestamp: -1 });
ActivitySchema.index({ action: 1, timestamp: -1 });
ActivitySchema.index({ resource: 1, timestamp: -1 });
ActivitySchema.index({ timestamp: -1 });

// Static methods for activity tracking
ActivitySchema.statics.logActivity = async function(activityData: Partial<IActivity>) {
    try {
        const activity = new this(activityData);
        await activity.save();
        return activity;
    } catch (error) {
        console.error('Failed to log activity:', error);
        return null;
    }
};

// Get activities by application
ActivitySchema.statics.getActivitiesByApplication = async function(
    application?: string,
    limit: number = 50,
    skip: number = 0
) {
    const query = application ? { application } : {};
    return this.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

// Get activity statistics
ActivitySchema.statics.getActivityStats = async function(dateRange?: { start: Date; end: Date }) {
    const matchStage: any = {};
    if (dateRange) {
        matchStage.timestamp = {
            $gte: dateRange.start,
            $lte: dateRange.end
        };
    }

    // Simple aggregation for basic stats
    const totalActivities = await this.countDocuments(matchStage);
    const uniqueUsers = await this.distinct('userId', matchStage);
    
    // Get activities by action
    const actionStats = await this.aggregate([
        { $match: matchStage },
        { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);
    
    // Get activities by application
    const appStats = await this.aggregate([
        { $match: matchStage },
        { $group: { _id: { $ifNull: ['$application', 'System'] }, count: { $sum: 1 } } }
    ]);
    
    // Get activities by resource
    const resourceStats = await this.aggregate([
        { $match: matchStage },
        { $group: { _id: '$resource', count: { $sum: 1 } } }
    ]);

    return {
        totalActivities,
        uniqueUsers: uniqueUsers.length,
        activitiesByAction: actionStats.reduce((acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        activitiesByApplication: appStats.reduce((acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        activitiesByResource: resourceStats.reduce((acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
        }, {})
    };
};

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
