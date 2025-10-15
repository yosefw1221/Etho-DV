import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';
import { requireAuth } from '@/middleware/auth';

async function getApplicationsHandler(request: NextRequest) {
  try {
    const userId = (request as any).user.userId;

    // Fetch user's applications from the database
    const applications = await Form.find({ user_id: userId })
      .sort({ created_at: -1 })
      .select(
        '_id created_at payment_status processing_status payment_amount payment_currency'
      )
      .lean();

    // Transform the data for the frontend
    const transformedApplications = applications.map((app) => ({
      id: (app as any)._id,
      status: (app as any).processing_status || 'submitted',
      dateSubmitted: (app as any).created_at,
      confirmationNumber: `DV2025-${(app as any)._id
        .toString()
        .slice(-6)
        .toUpperCase()}`,
      paymentStatus: (app as any).payment_status,
      paymentAmount: (app as any).payment_amount,
      paymentCurrency: (app as any).payment_currency,
    }));

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export const GET = withDBConnection(requireAuth(getApplicationsHandler));
