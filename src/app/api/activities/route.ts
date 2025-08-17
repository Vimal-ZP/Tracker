import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types/user';
import Activity from '@/models/Activity';
import connectDB from '@/lib/mongodb';
import { ActivityFilters, ActivityAction, ActivityResource } from '@/types/activity';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

// GET /api/activities - Get activities (Super Admin only)
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
            userId: decoded.userId,
            userName: user.name,
            userEmail: user.email,
            userRole: decoded.role,
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
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Verify authentication using cookie
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

        const body = await request.json();
        
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
