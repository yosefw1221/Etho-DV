import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import AdminUser from '@/models/AdminUser';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'super_admin']).optional().default('admin'),
  permissions: z.array(z.string()).optional().default([
    'view_forms',
    'approve_forms',
    'decline_forms',
    'complete_forms',
    'bulk_operations',
    'view_analytics'
  ]),
});

async function createAdminHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAdminSchema.parse(body);

    const { email, password, name, role, permissions } = validatedData;

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
      created_at: adminUser.created_at
    };

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: adminResponse
    }, { status: 201 });
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

