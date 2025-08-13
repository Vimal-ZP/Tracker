import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Release from '@/models/Release';
import { verifyToken } from '@/lib/auth';
import { ReleaseStatus, ReleaseType } from '@/types/release';

// GET /api/releases - Get all releases with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as ReleaseStatus;
    const type = searchParams.get('type') as ReleaseType;
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const published = searchParams.get('published');

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (published !== null) {
      query.isPublished = published === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { version: { $regex: search, $options: 'i' } }
      ];
    }

    if (dateFrom || dateTo) {
      query.releaseDate = {};
      if (dateFrom) {
        query.releaseDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.releaseDate.$lte = new Date(dateTo);
      }
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [releases, total] = await Promise.all([
      Release.find(query)
        .sort({ releaseDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Release.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      releases,
      total,
      page,
      limit,
      totalPages
    });

  } catch (error) {
    console.error('Error fetching releases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch releases' },
      { status: 500 }
    );
  }
}

// POST /api/releases - Create a new release
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

    // Check permissions (only admin and super_admin can create releases)
    if (!['admin', 'super_admin'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      version,
      title,
      description,
      releaseDate,
      status,
      type,
      features,
      bugFixes,
      breakingChanges,
      downloadUrl,
      isPublished
    } = body;

    // Validate required fields
    if (!version || !title || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: version, title, description, type' },
        { status: 400 }
      );
    }

    // Check if version already exists
    const existingRelease = await Release.findOne({ version });
    if (existingRelease) {
      return NextResponse.json(
        { error: 'Release version already exists' },
        { status: 400 }
      );
    }

    // Create new release
    const release = new Release({
      version,
      title,
      description,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      status: status || ReleaseStatus.DRAFT,
      type,
      features: features || [],
      bugFixes: bugFixes || [],
      breakingChanges: breakingChanges || [],
      author: {
        _id: decoded.userId,
        name: decoded.name || 'Unknown',
        email: decoded.email
      },
      downloadUrl,
      isPublished: isPublished || false
    });

    await release.save();

    return NextResponse.json(
      { 
        message: 'Release created successfully',
        release 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating release:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create release' },
      { status: 500 }
    );
  }
}
