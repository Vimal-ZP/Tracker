import { NextRequest, NextResponse } from 'next/server';
import { withRoleAuth } from '@/lib/middleware';
import { UserRole } from '@/types/user';
import Activity from '@/models/Activity';
import { connectDB } from '@/lib/mongodb';
import { ActivityAction, ActivityResource } from '@/types/activity';

interface AuthenticatedRequest extends NextRequest {
    user?: {
        userId: string;
        email: string;
        role: UserRole;
        name: string;
    };
}

// GET /api/activities/stats - Get activity statistics (Super Admin only)
async function getHandler(req: AuthenticatedRequest) {
    try {

        await connectDB();

        const { searchParams } = new URL(req.url);
        
        // Parse query parameters
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const application = searchParams.get('application');

        // Build date range
        let dateRange: { start: Date; end: Date } | undefined;
        if (startDate && endDate) {
            dateRange = {
                start: new Date(startDate),
                end: new Date(endDate)
            };
        }

        // Get basic stats
        const stats = await Activity.getActivityStats(dateRange);

        // Get activities by application (simplified)
        const matchQuery: any = {};
        if (dateRange) {
            matchQuery.timestamp = {
                $gte: dateRange.start,
                $lte: dateRange.end
            };
        }

        const activitiesByApplication = await Activity.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $ifNull: ['$application', 'System'] },
                    count: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' },
                    lastActivity: { $max: '$timestamp' }
                }
            },
            {
                $project: {
                    application: '$_id',
                    count: 1,
                    uniqueUsers: { $size: '$uniqueUsers' },
                    lastActivity: 1
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get top users (simplified)
        const topUsers = await Activity.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$userId',
                    userName: { $first: '$userName' },
                    userEmail: { $first: '$userEmail' },
                    userRole: { $first: '$userRole' },
                    activityCount: { $sum: 1 },
                    lastActivity: { $max: '$timestamp' }
                }
            },
            { $sort: { activityCount: -1 } },
            { $limit: 10 }
        ]);

        // Get recent activities
        const recentQuery: any = {};
        if (dateRange) {
            recentQuery.timestamp = {
                $gte: dateRange.start,
                $lte: dateRange.end
            };
        }
        if (application && application !== 'all') {
            recentQuery.application = application;
        }

        const recentActivities = await Activity.find(recentQuery)
            .sort({ timestamp: -1 })
            .limit(20)
            .lean();

        // Get activity timeline (last 7 days)
        const timelinePipeline = [
            {
                $match: {
                    timestamp: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$timestamp'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const activityTimeline = await Activity.aggregate(timelinePipeline);

        // Log this activity
        await Activity.logActivity({
            userId: req.user.userId,
            userName: req.user.name,
            userEmail: req.user.email,
            userRole: req.user.role,
            action: ActivityAction.REPORT_GENERATED,
            resource: ActivityResource.SYSTEM,
            details: 'Viewed activity statistics dashboard',
            application: application || undefined
        });

        return NextResponse.json({
            ...stats,
            activitiesByApplication,
            topUsers,
            recentActivities,
            activityTimeline
        });

    } catch (error) {
        console.error('Error fetching activity stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity statistics' },
            { status: 500 }
        );
    }
}

export const GET = withRoleAuth([UserRole.SUPER_ADMIN])(getHandler);
