import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import { requireAuth } from '@/middleware/auth';
import User from '@/models/User';
import Referral from '@/models/Referral';

async function requestPayoutHandler(request: NextRequest) {
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

    // Check if user has earnings to request payout
    const totalEarnings = user.referral_earnings || 0;
    if (totalEarnings <= 0) {
      return NextResponse.json(
        { error: 'No earnings available for payout' },
        { status: 400 }
      );
    }

    // Check if there's already a pending payout request
    const pendingRequest = await Referral.findOne({
      referrer_id: userId,
      payout_status: 'requested'
    });

    if (pendingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending payout request' },
        { status: 400 }
      );
    }

    // Get all paid referrals that haven't been paid out yet
    const paidReferrals = await Referral.find({
      referrer_id: userId,
      reward_status: 'paid',
      payout_status: 'none'
    });

    if (paidReferrals.length === 0) {
      return NextResponse.json(
        { error: 'No referrals available for payout' },
        { status: 400 }
      );
    }

    // Calculate total payout amount
    const payoutAmount = paidReferrals.reduce((sum, ref) => sum + ref.reward_amount, 0);

    // Update all referrals to requested status
    await Referral.updateMany(
      {
        referrer_id: userId,
        reward_status: 'paid',
        payout_status: 'none'
      },
      {
        $set: {
          payout_status: 'requested',
          payout_amount: payoutAmount,
          payout_requested_at: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Payout request submitted successfully',
      data: {
        payout_amount: payoutAmount,
        referral_count: paidReferrals.length,
        requested_at: new Date()
      }
    });
  } catch (error) {
    console.error('Request payout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(ensureDBConnection(requestPayoutHandler));

