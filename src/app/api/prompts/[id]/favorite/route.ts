import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromptModel from '@/models/Prompt';
import { verifyToken } from '@/lib/auth';

// POST /api/prompts/[id]/favorite - Toggle favorite status
export async function POST(
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
    
    // Check permissions - users can only favorite their own prompts or public prompts
    if (prompt.createdBy !== decoded.userId && 
        decoded.role !== 'super_admin' && 
        decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    // Toggle favorite status
    prompt.isFavorite = !prompt.isFavorite;
    prompt.updatedAt = new Date();
    await prompt.save();
    
    return NextResponse.json({
      message: prompt.isFavorite ? 'Added to favorites' : 'Removed from favorites',
      isFavorite: prompt.isFavorite,
      prompt
    });
    
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}
