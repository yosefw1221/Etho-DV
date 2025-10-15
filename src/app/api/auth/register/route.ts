import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['user', 'agent']).default('user'),
  language_preference: z.enum(['en', 'am', 'ti', 'or']).default('en'),
  business_name: z.string().optional(),
  referral_code: z.string().optional(),
}).refine((data) => {
  // Require either email or phone, but not both
  const hasEmail = data.email && data.email.trim().length > 0;
  const hasPhone = data.phone && data.phone.trim().length > 0;
  return hasEmail || hasPhone;
}, {
  message: "Either email or phone number is required",
  path: ["email"] // This will show the error on the email field
}).refine((data) => {
  // Validate email format if provided
  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(data.email);
  }
  return true;
}, {
  message: "Invalid email format",
  path: ["email"]
}).refine((data) => {
  // Validate phone format if provided
  if (data.phone && data.phone.trim().length > 0) {
    const phoneRegex = /^\+?[\d\s\-()]{8,}$/;
    return phoneRegex.test(data.phone);
  }
  return true;
}, {
  message: "Invalid phone number format",
  path: ["phone"]
});

export async function POST(request: NextRequest) {
  try {
    await ensureDBConnection();

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const {
      email,
      password,
      name,
      phone,
      role,
      language_preference,
      business_name,
      referral_code,
    } = validatedData;

    // Check if user already exists (by email or phone)
    const existingUserQuery = [];
    if (email && email.trim()) {
      existingUserQuery.push({ email: email.trim() });
    }
    if (phone && phone.trim()) {
      existingUserQuery.push({ phone: phone.trim() });
    }

    if (existingUserQuery.length > 0) {
      const existingUser = await User.findOne({ $or: existingUserQuery });
      if (existingUser) {
        const conflictField = existingUser.email === email ? 'email' : 'phone';
        return NextResponse.json(
          { error: `User with this ${conflictField} already exists` },
          { status: 400 }
        );
      }
    }

    // Validate referral code if provided
    let referrerExists = false;
    if (referral_code) {
      const referrer = await User.findOne({ referral_code });
      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        );
      }
      referrerExists = true;
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
      password: hashedPassword,
      name,
      role,
      language_preference,
      referred_by: referral_code || undefined,
    };

    // Add email or phone (whichever was provided)
    if (email && email.trim()) {
      userData.email = email.trim();
    }
    if (phone && phone.trim()) {
      userData.phone = phone.trim();
    }

    if (role === 'agent') {
      userData.business_name = business_name;
    }

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user as any);

    // Remove password from response
    const userResponse = {
      id: user._id,
      email: user.email || null,
      name: user.name,
      phone: user.phone || null,
      role: user.role,
      language_preference: user.language_preference,
      referral_code: user.referral_code,
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
