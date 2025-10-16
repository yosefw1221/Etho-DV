import { NextRequest, NextResponse } from 'next/server';
import { ensureDBConnection } from '@/middleware/dbConnection';
import { requireAdmin, AuthenticatedAdminRequest } from '@/middleware/adminAuth';
import Form from '@/models/Form';
import User from '@/models/User';
import { processReferralReward } from '@/lib/referralProcessor';

async function getFormsHandler(request: AuthenticatedAdminRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status && status !== 'all') {
      query.processing_status = status;
    }
    if (search) {
      query.$or = [
        { tracking_id: { $regex: search, $options: 'i' } },
        { 'applicant_data.first_name': { $regex: search, $options: 'i' } },
        { 'applicant_data.last_name': { $regex: search, $options: 'i' } },
        { 'applicant_data.email': { $regex: search, $options: 'i' } },
      ];
    }

    // Get forms with pagination
    const forms = await Form.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user_id', 'name email')
      .lean();

    // Get total count
    const totalCount = await Form.countDocuments(query);

    // Transform forms for admin view
    const transformedForms = forms.map((form: any) => ({
      id: form._id.toString(),
      tracking_id: form.tracking_id,
      applicant_name: `${form.applicant_data.first_name} ${form.applicant_data.last_name}`,
      applicant_email: form.applicant_data.email,
      user_name: form.user_id?.name || 'Unknown',
      user_email: form.user_id?.email || 'Unknown',
      submission_date: form.created_at,
      processing_status: form.processing_status,
      payment_status: form.payment_status,
      payment_amount: form.payment_amount,
      bank_receipt_url: form.bank_receipt_url,
      bank_receipt_verified: form.bank_receipt_verified,
      completion_document_url: form.completion_document_url,
      admin_notes: form.admin_notes,
      updated_at: form.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        forms: transformedForms,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get forms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateFormStatusHandler(request: AuthenticatedAdminRequest) {
  try {
    const body = await request.json();
    const { formIds, status, adminNotes, completionDocumentUrl } = body;

    if (!formIds || !Array.isArray(formIds) || formIds.length === 0) {
      return NextResponse.json(
        { error: 'Form IDs are required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Update forms
    const updateData: any = {
      processing_status: status,
      updated_at: new Date(),
    };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    if (completionDocumentUrl && status === 'completed') {
      updateData.completion_document_url = completionDocumentUrl;
    }

    const result = await Form.updateMany({ _id: { $in: formIds } }, updateData);

    // Process referral rewards for approved forms
    if (status === 'approved') {
      for (const formId of formIds) {
        try {
          await processReferralReward(formId);
        } catch (error) {
          console.error(
            `Failed to process referral for form ${formId}:`,
            error
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} form(s)`,
      updated_count: result.modifiedCount,
    });
  } catch (error) {
    console.error('Update form status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = ensureDBConnection(requireAdmin(getFormsHandler));
export const PUT = ensureDBConnection(requireAdmin(updateFormStatusHandler));
