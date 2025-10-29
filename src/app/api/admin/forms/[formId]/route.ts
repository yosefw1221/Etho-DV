import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import {
  requireAdmin,
  AuthenticatedAdminRequest,
} from '@/middleware/adminAuth';
import Form from '@/models/Form';
import { processReferralReward } from '@/lib/referralProcessor';
import { z } from 'zod';

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
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Transform form data for admin view
    const formData: any = form;
    const transformedForm = {
      id: formData._id.toString(),
      tracking_id: formData.tracking_id,

      // Applicant Information
      applicant_data: formData.applicant_data,

      // Family Members (spouse and children with photos)
      family_members: formData.family_members || [],

      // Photos - check multiple sources for backward compatibility
      photo_url:
        formData.applicant_data?.photo_url ||
        formData.photo_url ||
        (formData.photos && formData.photos.length > 0
          ? formData.photos[0]
          : undefined),

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

const updateFormSchema = z.object({
  status: z
    .enum([
      'draft',
      'submitted',
      'processing',
      'approved',
      'declined',
      'completed',
      'failed',
    ])
    .optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
  adminNotes: z.string().optional(),
  completionDocumentUrl: z.string().optional(),
});

async function updateFormHandler(
  request: AuthenticatedAdminRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = params;
    const body = await request.json();
    const validatedData = updateFormSchema.parse(body);

    // Find the form
    const form = await Form.findById(formId);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Update fields
    const updateData: any = {
      updated_at: new Date(),
    };

    if (validatedData.status) {
      updateData.processing_status = validatedData.status;
    }

    if (validatedData.paymentStatus) {
      updateData.payment_status = validatedData.paymentStatus;
    }

    if (validatedData.adminNotes !== undefined) {
      updateData.admin_notes = validatedData.adminNotes;
    }

    if (
      validatedData.completionDocumentUrl &&
      validatedData.status === 'completed'
    ) {
      updateData.completion_document_url = validatedData.completionDocumentUrl;
    }

    // Update the form
    const updatedForm = await Form.findByIdAndUpdate(formId, updateData, {
      new: true,
    });

    // Process referral rewards for approved forms
    if (validatedData.status === 'approved') {
      try {
        await processReferralReward(formId);
      } catch (error) {
        console.error(`Failed to process referral for form ${formId}:`, error);
        // Don't fail the update if referral processing fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Form updated successfully',
      form: {
        id: updatedForm?._id.toString(),
        processing_status: updatedForm?.processing_status,
        payment_status: updatedForm?.payment_status,
        admin_notes: updatedForm?.admin_notes,
        completion_document_url: updatedForm?.completion_document_url,
        updated_at: updatedForm?.updated_at,
      },
    });
  } catch (error) {
    console.error('Update form error:', error);

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

export const GET = withDBConnection(
  async (request: NextRequest, context: any) => {
    return requireAdmin(async (req: AuthenticatedAdminRequest) => {
      return getFormDetailsHandler(req, context);
    })(request);
  }
);

export const PUT = withDBConnection(
  async (request: NextRequest, context: any) => {
    return requireAdmin(async (req: AuthenticatedAdminRequest) => {
      return updateFormHandler(req, context);
    })(request);
  }
);
