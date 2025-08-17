import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types/user';
import Activity from '@/models/Activity';
import connectDB from '@/lib/mongodb';
import { ActivityAction, ActivityResource } from '@/types/activity';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

// GET /api/activities/stats - Get activity statistics (Super Admin only)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Verify authentication using cookie (same pattern as other APIs)
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Check if user is Super Admin
        if (decoded.role !== UserRole.SUPER_ADMIN) {
            return NextResponse.json(
                { error: 'Access denied. Super Admin role required.' },
                { status: 403 }
            );
        }

        // Get user details
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(request.url);
        
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
            userId: decoded.userId,
            userName: user.name,
            userEmail: user.email,
            userRole: decoded.role,
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


