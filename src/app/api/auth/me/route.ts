import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

async function handler(req: AuthenticatedRequest) {
    try {
        await connectDB();

        if (!req.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Find user by ID
        const user = await User.findById(req.user.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: user.toJSON()
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const GET = withAuth(handler);
