import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import { requireAdmin, AuthenticatedAdminRequest } from '@/middleware/adminAuth';
import Form from '@/models/Form';

async function getFormDetailsHandler(
  request: AuthenticatedAdminRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = params;

    // Get form with full details
    const form = await Form.findById(formId)
      .populate('user_id', 'name email phone role business_name')
      .lean();

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Transform form data for admin view
    const formData: any = form;
    const transformedForm = {
      id: formData._id.toString(),
      tracking_id: formData.tracking_id,
      
      // Applicant Information
      applicant_data: formData.applicant_data,
      
      // Contact Information
      contact_info: formData.contact_info,
      
      // Background Information
      background_info: formData.background_info,
      
      // Family Information
      family_info: formData.family_info,
      
      // Photos
      photo_url: formData.photo_url,
      
      // User Information
      user_id: formData.user_id?._id?.toString(),
      user_name: formData.user_id?.name || 'Unknown',
      user_email: formData.user_id?.email || 'Unknown',
      user_phone: formData.user_id?.phone,
      user_role: formData.user_id?.role,
      user_business_name: formData.user_id?.business_name,
      
      // Status Information
      processing_status: formData.processing_status,
      payment_status: formData.payment_status,
      payment_amount: formData.payment_amount,
      payment_currency: formData.payment_currency,
      
      // Payment Details
      bank_receipt_url: formData.bank_receipt_url,
      bank_receipt_verified: formData.bank_receipt_verified,
      
      // Admin Fields
      admin_notes: formData.admin_notes,
      completion_document_url: formData.completion_document_url,
      
      // Referral
      referred_by: formData.referred_by,
      referral_code_used: formData.referral_code_used,
      
      // Timestamps
      created_at: formData.created_at,
      updated_at: formData.updated_at,
      submitted_at: formData.submitted_at,
    };

    return NextResponse.json({
      success: true,
      form: transformedForm,
    });
  } catch (error) {
    console.error('Get form details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withDBConnection(
  async (request: NextRequest, context: any) => {
    return requireAdmin(async (req: AuthenticatedAdminRequest) => {
      return getFormDetailsHandler(req, context);
    })(request);
  }
);

