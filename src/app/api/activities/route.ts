import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { UserRole } from '@/types/user';
import Activity from '@/models/Activity';
import { connectDB } from '@/lib/mongodb';
import { ActivityFilters, ActivityAction, ActivityResource } from '@/types/activity';

interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: string;
        email: string;
        role: UserRole;
        name: string;
    };
}

// GET /api/activities - Get activities (Super Admin only)
async function getHandler(req: AuthenticatedRequest) {
    try {
        // Only Super Admin can access activities
        if (req.user?.role !== UserRole.SUPER_ADMIN) {
            return NextResponse.json(
                { error: 'Access denied. Super Admin role required.' },
                { status: 403 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        
        // Parse query parameters
        const application = searchParams.get('application');
        const action = searchParams.get('action') as ActivityAction;
        const resource = searchParams.get('resource') as ActivityResource;
        const userId = searchParams.get('userId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = parseInt(searchParams.get('skip') || '0');

        // Build query
        const query: any = {};
        
        if (application && application !== 'all') {
            query.application = application;
        }
        
        if (action) {
            query.action = action;
        }
        
        if (resource) {
            query.resource = resource;
        }
        
        if (userId) {
            query.userId = userId;
        }
        
        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get activities
        const activities = await Activity.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        // Get total count for pagination
        const totalCount = await Activity.countDocuments(query);

        // Log this activity
        await Activity.logActivity({
            userId: req.user.id,
            userName: req.user.name,
            userEmail: req.user.email,
            userRole: req.user.role,
            action: ActivityAction.REPORT_GENERATED,
            resource: ActivityResource.SYSTEM,
            details: `Viewed activities page with filters: ${JSON.stringify(query)}`,
            application: application || undefined
        });

        return NextResponse.json({
            activities,
            totalCount,
            hasMore: skip + limit < totalCount
        });

    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activities' },
            { status: 500 }
        );
    }
}

// POST /api/activities - Create activity log (internal use)
async function postHandler(req: AuthenticatedRequest) {
    try {
        await connectDB();

        const body = await req.json();
        
        const activity = await Activity.logActivity({
            ...body,
            timestamp: new Date()
        });

        if (!activity) {
            return NextResponse.json(
                { error: 'Failed to create activity log' },
                { status: 500 }
            );
        }

        return NextResponse.json(activity, { status: 201 });

    } catch (error) {
        console.error('Error creating activity:', error);
        return NextResponse.json(
            { error: 'Failed to create activity' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return verifyAuth(request, getHandler);
}

export async function POST(request: NextRequest) {
    return verifyAuth(request, postHandler);
}
