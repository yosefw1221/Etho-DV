import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import { requireAuth } from '@/middleware/auth';
import User from '@/models/User';
import Referral from '@/models/Referral';
import Form from '@/models/Form';

async function getReferralsHandler(request: NextRequest) {
  try {
    const userId = (request as any).user.userId;

    // Get user's referral stats
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all referrals made by this user
    const referrals = await Referral.find({ referrer_id: userId })
      .populate('referred_user_id', 'name email')
      .populate('form_id', 'processing_status created_at tracking_id')
      .sort({ created_at: -1 });

    // Calculate earnings summary
    const totalEarnings = user.referral_earnings || 0;
    const pendingEarnings = referrals
      .filter(ref => ref.reward_status === 'pending')
      .reduce((sum, ref) => sum + ref.reward_amount, 0);
    
    const paidEarnings = referrals
      .filter(ref => ref.reward_status === 'paid')
      .reduce((sum, ref) => sum + ref.reward_amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        referral_code: user.referral_code,
        total_referrals: user.total_referrals || 0,
        total_earnings: totalEarnings,
        pending_earnings: pendingEarnings,
        paid_earnings: paidEarnings,
        earnings_limit: 10000,
        remaining_limit: Math.max(0, 10000 - totalEarnings),
        referrals: referrals.map(ref => ({
          id: ref._id,
          referred_user: {
            name: (ref.referred_user_id as any)?.name || 'Unknown',
            email: (ref.referred_user_id as any)?.email || 'Unknown'
          },
          form_status: (ref.form_id as any)?.processing_status || 'unknown',
          tracking_id: (ref.form_id as any)?.tracking_id || '',
          reward_amount: ref.reward_amount,
          reward_status: ref.reward_status,
          created_at: ref.created_at,
          reward_date: ref.reward_date
        }))
      }
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(ensureDBConnection(getReferralsHandler));
