import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { LoginCredentials } from '@/types/user';
import { CloudCog } from 'lucide-react';

export async function POST(request: NextRequest) {
    console.log("one");
    try {
        console.log("two");
        await connectDB();
        console.log("three");
        const body: LoginCredentials = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Account is deactivated' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken(user.toJSON());

        // Return user data and token
        return NextResponse.json({
            user: user.toJSON(),
            token,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
