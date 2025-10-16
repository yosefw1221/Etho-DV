import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import AdminUser from '@/models/AdminUser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';
const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET; // For initial setup only

const createAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'super_admin']).optional().default('admin'),
  permissions: z
    .array(z.string())
    .optional()
    .default([
      'view_forms',
      'approve_forms',
      'decline_forms',
      'complete_forms',
      'bulk_operations',
      'view_analytics',
    ]),
  setup_secret: z.string().optional(), // Only for initial super admin creation
});

async function createAdminHandler(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const setupSecret = request.headers.get('x-setup-secret');

    const body = await request.json();
    const validatedData = createAdminSchema.parse(body);

    const { email, password, name, role, permissions } = validatedData;

    // Count existing admin users
    const superAdminCount = await AdminUser.countDocuments({
      role: 'super_admin',
      is_active: true,
    });

    // Authorization logic
    let isAuthorized = false;
    let requestingAdmin = null;

    // Case 1: Initial setup - no super admins exist
    if (superAdminCount === 0) {
      // ALWAYS require setup secret when no super admins exist (initial setup only)
      if (
        !SUPER_ADMIN_SECRET ||
        !setupSecret ||
        setupSecret !== SUPER_ADMIN_SECRET
      ) {
        return NextResponse.json(
          {
            error:
              'System setup required. Provide X-Setup-Secret header with SUPER_ADMIN_SECRET value.',
          },
          { status: 403 }
        );
      }

      // For initial setup, enforce super_admin role creation
      if (role !== 'super_admin') {
        return NextResponse.json(
          {
            error:
              'Initial setup requires creating a super admin. Set role to "super_admin".',
          },
          { status: 400 }
        );
      }

      isAuthorized = true;
    } else {
      // Case 2: Super admins exist - require authentication
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized. Admin authentication required.' },
          { status: 401 }
        );
      }

      // Verify token
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Get the requesting admin user
        requestingAdmin = await AdminUser.findById(decoded.userId);

        if (!requestingAdmin || !requestingAdmin.is_active) {
          return NextResponse.json(
            { error: 'Unauthorized. Invalid admin credentials.' },
            { status: 401 }
          );
        }

        // Only super admins can create new admins
        if (requestingAdmin.role !== 'super_admin') {
          return NextResponse.json(
            { error: 'Forbidden. Only super admins can create admin users.' },
            { status: 403 }
          );
        }

        // Only super admins can create other super admins
        if (role === 'super_admin' && requestingAdmin.role !== 'super_admin') {
          return NextResponse.json(
            {
              error:
                'Forbidden. Only super admins can create other super admins.',
            },
            { status: 403 }
          );
        }

        isAuthorized = true;
      } catch (error) {
        return NextResponse.json(
          { error: 'Unauthorized. Invalid or expired token.' },
          { status: 401 }
        );
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Check if admin user already exists
    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = new AdminUser({
      email,
      password: hashedPassword,
      name,
      role,
      permissions,
      is_active: true,
    });

    await adminUser.save();

    // Remove password from response
    const adminResponse = {
      id: adminUser._id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      permissions: adminUser.permissions,
      is_active: adminUser.is_active,
      created_at: adminUser.created_at,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Admin user created successfully',
        admin: adminResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create admin error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await ensureDBConnection();
  return createAdminHandler(request);
}
