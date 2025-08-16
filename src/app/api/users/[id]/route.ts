import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withRoleAuth, AuthenticatedRequest } from '@/lib/middleware';
import { UserRole } from '@/types/user';

interface RouteParams {
    params: {
        id: string;
    };
}

// GET /api/users/[id] - Get user by ID
async function getHandler(req: AuthenticatedRequest, context: RouteParams) {
    try {
        await connectDB();

        const { params } = context;
        const { id } = params;

        const user = await User.findById(id).select('-password');
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });

    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id] - Update user
async function putHandler(req: AuthenticatedRequest, context: RouteParams) {
    try {
        await connectDB();

        const { params } = context;
        const { id } = params;
        const body = await req.json();
        const { name, email, role, isActive } = body;

        // Find the user to update
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Only Super Admin can modify Super Admin users or change roles to Super Admin
        if ((user.role === UserRole.SUPER_ADMIN || role === UserRole.SUPER_ADMIN) &&
            req.user?.role !== UserRole.SUPER_ADMIN) {
            return NextResponse.json(
                { error: 'Only Super Admin can modify Super Admin users' },
                { status: 403 }
            );
        }

        // Users can only edit their own profile (except admins)
        if (req.user?.role === UserRole.BASIC && req.user.userId !== id) {
            return NextResponse.json(
                { error: 'You can only edit your own profile' },
                { status: 403 }
            );
        }

        // Basic users cannot change their role or active status
        if (req.user?.role === UserRole.BASIC && (role || isActive !== undefined)) {
            return NextResponse.json(
                { error: 'You cannot change role or active status' },
                { status: 403 }
            );
        }

        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email.toLowerCase();
        if (role && req.user?.role !== UserRole.BASIC) user.role = role;
        if (isActive !== undefined && req.user?.role !== UserRole.BASIC) user.isActive = isActive;

        await user.save();

        return NextResponse.json({
            user: user.toJSON(),
            message: 'User updated successfully'
        });

    } catch (error: any) {
        console.error('Update user error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json(
                { error: 'Validation failed', details: errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id] - Delete user (Super Admin only)
async function deleteHandler(req: AuthenticatedRequest, context: RouteParams) {
    try {
        await connectDB();

        const { params } = context;
        const { id } = params;

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Cannot delete Super Admin users
        if (user.role === UserRole.SUPER_ADMIN) {
            return NextResponse.json(
                { error: 'Super Admin users cannot be deleted' },
                { status: 403 }
            );
        }

        // Cannot delete yourself
        if (req.user?.userId === id) {
            return NextResponse.json(
                { error: 'You cannot delete your own account' },
                { status: 403 }
            );
        }

        await User.findByIdAndDelete(id);

        return NextResponse.json({
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const GET = withRoleAuth([UserRole.ADMIN, UserRole.SUPER_ADMIN])(getHandler);
export const PUT = withRoleAuth([UserRole.BASIC, UserRole.ADMIN, UserRole.SUPER_ADMIN])(putHandler);
export const DELETE = withRoleAuth([UserRole.SUPER_ADMIN])(deleteHandler);
