import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromptModel from '@/models/Prompt';
import { verifyToken } from '@/lib/auth';
import { CreatePromptData, PromptFilters } from '@/types/prompt';

// GET /api/prompts - Get all prompts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filters: any = { isActive: true };
    
    // Category filter
    const category = searchParams.get('category');
    if (category) {
      filters.category = category;
    }
    
    // Tags filter
    const tags = searchParams.get('tags');
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filters.tags = { $in: tagArray };
    }
    
    // Search filter
    const search = searchParams.get('search');
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Favorite filter
    const isFavorite = searchParams.get('isFavorite');
    if (isFavorite === 'true') {
      filters.isFavorite = true;
    }
    
    // Created by filter
    const createdBy = searchParams.get('createdBy');
    if (createdBy) {
      filters.createdBy = createdBy;
    }
    
    // Language filter
    const language = searchParams.get('language');
    if (language) {
      filters.language = language;
    }
    
    // Model filter
    const model = searchParams.get('model');
    if (model) {
      filters.model = model;
    }
    
    // Date range filters
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) {
        filters.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filters.createdAt.$lte = new Date(dateTo);
      }
    }
    
    // Usage range filters
    const usageMin = searchParams.get('usageMin');
    const usageMax = searchParams.get('usageMax');
    if (usageMin || usageMax) {
      filters.usageCount = {};
      if (usageMin) {
        filters.usageCount.$gte = parseInt(usageMin);
      }
      if (usageMax) {
        filters.usageCount.$lte = parseInt(usageMax);
      }
    }
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sort: any = {};
    sort[sortBy] = sortOrder;
    
    // Execute queries
    const [prompts, total] = await Promise.all([
      PromptModel.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      PromptModel.countDocuments(filters)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      prompts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Create a new prompt
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth_token')?.value;
    
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
    
    const body: CreatePromptData = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }
    
    // Create new prompt
    const promptData = {
      ...body,
      createdBy: decoded.userId,
      usageCount: 0,
      isFavorite: false,
      isActive: true
    };
    
    const prompt = new PromptModel(promptData);
    await prompt.save();
    
    return NextResponse.json(prompt, { status: 201 });
    
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}

// PUT /api/prompts - Bulk update prompts
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth_token')?.value;
    
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
    
    const { promptIds, updates } = await request.json();
    
    if (!promptIds || !Array.isArray(promptIds) || promptIds.length === 0) {
      return NextResponse.json(
        { error: 'Prompt IDs are required' },
        { status: 400 }
      );
    }
    
    // Check permissions - users can only update their own prompts unless they're admin
    const filters: any = { _id: { $in: promptIds } };
    if (decoded.role !== 'super_admin' && decoded.role !== 'admin') {
      filters.createdBy = decoded.userId;
    }
    
    const result = await PromptModel.updateMany(filters, {
      ...updates,
      updatedAt: new Date()
    });
    
    return NextResponse.json({
      message: `Updated ${result.modifiedCount} prompts`,
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Error bulk updating prompts:', error);
    return NextResponse.json(
      { error: 'Failed to update prompts' },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts - Bulk delete prompts
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth_token')?.value;
    
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
    
    const { promptIds } = await request.json();
    
    if (!promptIds || !Array.isArray(promptIds) || promptIds.length === 0) {
      return NextResponse.json(
        { error: 'Prompt IDs are required' },
        { status: 400 }
      );
    }
    
    // Check permissions - users can only delete their own prompts unless they're admin
    const filters: any = { _id: { $in: promptIds } };
    if (decoded.role !== 'super_admin' && decoded.role !== 'admin') {
      filters.createdBy = decoded.userId;
    }
    
    // Soft delete by setting isActive to false
    const result = await PromptModel.updateMany(filters, {
      isActive: false,
      updatedAt: new Date()
    });
    
    return NextResponse.json({
      message: `Deleted ${result.modifiedCount} prompts`,
      deletedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Error bulk deleting prompts:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompts' },
      { status: 500 }
    );
  }
}
