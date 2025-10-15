import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';
import { withDBConnection } from '@/middleware/dbConnection';
import User from '@/models/User';

async function getUserProfile(request: NextRequest) {
  try {
    // Get user ID from authenticated request
    const userId = (request as any).user.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userResponse = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      language_preference: user.language_preference,
      business_name: user.business_name,
      current_tier: user.current_tier,
      discount_rate: user.discount_rate,
      total_submissions: user.total_submissions,
      created_at: user.created_at,
    };

    return NextResponse.json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withDBConnection(requireAuth(getUserProfile));
