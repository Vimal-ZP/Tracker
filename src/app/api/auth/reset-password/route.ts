import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const { token, password } = await request.json();

        // Validate required fields
        if (!token || !password) {
            return NextResponse.json(
                { error: 'Reset token and new password are required' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }, // Token not expired
            isActive: true
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Update password and clear reset token
        user.password = password; // Will be hashed by the pre-save middleware
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        return NextResponse.json({
            message: 'Password has been reset successfully',
            success: true
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}

// GET endpoint to validate reset token
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Reset token is required' },
                { status: 400 }
            );
        }

        // Check if token exists and is not expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
            isActive: true
        }).select('email name');

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            valid: true,
            email: user.email,
            name: user.name
        });

    } catch (error) {
        console.error('Validate reset token error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}
