import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withRoleAuth, AuthenticatedRequest } from '@/lib/middleware';
import { UserRole, CreateUserData, AVAILABLE_PROJECTS } from '@/types/user';

// GET /api/users - Get all users (Admin and Super Admin only)
async function getHandler(req: AuthenticatedRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';

        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role && Object.values(UserRole).includes(role as UserRole)) {
            query.role = role;
        }

        // Get users with pagination
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/users - Create new user (Admin and Super Admin only)
async function postHandler(req: AuthenticatedRequest) {
    try {
        await connectDB();

        const body: CreateUserData = await req.json();
        const { email, name, password, role = UserRole.BASIC, assignedProjects = [] } = body;

        // Validate input
        if (!email || !name || !password) {
            return NextResponse.json(
                { error: 'Email, name, and password are required' },
                { status: 400 }
            );
        }

        // Only Super Admin can create Super Admin users
        if (role === UserRole.SUPER_ADMIN && req.user?.role !== UserRole.SUPER_ADMIN) {
            return NextResponse.json(
                { error: 'Only Super Admin can create Super Admin users' },
                { status: 403 }
            );
        }

        // Only Super Admin can assign projects
        if (assignedProjects.length > 0 && req.user?.role !== UserRole.SUPER_ADMIN) {
            return NextResponse.json(
                { error: 'Only Super Admin can assign projects to users' },
                { status: 403 }
            );
        }

        // Validate assigned projects
        if (assignedProjects.length > 0) {
            const invalidProjects = assignedProjects.filter(project => !AVAILABLE_PROJECTS.includes(project as any));
            if (invalidProjects.length > 0) {
                return NextResponse.json(
                    { error: `Invalid project names: ${invalidProjects.join(', ')}. Valid projects are: ${AVAILABLE_PROJECTS.join(', ')}` },
                    { status: 400 }
                );
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Create new user
        const user = new User({
            email: email.toLowerCase(),
            name,
            password,
            role,
            isActive: true,
            assignedProjects: role === UserRole.SUPER_ADMIN ? [] : (assignedProjects || []) // Super Admin doesn't need assigned projects, others get explicit assignments
        });

        await user.save();

        return NextResponse.json({
            user: user.toJSON(),
            message: 'User created successfully'
        }, { status: 201 });

    } catch (error: any) {
        console.error('Create user error:', error);

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

export const GET = withRoleAuth([UserRole.ADMIN, UserRole.SUPER_ADMIN])(getHandler);
export const POST = withRoleAuth([UserRole.ADMIN, UserRole.SUPER_ADMIN])(postHandler);
