import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromptModel from '@/models/Prompt';
import { verifyToken } from '@/lib/auth';

// POST /api/prompts/[id]/duplicate - Duplicate a prompt
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
    
    // Find the original prompt
    const originalPrompt = await PromptModel.findOne({
      $or: [
        { _id: params.id },
        { id: params.id }
      ],
      isActive: true
    }).lean();
    
    if (!originalPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // Create duplicate prompt data
    const duplicateData = {
      title: `${originalPrompt.title} (Copy)`,
      content: originalPrompt.content,
      description: originalPrompt.description,
      category: originalPrompt.category,
      tags: [...(originalPrompt.tags || [])],
      variables: originalPrompt.variables ? [...originalPrompt.variables] : [],
      language: originalPrompt.language,
      model: originalPrompt.model,
      temperature: originalPrompt.temperature,
      maxTokens: originalPrompt.maxTokens,
      topP: originalPrompt.topP,
      frequencyPenalty: originalPrompt.frequencyPenalty,
      presencePenalty: originalPrompt.presencePenalty,
      version: originalPrompt.version,
      createdBy: decoded.userId,
      usageCount: 0,
      isFavorite: false,
      isActive: true
    };
    
    // Remove fields that shouldn't be copied
    delete (duplicateData as any)._id;
    delete (duplicateData as any).id;
    delete (duplicateData as any).createdAt;
    delete (duplicateData as any).updatedAt;
    
    // Create the duplicate prompt
    const duplicatePrompt = new PromptModel(duplicateData);
    await duplicatePrompt.save();
    
    return NextResponse.json({
      message: 'Prompt duplicated successfully',
      originalPrompt: originalPrompt,
      duplicatePrompt: duplicatePrompt
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error duplicating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate prompt' },
      { status: 500 }
    );
  }
}
