import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';
import { requireAuth } from '@/middleware/auth';

async function downloadFormHandler(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {

    const userId = (request as any).user.userId;
    const { formId } = params;

    // Find the form and verify ownership
    const form = await Form.findOne({
      _id: formId,
      user_id: userId
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or access denied' },
        { status: 404 }
      );
    }

    // Only allow download for completed forms
    if (form.processing_status !== 'completed') {
      return NextResponse.json(
        { error: 'Form is not yet completed. Download will be available once processing is finished.' },
        { status: 400 }
      );
    }

    // For now, return form data as JSON
    // In production, this would generate and return a PDF
    const formData = {
      reference_number: form.reference_number,
      dv_confirmation_number: form.dv_confirmation_number,
      applicant_data: form.applicant_data,
      family_members: form.family_members,
      submission_date: form.created_at,
      processing_status: form.processing_status,
      completion_date: form.updated_at
    };

    // Create a downloadable JSON response
    // In production, you'd generate a PDF here
    const response = new NextResponse(JSON.stringify(formData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dv-application-${formId}.json"`,
      },
    });

    return response;

  } catch (error) {
    console.error('Form download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withDBConnection(requireAuth(downloadFormHandler));