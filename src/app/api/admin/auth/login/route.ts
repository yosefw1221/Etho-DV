import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import AdminUser from '@/models/AdminUser';
import { hashPassword, generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

async function adminLoginHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const { email, password } = validatedData;

    // Find admin user
    const adminUser = await AdminUser.findOne({ email, is_active: true });
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    adminUser.last_login = new Date();
    await adminUser.save();

    // Generate token - create a user-like object for token generation
    const userForToken = {
      _id: adminUser._id,
      email: adminUser.email,
      role: 'admin' as const
    } as any;
    const token = generateToken(userForToken);

    // Remove password from response
    const adminResponse = {
      id: adminUser._id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      permissions: adminUser.permissions,
      last_login: adminUser.last_login
    };

    return NextResponse.json({
      success: true,
      admin: adminResponse,
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);

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
  return adminLoginHandler(request);
}
