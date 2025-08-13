import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromptCategoryModel from '@/models/PromptCategory';
import { verifyToken } from '@/lib/auth';
import { CreateCategoryData } from '@/types/prompt';

// GET /api/prompt-categories - Get all prompt categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const includeHierarchy = searchParams.get('hierarchy') === 'true';
    const parentId = searchParams.get('parentId');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    if (includeHierarchy) {
      // Return hierarchical structure
      const hierarchy = await PromptCategoryModel.getHierarchy();
      return NextResponse.json({ categories: hierarchy });
    }
    
    // Build filter
    const filters: any = {};
    if (!includeInactive) {
      filters.isActive = true;
    }
    if (parentId) {
      filters.parentId = parentId;
    } else if (parentId === null) {
      filters.parentId = { $exists: false };
    }
    
    // Get categories
    const categories = await PromptCategoryModel.find(filters)
      .sort({ order: 1, name: 1 })
      .lean();
    
    return NextResponse.json({
      categories,
      total: categories.length
    });
    
  } catch (error) {
    console.error('Error fetching prompt categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt categories' },
      { status: 500 }
    );
  }
}

// POST /api/prompt-categories - Create a new prompt category
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
    
    // Check permissions - only admins can create categories
    if (decoded.role !== 'super_admin' && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    const body: CreateCategoryData = await request.json();
    
    // Validate required fields
    if (!body.name || !body.color || !body.icon) {
      return NextResponse.json(
        { error: 'Name, color, and icon are required' },
        { status: 400 }
      );
    }
    
    // Check if category name already exists
    const existingCategory = await PromptCategoryModel.findOne({
      name: body.name,
      parentId: body.parentId || { $exists: false },
      isActive: true
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }
    
    // Create new category
    const categoryData = {
      ...body,
      createdBy: decoded.userId,
      promptCount: 0,
      isActive: true,
      order: body.order || 0
    };
    
    const category = new PromptCategoryModel(categoryData);
    await category.save();
    
    return NextResponse.json(category, { status: 201 });
    
  } catch (error) {
    console.error('Error creating prompt category:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt category' },
      { status: 500 }
    );
  }
}

// PUT /api/prompt-categories - Update prompt counts for all categories
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
    
    // Check permissions - only admins can update all categories
    if (decoded.role !== 'super_admin' && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    await PromptCategoryModel.updateAllPromptCounts();
    
    return NextResponse.json({
      message: 'Prompt counts updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating prompt counts:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt counts' },
      { status: 500 }
    );
  }
}
