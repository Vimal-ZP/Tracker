import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withRoleAuth } from '@/lib/middleware';
import { UserRole } from '@/types/user';
import { CreateApplicationData } from '@/types/application';

// GET /api/applications - Get all applications
export async function GET(request: NextRequest) {
    return withRoleAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BASIC])(async (req) => {
        try {
            await connectDB();

            const { searchParams } = new URL(req.url);
            const search = searchParams.get('search');
            const isActive = searchParams.get('isActive');

            // Build query
            const query: any = {};
            
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { displayName: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            if (isActive !== null && isActive !== undefined) {
                query.isActive = isActive === 'true';
            }

            const applications = await Application.find(query)
                .sort({ name: 1 })
                .lean();

            return NextResponse.json({ applications });
        } catch (error: any) {
            console.error('Error fetching applications:', error);
            return NextResponse.json(
                { error: 'Failed to fetch applications' },
                { status: 500 }
            );
        }
    })(request);
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
    return withRoleAuth([UserRole.SUPER_ADMIN])(async (req) => {
        try {
            await connectDB();

            const body: CreateApplicationData = await req.json();
            const { name, displayName, description, isActive = true } = body;

            // Validate required fields
            if (!name || !displayName) {
                return NextResponse.json(
                    { error: 'Name and display name are required' },
                    { status: 400 }
                );
            }

            // Check if application with same name already exists
            const existingApplication = await Application.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') } 
            });

            if (existingApplication) {
                return NextResponse.json(
                    { error: 'Application with this name already exists' },
                    { status: 409 }
                );
            }

            // Create new application
            const application = new Application({
                name: name.trim(),
                displayName: displayName.trim(),
                description: description?.trim(),
                isActive
            });

            await application.save();

            return NextResponse.json({ 
                message: 'Application created successfully',
                application 
            }, { status: 201 });

        } catch (error: any) {
            console.error('Error creating application:', error);
            
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map((err: any) => err.message);
                return NextResponse.json(
                    { error: 'Validation failed', details: validationErrors },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to create application' },
                { status: 500 }
            );
        }
    })(request);
}
