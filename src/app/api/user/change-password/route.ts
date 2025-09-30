import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/middleware/auth';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { z } from 'zod';

const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

async function changePasswordHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const userId = (request as any).user.userId;
    const body = await request.json();
    const validatedData = passwordChangeSchema.parse(body);

    // Get current user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      return NextResponse.json(
        { error: 'This account uses social login. Password cannot be changed.' },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(validatedData.current_password, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(validatedData.new_password);

    // Update password
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    
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

export const PUT = requireAuth(changePasswordHandler);