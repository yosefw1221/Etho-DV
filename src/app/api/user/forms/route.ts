import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';
import { requireAuth } from '@/middleware/auth';

async function getUserFormsHandler(request: NextRequest) {
  try {
    const userId = (request as any).user.userId;

    // Get all forms for this user with pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const allForms = await Form.find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform forms for frontend
    const transformedForms = allForms.map((form) => ({
      id: (form as any)._id.toString(),
      reference_number: (form as any).reference_number,
      applicant_name: `${(form as any).applicant_data.first_name} ${
        (form as any).applicant_data.last_name
      }`,
      submission_date: (form as any).created_at.toISOString(),
      processing_status: (form as any).processing_status,
      payment_status: (form as any).payment_status,
      payment_amount: (form as any).payment_amount || 1,
      payment_currency: (form as any).payment_currency || 'USD',
      estimated_completion: (form as any).estimated_completion?.toISOString(),
      result_available: (form as any).result_available || false,
      dv_confirmation_number: (form as any).dv_confirmation_number,
    }));

    // Get total count for pagination
    const totalCount = await Form.countDocuments({ user_id: userId });

    return NextResponse.json({
      success: true,
      forms: transformedForms,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('User forms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withDBConnection(requireAuth(getUserFormsHandler));
