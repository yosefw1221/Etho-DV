import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export interface AdminTokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'super_admin';
  isAdmin: true;
}

export interface AuthenticatedAdminRequest extends NextRequest {
  admin?: AdminTokenPayload & {
    id: string;
    permissions: string[];
  };
}

export async function authenticateAdmin(request: NextRequest): Promise<{
  admin: (AdminTokenPayload & { permissions: string[] }) | null;
  error: string | null;
}> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { admin: null, error: 'No token provided' };
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;

    if (!decoded.isAdmin) {
      return { admin: null, error: 'Invalid admin token' };
    }

    // Verify admin user still exists and is active
    await connectDB();
    const adminUser = await AdminUser.findById(decoded.userId);

    if (!adminUser || !adminUser.is_active) {
      return { admin: null, error: 'Admin user not found or inactive' };
    }

    return {
      admin: {
        ...decoded,
        permissions: adminUser.permissions || [],
      },
      error: null,
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return { admin: null, error: 'Authentication failed' };
  }
}

export function requireAdmin(
  handler: (req: AuthenticatedAdminRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const { admin, error } = await authenticateAdmin(request);

    if (error || !admin) {
      return NextResponse.json(
        { error: error || 'Admin authentication required' },
        { status: 401 }
      );
    }

    // Add admin to request object
    (request as AuthenticatedAdminRequest).admin = {
      ...admin,
      id: admin.userId,
    };

    return handler(request as AuthenticatedAdminRequest);
  };
}

export function requireSuperAdmin(
  handler: (req: AuthenticatedAdminRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const { admin, error } = await authenticateAdmin(request);

    if (error || !admin) {
      return NextResponse.json(
        { error: error || 'Admin authentication required' },
        { status: 401 }
      );
    }

    if (admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }

    // Add admin to request object
    (request as AuthenticatedAdminRequest).admin = {
      ...admin,
      id: admin.userId,
    };

    return handler(request as AuthenticatedAdminRequest);
  };
}

export function requirePermission(
  permission: string,
  handler: (req: AuthenticatedAdminRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const { admin, error } = await authenticateAdmin(request);

    if (error || !admin) {
      return NextResponse.json(
        { error: error || 'Admin authentication required' },
        { status: 401 }
      );
    }

    if (
      !admin.permissions.includes(permission) &&
      admin.role !== 'super_admin'
    ) {
      return NextResponse.json(
        { error: `Permission required: ${permission}` },
        { status: 403 }
      );
    }

    // Add admin to request object
    (request as AuthenticatedAdminRequest).admin = {
      ...admin,
      id: admin.userId,
    };

    return handler(request as AuthenticatedAdminRequest);
  };
}
