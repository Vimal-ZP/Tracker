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

    const pipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalActivities: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' },
                activitiesByAction: {
                    $push: {
                        action: '$action',
                        count: 1
                    }
                },
                activitiesByApplication: {
                    $push: {
                        application: '$application',
                        count: 1
                    }
                },
                activitiesByResource: {
                    $push: {
                        resource: '$resource',
                        count: 1
                    }
                }
            }
        },
        {
            $project: {
                totalActivities: 1,
                uniqueUsers: { $size: '$uniqueUsers' },
                activitiesByAction: {
                    $reduce: {
                        input: '$activitiesByAction',
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                {
                                    $arrayToObject: [[{
                                        k: '$$this.action',
                                        v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.action', input: '$$value' } }, 0] }, 1] }
                                    }]]
                                }
                            ]
                        }
                    }
                },
                activitiesByApplication: {
                    $reduce: {
                        input: '$activitiesByApplication',
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                {
                                    $arrayToObject: [[{
                                        k: { $ifNull: ['$$this.application', 'system'] },
                                        v: { $add: [{ $ifNull: [{ $getField: { field: { $ifNull: ['$$this.application', 'system'] }, input: '$$value' } }, 0] }, 1] }
                                    }]]
                                }
                            ]
                        }
                    }
                },
                activitiesByResource: {
                    $reduce: {
                        input: '$activitiesByResource',
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                {
                                    $arrayToObject: [[{
                                        k: '$$this.resource',
                                        v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.resource', input: '$$value' } }, 0] }, 1] }
                                    }]]
                                }
                            ]
                        }
                    }
                }
            }
        }
    ];

    const result = await this.aggregate(pipeline);
    return result[0] || {
        totalActivities: 0,
        uniqueUsers: 0,
        activitiesByAction: {},
        activitiesByApplication: {},
        activitiesByResource: {}
    };
};

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
