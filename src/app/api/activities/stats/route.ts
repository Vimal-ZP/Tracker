import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { UserRole } from '@/types/user';
import Activity from '@/models/Activity';
import { connectDB } from '@/lib/mongodb';
import { ActivityAction, ActivityResource } from '@/types/activity';

interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: string;
        email: string;
        role: UserRole;
        name: string;
    };
}

// GET /api/activities/stats - Get activity statistics (Super Admin only)
async function getHandler(req: AuthenticatedRequest) {
    try {
        // Only Super Admin can access activity stats
        if (req.user?.role !== UserRole.SUPER_ADMIN) {
            return NextResponse.json(
                { error: 'Access denied. Super Admin role required.' },
                { status: 403 }
            );
        }

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

        // Get activities by application
        const applicationPipeline: any[] = [
            {
                $group: {
                    _id: { $ifNull: ['$application', 'System'] },
                    count: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' },
                    lastActivity: { $max: '$timestamp' },
                    actions: { $push: '$action' }
                }
            },
            {
                $project: {
                    application: '$_id',
                    count: 1,
                    uniqueUsers: { $size: '$uniqueUsers' },
                    lastActivity: 1,
                    mostCommonAction: {
                        $arrayElemAt: [
                            {
                                $map: {
                                    input: {
                                        $slice: [
                                            {
                                                $sortByCount: '$actions'
                                            },
                                            1
                                        ]
                                    },
                                    as: 'action',
                                    in: '$$action._id'
                                }
                            },
                            0
                        ]
                    }
                }
            },
            { $sort: { count: -1 } }
        ];

        if (dateRange) {
            applicationPipeline.unshift({
                $match: {
                    timestamp: {
                        $gte: dateRange.start,
                        $lte: dateRange.end
                    }
                }
            });
        }

        const activitiesByApplication = await Activity.aggregate(applicationPipeline);

        // Get top users
        const topUsersPipeline: any[] = [
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
        ];

        if (dateRange) {
            topUsersPipeline.unshift({
                $match: {
                    timestamp: {
                        $gte: dateRange.start,
                        $lte: dateRange.end
                    }
                }
            });
        }

        const topUsers = await Activity.aggregate(topUsersPipeline);

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
            userId: req.user.id,
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

export async function GET(request: NextRequest) {
    return verifyAuth(request, getHandler);
}
