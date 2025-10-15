import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import { requireAuth } from '@/middleware/auth';
import User from '@/models/User';

async function generateReferralLinkHandler(request: NextRequest) {
  try {
    const userId = (request as any).user.userId;

    // Get user's referral code
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate referral link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const referralLink = `${baseUrl}/register?ref=${user.referral_code}`;

    return NextResponse.json({
      success: true,
      data: {
        referral_code: user.referral_code,
        referral_link: referralLink,
        earnings_limit: 10000,
        current_earnings: user.referral_earnings || 0,
        remaining_limit: Math.max(0, 10000 - (user.referral_earnings || 0))
      }
    });
  } catch (error) {
    console.error('Generate referral link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(ensureDBConnection(generateReferralLinkHandler));
