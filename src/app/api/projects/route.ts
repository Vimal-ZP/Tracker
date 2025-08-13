import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';
import { ProjectStatus } from '@/types/project';

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ProjectStatus;
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (active !== null) {
      query.isActive = active === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query).sort({ name: 1 }).lean();

    return NextResponse.json({ projects });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
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

    // Check permissions (only admin and super_admin can create projects)
    if (!['admin', 'super_admin'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      code,
      status,
      startDate,
      endDate,
      technologies,
      repository
    } = body;

    // Validate required fields
    if (!name || !description || !code || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, code, startDate' },
        { status: 400 }
      );
    }

    // Check if project code already exists
    const existingProject = await Project.findOne({ code: code.toUpperCase() });
    if (existingProject) {
      return NextResponse.json(
        { error: 'Project code already exists' },
        { status: 400 }
      );
    }

    // Create new project
    const project = new Project({
      name,
      description,
      code: code.toUpperCase(),
      status: status || ProjectStatus.PLANNING,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      manager: {
        _id: decoded.userId,
        name: decoded.name || 'Unknown',
        email: decoded.email
      },
      team: [],
      technologies: technologies || [],
      repository
    });

    await project.save();

    return NextResponse.json(
      { 
        message: 'Project created successfully',
        project 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating project:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
