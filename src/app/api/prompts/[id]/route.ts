import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromptModel from '@/models/Prompt';
import { verifyToken } from '@/lib/auth';
import { UpdatePromptData } from '@/types/prompt';

// GET /api/prompts/[id] - Get a specific prompt
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const prompt = await PromptModel.findOne({
      $or: [
        { _id: params.id },
        { id: params.id }
      ],
      isActive: true
    }).lean();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(prompt);
    
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

// PUT /api/prompts/[id] - Update a specific prompt
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
    
    const body: UpdatePromptData = await request.json();
    
    // Find the prompt
    const prompt = await PromptModel.findOne({
      $or: [
        { _id: params.id },
        { id: params.id }
      ],
      isActive: true
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // Check permissions - users can only update their own prompts unless they're admin
    if (prompt.createdBy !== decoded.userId && 
        decoded.role !== 'super_admin' && 
        decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    // Update the prompt
    Object.assign(prompt, body);
    prompt.updatedAt = new Date();
    await prompt.save();
    
    return NextResponse.json(prompt);
    
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id] - Delete a specific prompt
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
    
    // Find the prompt
    const prompt = await PromptModel.findOne({
      $or: [
        { _id: params.id },
        { id: params.id }
      ],
      isActive: true
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // Check permissions - users can only delete their own prompts unless they're admin
    if (prompt.createdBy !== decoded.userId && 
        decoded.role !== 'super_admin' && 
        decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    // Soft delete by setting isActive to false
    prompt.isActive = false;
    prompt.updatedAt = new Date();
    await prompt.save();
    
    return NextResponse.json({
      message: 'Prompt deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
