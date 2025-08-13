import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromptModel from '@/models/Prompt';
import { verifyToken } from '@/lib/auth';

// POST /api/prompts/[id]/usage - Increment usage count
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
    
    // Find and update the prompt
    const prompt = await PromptModel.findOneAndUpdate(
      {
        $or: [
          { _id: params.id },
          { id: params.id }
        ],
        isActive: true
      },
      {
        $inc: { usageCount: 1 },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Usage count incremented',
      usageCount: prompt.usageCount,
      prompt
    });
    
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return NextResponse.json(
      { error: 'Failed to increment usage' },
      { status: 500 }
    );
  }
}
