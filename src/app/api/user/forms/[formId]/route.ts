import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';
import { requireAuth } from '@/middleware/auth';

async function getFormDetailsHandler(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const userId = (request as any).user.userId;
    const userRole = (request as any).user.role;
    const { formId } = params;

    // Admin can access all forms, others can only access their own
    let form;
    if (userRole === 'admin') {
      form = await Form.findById(formId);
    } else {
      // Regular users and agents can only access their own forms
      form = await Form.findOne({
        _id: formId,
        user_id: userId
      });
    }

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or access denied' },
        { status: 404 }
      );
    }

    // Transform form data for frontend
    const formDetails = {
      id: form._id.toString(),
      reference_number: form.reference_number,
      dv_confirmation_number: form.dv_confirmation_number,
      applicant_data: form.applicant_data,
      family_members: form.family_members,
      photos: form.photos,
      processing_status: form.processing_status,
      payment_status: form.payment_status,
      payment_amount: form.payment_amount,
      payment_currency: form.payment_currency,
      submission_date: form.created_at.toISOString(),
      last_updated: form.updated_at.toISOString(),
      estimated_completion: form.estimated_completion?.toISOString(),
      result_available: form.result_available || false,
      status_history: form.status_history || []
    };

    return NextResponse.json({
      success: true,
      form: formDetails
    });

  } catch (error) {
    console.error('Form details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateFormHandler(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const userId = (request as any).user.userId;
    const { formId } = params;
    const body = await request.json();

    // Find the form and verify ownership (only owner can update their own forms)
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

    // Only allow updates for draft forms
    if (form.processing_status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft forms can be updated' },
        { status: 400 }
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      'applicant_data',
      'family_members',
      'photos'
    ];

    const updateData: any = {};
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Form updated successfully',
      form: {
        id: updatedForm._id.toString(),
        processing_status: updatedForm.processing_status,
        last_updated: updatedForm.updated_at.toISOString()
      }
    });

  } catch (error) {
    console.error('Form update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withDBConnection(requireAuth(getFormDetailsHandler));
export const PUT = withDBConnection(requireAuth(updateFormHandler));