import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';

async function trackApplicationHandler(
  request: NextRequest,
  context: { params: Promise<{ trackingId: string }> }
) {
  try {
    const params = await context.params;
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

    // Prepare response data (all form information including photos)
    const responseData = {
      tracking_id: form.tracking_id,
      // Personal Information
      applicant_data: {
        first_name: form.applicant_data.first_name,
        middle_name: form.applicant_data.middle_name,
        last_name: form.applicant_data.last_name,
        date_of_birth: form.applicant_data.date_of_birth,
        place_of_birth: form.applicant_data.place_of_birth,
        gender: form.applicant_data.gender,
        country_of_birth: form.applicant_data.country_of_birth,
        country_of_eligibility: form.applicant_data.country_of_eligibility,
        address: form.applicant_data.address,
        phone: form.applicant_data.phone,
        email: form.applicant_data.email,
        education_level: form.applicant_data.education_level,
        occupation: form.applicant_data.occupation,
        marital_status: form.applicant_data.marital_status,
        photo_url: form.applicant_data.photo_url
      },
      // Family Members
      family_members: form.family_members.map((member: any) => ({
        relationship_type: member.relationship_type,
        first_name: member.first_name,
        middle_name: member.middle_name,
        last_name: member.last_name,
        date_of_birth: member.date_of_birth,
        place_of_birth: member.place_of_birth,
        gender: member.gender,
        country_of_birth: member.country_of_birth,
        photo_url: member.photo_url
      })),
      // Photos
      photos: form.photos || [],
      // Status Information
      submission_date: form.created_at,
      processing_status: form.processing_status,
      payment_status: form.payment_status,
      payment_amount: form.payment_amount,
      payment_currency: form.payment_currency,
      completion_document_url: form.completion_document_url,
      admin_notes: form.admin_notes,
      created_at: form.created_at,
      updated_at: form.updated_at,
      submitted_at: form.submitted_at
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ trackingId: string }> }
) {
  await ensureDBConnection();
  return trackApplicationHandler(request, context);
}
