import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReleasePlan from '@/models/ReleasePlan';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';
import { ReleasePlanPriority } from '@/types/project';

// GET /api/release-plans - Get all release plans
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const releasePlans = await ReleasePlan.find({})
      .sort({ plannedDate: 1 })
      .lean();

    return NextResponse.json({ releasePlans });

  } catch (error) {
    console.error('Error fetching release plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch release plans' },
      { status: 500 }
    );
  }
}

// POST /api/release-plans - Create a new release plan
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
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

    // Check permissions (only admin and super_admin can create release plans)
    if (!['admin', 'super_admin'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      projectId,
      plannedDate,
      version,
      title,
      description,
      priority
    } = body;

    // Validate required fields
    if (!projectId || !plannedDate || !version || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, plannedDate, version, title' },
        { status: 400 }
      );
    }

    // Get project details
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if version already exists for this project
    const existingPlan = await ReleasePlan.findOne({
      'project._id': projectId,
      version
    });
    if (existingPlan) {
      return NextResponse.json(
        { error: 'Version already exists for this project' },
        { status: 400 }
      );
    }

    // Create new release plan
    const releasePlan = new ReleasePlan({
      project: {
        _id: project._id,
        name: project.name,
        code: project.code
      },
      plannedDate: new Date(plannedDate),
      version,
      title,
      description,
      priority: priority || ReleasePlanPriority.MEDIUM,
      createdBy: {
        _id: decoded.userId,
        name: decoded.name || 'Unknown',
        email: decoded.email
      }
    });

    await releasePlan.save();

    return NextResponse.json(
      { 
        message: 'Release plan created successfully',
        releasePlan 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating release plan:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Version already exists for this project' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create release plan' },
      { status: 500 }
    );
  }
}
