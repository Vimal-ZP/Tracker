import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { CreateUserData, UserRole } from '@/types/user';

export async function POST(request: NextRequest) {
    try {
        console.log('Registration attempt started');

        // Check environment variables
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI not found in environment variables');
            return NextResponse.json(
                { error: 'Server configuration error: Database connection not configured' },
                { status: 500 }
            );
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET not found in environment variables');
            return NextResponse.json(
                { error: 'Server configuration error: JWT secret not configured' },
                { status: 500 }
            );
        }

        // Connect to database
        console.log('Connecting to database...');
        await connectDB();
        console.log('Database connected successfully');

        // Parse request body
        let body: CreateUserData;
        try {
            body = await request.json();
            console.log('Request body parsed:', { email: body.email, name: body.name, role: body.role });
        } catch (parseError) {
            console.error('Failed to parse request body:', parseError);
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const { email, name, password, role = UserRole.BASIC } = body;

        // Validate input
        if (!email || !name || !password) {
            console.log('Validation failed: missing required fields');
            return NextResponse.json(
                { error: 'Email, name, and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            console.log('Validation failed: password too short');
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Check if user already exists
        console.log('Checking for existing user...');
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('User already exists:', email);
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Create new user
        console.log('Creating new user...');
        const user = new User({
            email: email.toLowerCase(),
            name,
            password,
            role,
            isActive: true
        });

        console.log('Saving user to database...');
        await user.save();
        console.log('User saved successfully');

        // Generate JWT token
        console.log('Generating JWT token...');
        const token = generateToken(user.toJSON());
        console.log('JWT token generated successfully');

        // Return user data and token
        return NextResponse.json({
            user: user.toJSON(),
            token,
            message: 'User created successfully'
        }, { status: 201 });

    } catch (error: any) {
        console.error('Registration error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });

        // Handle specific MongoDB errors
        if (error.code === 11000) {
            console.error('Duplicate key error:', error.keyPattern);
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            console.error('Validation errors:', errors);
            return NextResponse.json(
                { error: 'Validation failed', details: errors },
                { status: 400 }
            );
        }

        // Handle MongoDB connection errors
        if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
            console.error('Database connection error:', error.message);
            return NextResponse.json(
                { error: 'Database connection failed. Please try again later.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
