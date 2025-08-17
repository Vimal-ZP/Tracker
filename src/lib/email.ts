// Simple email service for password reset
// In a production environment, you would integrate with services like:
// - SendGrid, Mailgun, AWS SES, or similar email providers
// - SMTP servers
// For now, this is a mock implementation that logs to console

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export class EmailService {
    static async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            // In production, replace this with actual email sending logic
            console.log('📧 Email Service - Sending email:');
            console.log('To:', options.to);
            console.log('Subject:', options.subject);
            console.log('HTML Content:', options.html);
            console.log('Text Content:', options.text || 'No text version provided');
            
            // Simulate email sending delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For development, we'll always return success
            // In production, this would return the actual email service response
            return true;
        } catch (error) {
            console.error('❌ Email Service - Failed to send email:', error);
            return false;
        }
    }

    static generatePasswordResetEmail(name: string, resetUrl: string): { html: string; text: string } {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Password Reset - Tracker</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3B82F6, #6366F1); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #3B82F6, #6366F1); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px; }
                    .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                        <p>Tracker Application</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>We received a request to reset your password for your Tracker account.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>
                        
                        <div class="warning">
                            <strong>⚠️ Important Security Information:</strong>
                            <ul>
                                <li>This link will expire in 1 hour for security reasons</li>
                                <li>If you didn't request this reset, please ignore this email</li>
                                <li>Never share this link with anyone</li>
                            </ul>
                        </div>
                        
                        <p>If you're having trouble clicking the button, you can also reset your password by logging into your account and navigating to the password settings.</p>
                    </div>
                    <div class="footer">
                        <p>This email was sent by Tracker Application</p>
                        <p>If you didn't request this password reset, please contact support immediately.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Password Reset Request - Tracker Application

Hello ${name},

We received a request to reset your password for your Tracker account.

Please click the following link to reset your password:
${resetUrl}

Important Security Information:
- This link will expire in 1 hour for security reasons
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

If you're having trouble with the link, you can also reset your password by logging into your account and navigating to the password settings.

This email was sent by Tracker Application.
If you didn't request this password reset, please contact support immediately.
        `;

        return { html, text };
    }
}

export default EmailService;
