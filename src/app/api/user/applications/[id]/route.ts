import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';
import { requireAuth } from '@/middleware/auth';

async function getApplicationDetailsHandler(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (request as any).user.userId;
    const { id } = await context.params;

    // Fetch the specific application by ID and user
    const application = await Form.findOne({
      _id: id,
      user_id: userId,
    }).lean();

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Transform the data for the frontend
    const transformedApplication = {
      id: (application as any)._id,
      status: (application as any).processing_status || 'draft',
      dateSubmitted: (application as any).created_at,
      confirmationNumber: `DV2025-${(application as any)._id
        .toString()
        .slice(-6)
        .toUpperCase()}`,
      paymentStatus: (application as any).payment_status,
      paymentAmount: (application as any).payment_amount,
      paymentCurrency: (application as any).payment_currency,
      applicant_data: (application as any).applicant_data,
      family_members: (application as any).family_members,
      photos: (application as any).photos,
    };

    return NextResponse.json({
      success: true,
      application: transformedApplication,
    });
  } catch (error) {
    console.error('Application details fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application details' },
      { status: 500 }
    );
  }
}

export const GET = withDBConnection(requireAuth(getApplicationDetailsHandler));
