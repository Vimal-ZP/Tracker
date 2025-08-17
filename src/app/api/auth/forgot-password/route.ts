import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { EmailService } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const { email } = await request.json();

        // Validate email
        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findOne({ 
            email: email.toLowerCase().trim(),
            isActive: true 
        });

        // Always return success to prevent email enumeration attacks
        // But only send email if user exists
        if (user) {
            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            
            // Set token expiration (1 hour from now)
            const resetTokenExpiry = new Date();
            resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

            // Save reset token to user
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            await user.save();

            // Generate reset URL
            const baseUrl = process.env.NEXTAUTH_URL || 
                           (request.headers.get('host') ? 
                            `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}` : 
                            'http://localhost:3000');
            
            const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

            // Generate email content
            const { html, text } = EmailService.generatePasswordResetEmail(user.name, resetUrl);

            // Send email
            const emailSent = await EmailService.sendEmail({
                to: user.email,
                subject: 'Password Reset Request - Tracker',
                html,
                text
            });

            if (!emailSent) {
                console.error('Failed to send password reset email to:', user.email);
                // Don't expose email sending failure to prevent information leakage
            }
        }

        // Always return success message regardless of whether user exists
        return NextResponse.json({
            message: 'If an account with that email exists, a password reset link has been sent.',
            success: true
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}
