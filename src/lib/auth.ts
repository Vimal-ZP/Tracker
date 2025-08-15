import jwt from 'jsonwebtoken';
import { User, UserRole } from '@/types/user';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
    throw new Error('Please define the JWT_SECRET environment variable');
}

export interface JWTPayload {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

export function generateToken(user: User): string {
    const payload: JWTPayload = {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d', // Token expires in 7 days
    });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
}

export function isAuthorized(userRole: UserRole, action: string): boolean {
    const roleHierarchy = {
        [UserRole.SUPER_ADMIN]: 3,
        [UserRole.ADMIN]: 2,
        [UserRole.BASIC]: 1,
    };

    const actionRequirements = {
        'create_user': UserRole.ADMIN,
        'delete_user': UserRole.SUPER_ADMIN,
        'edit_user': UserRole.ADMIN,
        'view_all_users': UserRole.ADMIN,
        'manage_roles': UserRole.SUPER_ADMIN,
        'access_admin_panel': UserRole.ADMIN,
        'view_reports': UserRole.ADMIN,
        'manage_settings': UserRole.SUPER_ADMIN,
    };

    const requiredRole = actionRequirements[action as keyof typeof actionRequirements];
    if (!requiredRole) return false;

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
