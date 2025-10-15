import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';

async function trackApplicationHandler(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params;

    if (!trackingId) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      );
    }

    // Find the form by tracking ID
    const form = await Form.findOne({ tracking_id: trackingId }).lean();

    if (!form) {
      return NextResponse.json(
        { error: 'Application not found. Please check your tracking ID.' },
        { status: 404 }
      );
    }

    // Prepare response data (only public information)
    const responseData = {
      tracking_id: form.tracking_id,
      applicant_name: `${form.applicant_data.first_name} ${form.applicant_data.last_name}`,
      submission_date: form.created_at,
      processing_status: form.processing_status,
      payment_status: form.payment_status,
      completion_document_url: form.completion_document_url,
      admin_notes: form.admin_notes,
      created_at: form.created_at,
      updated_at: form.updated_at
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Track application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = ensureDBConnection(trackApplicationHandler);
