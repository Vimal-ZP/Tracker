import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';
import { UserRole } from '@/types/user';

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        userId: string;
        email: string;
        role: UserRole;
    };
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return async (req: AuthenticatedRequest) => {
        try {
            const authHeader = req.headers.get('authorization');
            const token = extractTokenFromHeader(authHeader || '');

            if (!token) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }

            const payload = verifyToken(token);
            if (!payload) {
                return NextResponse.json(
                    { error: 'Invalid or expired token' },
                    { status: 401 }
                );
            }

            req.user = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            };

            return handler(req);
        } catch (error) {
            console.error('Authentication error:', error);
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 401 }
            );
        }
    };
}

export function withRoleAuth(requiredRoles: UserRole[]) {
    return function (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
        return withAuth(async (req: AuthenticatedRequest) => {
            if (!req.user) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }

            if (!requiredRoles.includes(req.user.role)) {
                return NextResponse.json(
                    { error: 'Insufficient permissions' },
                    { status: 403 }
                );
            }

            return handler(req);
        });
    };
}
