import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import { requireAdmin, AuthenticatedAdminRequest } from '@/middleware/adminAuth';
import User from '@/models/User';
import Referral from '@/models/Referral';

async function getReferralPayoutRequestsHandler(request: AuthenticatedAdminRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'requested';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: any = {};
    if (status !== 'all') {
      query.payout_status = status;
    } else {
      query.payout_status = { $in: ['requested', 'approved', 'paid', 'rejected'] };
    }

    // Get referrals with payout requests
    const referrals = await Referral.find(query)
      .populate('referrer_id', 'name email phone referral_code referral_earnings')
      .populate('referred_user_id', 'name email')
      .populate('form_id', 'tracking_id processing_status')
      .sort({ payout_requested_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await Referral.countDocuments(query);

    // Group by referrer for summary
    const referrerMap = new Map();
    referrals.forEach(ref => {
      const referrerId = ref.referrer_id._id.toString();
      if (!referrerMap.has(referrerId)) {
        referrerMap.set(referrerId, {
          referrer: ref.referrer_id,
          referrals: [],
          total_amount: 0
        });
      }
      const data = referrerMap.get(referrerId);
      data.referrals.push(ref);
      data.total_amount += ref.payout_amount || ref.reward_amount;
    });

    const payoutRequests = Array.from(referrerMap.values()).map(data => ({
      referrer: {
        id: data.referrer._id,
        name: data.referrer.name,
        email: data.referrer.email,
        phone: data.referrer.phone,
        referral_code: data.referrer.referral_code,
        total_earnings: data.referrer.referral_earnings
      },
      payout_amount: data.total_amount,
      referral_count: data.referrals.length,
      payout_status: data.referrals[0].payout_status,
      requested_at: data.referrals[0].payout_requested_at,
      processed_at: data.referrals[0].payout_processed_at,
      notes: data.referrals[0].payout_notes,
      referrals: data.referrals.map(ref => ({
        id: ref._id,
        referred_user: {
          name: (ref.referred_user_id as any)?.name,
          email: (ref.referred_user_id as any)?.email
        },
        form_tracking_id: (ref.form_id as any)?.tracking_id,
        reward_amount: ref.reward_amount,
        reward_status: ref.reward_status
      }))
    }));

    return NextResponse.json({
      success: true,
      data: {
        payout_requests: payoutRequests,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get referral payout requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(ensureDBConnection(getReferralPayoutRequestsHandler));

