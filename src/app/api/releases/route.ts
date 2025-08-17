import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Release from '@/models/Release';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { ReleaseType } from '@/types/release';
import { getUserAccessibleApplications, UserRole } from '@/types/user';

// GET /api/releases - Get all releases with filtering and pagination
export async function GET(request: NextRequest) {
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

    // Get user to check project access
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's accessible applications
    const accessibleApplications = getUserAccessibleApplications(user);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const type = searchParams.get('type') as ReleaseType;
    const applicationName = searchParams.get('applicationName');
    const search = searchParams.get('search');
    const releaseDate = searchParams.get('releaseDate');
    const published = searchParams.get('published');

    // Build query with application filtering
    let applicationFilter = accessibleApplications;

    // If user specifies a specific application, filter further (but only if they have access)
    if (applicationName && accessibleApplications.includes(applicationName)) {
      applicationFilter = [applicationName];
    }

    const query: any = {
      applicationName: { $in: applicationFilter }
    };

    if (type) {
      query.type = type;
    }

    // Role-based filtering: Basic users can only see published releases
    if (user.role === UserRole.BASIC) {
      query.isPublished = true;
    } else if (published !== null) {
      // Super Admin and Admin can filter by published status if specified
      query.isPublished = published === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { version: { $regex: search, $options: 'i' } }
      ];
    }

    if (releaseDate) {
      // Filter by specific release date (same day)
      const filterDate = new Date(releaseDate);
      const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));

      query.releaseDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
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

    // Get user to check project access
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      version,
      title,
      applicationName,
      description,
      releaseDate,

      type,
      features,
      bugFixes,
      breakingChanges,
      workItems,
      isPublished
    } = body;

    // Validate required fields
    if (!title || !applicationName || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, applicationName, description, type' },
        { status: 400 }
      );
    }

    // Check if user has access to the specified application
    const accessibleApplications = getUserAccessibleApplications(user);
    if (!accessibleApplications.includes(applicationName)) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to create releases for this application.' },
        { status: 403 }
      );
    }

    // Check if version already exists (only if version is provided)
    if (version) {
      const existingRelease = await Release.findOne({ version });
      if (existingRelease) {
        return NextResponse.json(
          { error: 'Release version already exists' },
          { status: 400 }
        );
      }
    }

    // Get author name - fallback to database if not in token
    let authorName = decoded.name;
    if (!authorName) {
      const user = await User.findById(decoded.userId);
      authorName = user?.name || 'Unknown';
    }

    // Create new release
    const release = new Release({
      version,
      title,
      applicationName,
      description,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),

      type,
      features: features || [],
      bugFixes: bugFixes || [],
      breakingChanges: breakingChanges || [],
      workItems: workItems || [],
      author: {
        _id: decoded.userId,
        name: authorName,
        email: decoded.email
      },
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
