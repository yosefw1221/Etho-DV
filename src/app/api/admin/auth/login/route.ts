import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import AdminUser from '@/models/AdminUser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

    // Generate token with admin role
    const token = jwt.sign(
      {
        userId: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role,
        isAdmin: true
      },
      process.env.NEXTAUTH_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

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
