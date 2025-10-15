import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import User from '@/lib/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  role: z.enum(['user', 'agent']).default('user'),
  language_preference: z.enum(['en', 'am', 'ti', 'or']).default('en'),
  business_name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await ensureDBConnection();

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      role,
      language_preference,
      business_name,
    } = validatedData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Validate business name for agents
    if (role === 'agent' && !business_name) {
      return NextResponse.json(
        { error: 'Business name is required for agents' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userData: any = {
      email,
      password: hashedPassword,
      firstName: first_name,
      lastName: last_name,
      phone,
      role,
      languagePreference: language_preference,
    };

    if (role === 'agent') {
      userData.businessName = business_name;
    }

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user as any);

    // Remove password from response
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      languagePreference: user.languagePreference,
    };

    return NextResponse.json(
      {
        success: true,
        user: userResponse,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' + (error as any).toString() },
      { status: 500 }
    );
  }
}
