import { NextRequest, NextResponse } from 'next/server';
import Payment from '@/models/Payment';
import Form from '@/models/Form';
import User from '@/models/User';
import { requireAdmin, AuthenticatedAdminRequest } from '@/middleware/adminAuth';
import { withDBConnection } from '@/middleware/dbConnection';

async function getPendingPaymentsHandler(request: AuthenticatedAdminRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get pending payments with user and form details
    const pendingPayments = await Payment.find({
      status: 'pending',
    })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get related data
    const enrichedPayments = await Promise.all(
      pendingPayments.map(async (payment) => {
        // Get user details
        const user = await User.findById((payment as any).user_id).select(
          'first_name last_name email phone role business_name'
        );

        // Get form details
        const form = await Form.findById((payment as any).form_id).select(
          'applicant_data processing_status reference_number'
        );

        return {
          id: (payment as any)._id.toString(),
          amount: (payment as any).amount,
          currency: (payment as any).currency,
          payment_method: (payment as any).payment_method,
          reference_number: (payment as any).reference_number,
          created_at: (payment as any).created_at,
          transaction_id: (payment as any).transaction_id,
          metadata: (payment as any).metadata,
          user: user
            ? {
                id: user._id.toString(),
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                phone: user.phone,
                role: user.role,
                business_name: user.business_name,
              }
            : null,
          form: form
            ? {
                id: form._id.toString(),
                applicant_name: `${form.applicant_data.first_name} ${form.applicant_data.last_name}`,
                processing_status: form.processing_status,
                reference_number: form.reference_number,
              }
            : null,
        };
      })
    );

    // Get total count for pagination
    const totalCount = await Payment.countDocuments({ status: 'pending' });

    return NextResponse.json({
      success: true,
      payments: enrichedPayments,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get pending payments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    );
  }
}

export const GET = withDBConnection(requireAdmin(getPendingPaymentsHandler));
