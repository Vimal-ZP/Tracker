import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Release from '@/models/Release';
import { verifyToken } from '@/lib/auth';

// GET /api/releases/[id] - Get a specific release
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const release = await Release.findById(params.id).lean();

    if (!release) {
      return NextResponse.json(
        { error: 'Release not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(release);

  } catch (error) {
    console.error('Error fetching release:', error);
    return NextResponse.json(
      { error: 'Failed to fetch release' },
      { status: 500 }
    );
  }
}

// PUT /api/releases/[id] - Update a specific release
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check permissions (only admin and super_admin can update releases)
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
      projectName,
      description,
      releaseDate,
      status,
      type,
      features,
      bugFixes,
      breakingChanges,
      isPublished
    } = body;

    // Check if release exists
    const existingRelease = await Release.findById(params.id);
    if (!existingRelease) {
      return NextResponse.json(
        { error: 'Release not found' },
        { status: 404 }
      );
    }

    // If version is being changed, check if new version already exists
    if (version && version !== existingRelease.version) {
      const versionExists = await Release.findOne({
        version,
        _id: { $ne: params.id }
      });
      if (versionExists) {
        return NextResponse.json(
          { error: 'Release version already exists' },
          { status: 400 }
        );
      }
    }

    // Update release
    const updateData: any = {};
    if (version !== undefined) updateData.version = version;
    if (title !== undefined) updateData.title = title;
    if (projectName !== undefined) updateData.projectName = projectName;
    if (description !== undefined) updateData.description = description;
    if (releaseDate !== undefined) updateData.releaseDate = new Date(releaseDate);
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;
    if (features !== undefined) updateData.features = features;
    if (bugFixes !== undefined) updateData.bugFixes = bugFixes;
    if (breakingChanges !== undefined) updateData.breakingChanges = breakingChanges;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const updatedRelease = await Release.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Release updated successfully',
      release: updatedRelease
    });

  } catch (error: any) {
    console.error('Error updating release:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update release' },
      { status: 500 }
    );
  }
}

// DELETE /api/releases/[id] - Delete a specific release
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check permissions (only super_admin can delete releases)
    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const deletedRelease = await Release.findByIdAndDelete(params.id);

    if (!deletedRelease) {
      return NextResponse.json(
        { error: 'Release not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Release deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting release:', error);
    return NextResponse.json(
      { error: 'Failed to delete release' },
      { status: 500 }
    );
  }
}


