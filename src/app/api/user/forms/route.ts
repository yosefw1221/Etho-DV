import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Form from '@/models/Form';
import { requireAuth } from '@/middleware/auth';

async function getUserFormsHandler(request: NextRequest) {
  try {
    await connectDB();
    
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
    const transformedForms = allForms.map(form => ({
      id: form._id.toString(),
      reference_number: form.reference_number,
      applicant_name: `${form.applicant_data.first_name} ${form.applicant_data.last_name}`,
      submission_date: form.created_at.toISOString(),
      processing_status: form.processing_status,
      payment_status: form.payment_status,
      payment_amount: form.payment_amount || 1,
      payment_currency: form.payment_currency || 'USD',
      estimated_completion: form.estimated_completion?.toISOString(),
      result_available: form.result_available || false,
      dv_confirmation_number: form.dv_confirmation_number
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
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('User forms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getUserFormsHandler);