import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedAdminRequest } from '@/middleware/adminAuth';
import User from '@/models/User';
import Referral from '@/models/Referral';
import { z } from 'zod';

const payoutSchema = z.object({
  referrer_id: z.string().min(1, 'Referrer ID is required'),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional()
});

async function processPayoutHandler(request: AuthenticatedAdminRequest) {
  try {
    const adminId = request.admin?.id;
    const body = await request.json();
    const validatedData = payoutSchema.parse(body);

    const { referrer_id, action, notes } = validatedData;

    // Get all pending payout requests for this referrer
    const pendingReferrals = await Referral.find({
      referrer_id,
      payout_status: 'requested'
    });

    if (pendingReferrals.length === 0) {
      return NextResponse.json(
        { error: 'No pending payout requests found for this user' },
        { status: 404 }
      );
    }

    // Calculate total payout amount
    const totalPayout = pendingReferrals.reduce((sum, ref) => sum + (ref.payout_amount || ref.reward_amount), 0);

    // Update payout status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await Referral.updateMany(
      {
        referrer_id,
        payout_status: 'requested'
      },
      {
        $set: {
          payout_status: newStatus,
          payout_processed_at: new Date(),
          payout_notes: notes || ''
        }
      }
    );

    // If approved, we mark it as paid (in real app, this would be after actual bank transfer)
    if (action === 'approve') {
      // Mark as paid immediately (in production, this would be a separate step)
      await Referral.updateMany(
        {
          referrer_id,
          payout_status: 'approved'
        },
        {
          $set: {
            payout_status: 'paid'
          }
        }
      );

      // Update user's referral earnings (deduct the paid amount)
      await User.findByIdAndUpdate(referrer_id, {
        $inc: { referral_earnings: -totalPayout }
      });
    }

    // Log action
    console.log(`Admin ${adminId} ${action}d payout of ${totalPayout} ETB for user ${referrer_id}`);

    return NextResponse.json({
      success: true,
      message: `Payout ${action}d successfully`,
      data: {
        referrer_id,
        payout_amount: totalPayout,
        referral_count: pendingReferrals.length,
        action,
        processed_at: new Date()
      }
    });
  } catch (error) {
    console.error('Process payout error:', error);

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

export const POST = requireAdmin(processPayoutHandler);

