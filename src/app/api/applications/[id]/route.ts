import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { withRoleAuth } from '@/lib/middleware';
import { UserRole } from '@/types/user';
import { UpdateApplicationData } from '@/types/application';
import mongoose from 'mongoose';

// GET /api/applications/[id] - Get application by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withRoleAuth([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BASIC])(async (req) => {
        try {
            await connectDB();

            const { id } = params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { error: 'Invalid application ID' },
                    { status: 400 }
                );
            }

            const application = await Application.findById(id).lean();

            if (!application) {
                return NextResponse.json(
                    { error: 'Application not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ application });
        } catch (error: any) {
            console.error('Error fetching application:', error);
            return NextResponse.json(
                { error: 'Failed to fetch application' },
                { status: 500 }
            );
        }
    })(request);
}

// PUT /api/applications/[id] - Update application
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withRoleAuth([UserRole.SUPER_ADMIN])(async (req) => {
        try {
            await connectDB();

            const { id } = params;
            const body: UpdateApplicationData = await req.json();

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { error: 'Invalid application ID' },
                    { status: 400 }
                );
            }

            const application = await Application.findById(id);

            if (!application) {
                return NextResponse.json(
                    { error: 'Application not found' },
                    { status: 404 }
                );
            }

            // Check if name is being changed and if it conflicts with existing application
            if (body.name && body.name !== application.name) {
                const existingApplication = await Application.findOne({ 
                    name: { $regex: new RegExp(`^${body.name}$`, 'i') },
                    _id: { $ne: id }
                });

                if (existingApplication) {
                    return NextResponse.json(
                        { error: 'Application with this name already exists' },
                        { status: 409 }
                    );
                }
            }

            // Update application fields
            if (body.name !== undefined) application.name = body.name.trim();
            if (body.displayName !== undefined) application.displayName = body.displayName.trim();
            if (body.description !== undefined) application.description = body.description?.trim();
            if (body.isActive !== undefined) application.isActive = body.isActive;

            await application.save();

            return NextResponse.json({ 
                message: 'Application updated successfully',
                application 
            });

        } catch (error: any) {
            console.error('Error updating application:', error);
            
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map((err: any) => err.message);
                return NextResponse.json(
                    { error: 'Validation failed', details: validationErrors },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to update application' },
                { status: 500 }
            );
        }
    })(request);
}

// DELETE /api/applications/[id] - Delete application
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withRoleAuth([UserRole.SUPER_ADMIN])(async (req) => {
        try {
            await connectDB();

            const { id } = params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { error: 'Invalid application ID' },
                    { status: 400 }
                );
            }

            const application = await Application.findById(id);

            if (!application) {
                return NextResponse.json(
                    { error: 'Application not found' },
                    { status: 404 }
                );
            }

            // TODO: Check if application is being used by any releases or users
            // For now, we'll allow deletion but in production you might want to prevent
            // deletion of applications that are in use

            await Application.findByIdAndDelete(id);

            return NextResponse.json({ 
                message: 'Application deleted successfully' 
            });

        } catch (error: any) {
            console.error('Error deleting application:', error);
            return NextResponse.json(
                { error: 'Failed to delete application' },
                { status: 500 }
            );
        }
    })(request);
}
