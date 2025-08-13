import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromptCategoryModel from '@/models/PromptCategory';
import { verifyToken } from '@/lib/auth';
import { UpdateCategoryData } from '@/types/prompt';

// GET /api/prompt-categories/[id] - Get a specific prompt category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const category = await PromptCategoryModel.findOne({
      $or: [
        { _id: params.id },
        { id: params.id }
      ],
      isActive: true
    }).lean();
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
    
  } catch (error) {
    console.error('Error fetching prompt category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt category' },
      { status: 500 }
    );
  }
}

// PUT /api/prompt-categories/[id] - Update a specific prompt category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check permissions - only admins can update categories
    if (decoded.role !== 'super_admin' && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    const body: UpdateCategoryData = await request.json();
    
    // Find the category
    const category = await PromptCategoryModel.findOne({
      $or: [
        { _id: params.id },
        { id: params.id }
      ],
      isActive: true
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if new name conflicts with existing categories
    if (body.name && body.name !== category.name) {
      const existingCategory = await PromptCategoryModel.findOne({
        name: body.name,
        parentId: body.parentId || category.parentId || { $exists: false },
        isActive: true,
        _id: { $ne: category._id }
      });
      
      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update the category
    Object.assign(category, body);
    category.updatedAt = new Date();
    await category.save();
    
    return NextResponse.json(category);
    
  } catch (error) {
    console.error('Error updating prompt category:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt category' },
      { status: 500 }
    );
  }
}

// DELETE /api/prompt-categories/[id] - Delete a specific prompt category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check permissions - only super admins can delete categories
    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    // Find the category
    const category = await PromptCategoryModel.findOne({
      $or: [
        { _id: params.id },
        { id: params.id }
      ],
      isActive: true
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if category has prompts
    if (category.promptCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing prompts' },
        { status: 400 }
      );
    }
    
    // Check if category has child categories
    const childCategories = await PromptCategoryModel.countDocuments({
      parentId: category.id,
      isActive: true
    });
    
    if (childCategories > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with child categories' },
        { status: 400 }
      );
    }
    
    // Soft delete by setting isActive to false
    category.isActive = false;
    category.updatedAt = new Date();
    await category.save();
    
    return NextResponse.json({
      message: 'Category deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting prompt category:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt category' },
      { status: 500 }
    );
  }
}
