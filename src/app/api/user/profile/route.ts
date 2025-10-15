import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import User from '@/models/User';
import { requireAuth } from '@/middleware/auth';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  language_preference: z.enum(['en', 'am', 'ti', 'or']),
  business_name: z.string().optional(),
});

async function updateUserProfileHandler(request: NextRequest) {
  try {

    const userId = (request as any).user.userId;
    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate business name for agents
    if (user.role === 'agent' && !validatedData.business_name) {
      return NextResponse.json(
        { error: 'Business name is required for agents' },
        { status: 400 }
      );
    }

    // Update user profile
    const updateData: any = {
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      phone: validatedData.phone,
      language_preference: validatedData.language_preference,
    };

    if (user.role === 'agent' && validatedData.business_name) {
      updateData.business_name = validatedData.business_name;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Prepare response
    const userResponse = {
      id: updatedUser._id,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      language_preference: updatedUser.language_preference,
      business_name: updatedUser.business_name,
      current_tier: updatedUser.current_tier,
      discount_rate: updatedUser.discount_rate,
      total_submissions: updatedUser.total_submissions,
      created_at: updatedUser.created_at,
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
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

export const PUT = withDBConnection(requireAuth(updateUserProfileHandler));