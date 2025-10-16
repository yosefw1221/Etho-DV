import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';
import { requireAuth } from '@/middleware/auth';

async function getUserFormsHandler(request: NextRequest) {
  try {
    const userId = (request as any).user.userId;
    const userRole = (request as any).user.role;

    // Get pagination and filter parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = url.searchParams.get('search') || '';
    const statusFilter = url.searchParams.get('status') || 'all';
    const sortBy = url.searchParams.get('sortBy') || 'newest';

    // Build query based on user role
    let query: any = {};
    
    if (userRole === 'admin') {
      // Admins can see all forms
      query = {};
    } else if (userRole === 'agent') {
      // Agents can see forms they submitted
      query = { user_id: userId };
    } else {
      // Regular users can only see their own forms
      query = { user_id: userId };
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      query.processing_status = statusFilter;
    }

    // Apply search filter (tracking_id or applicant name)
    if (search) {
      query.$or = [
        { tracking_id: { $regex: search, $options: 'i' } },
        { 'applicant_data.first_name': { $regex: search, $options: 'i' } },
        { 'applicant_data.last_name': { $regex: search, $options: 'i' } },
      ];
    }

    // Determine sort order
    let sortOptions: any = { created_at: -1 }; // Default: newest first
    if (sortBy === 'oldest') {
      sortOptions = { created_at: 1 };
    } else if (sortBy === 'status') {
      sortOptions = { processing_status: 1, created_at: -1 };
    }

    const allForms = await Form.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform forms for frontend
    const transformedForms = allForms.map((form) => ({
      id: (form as any)._id.toString(),
      tracking_id: (form as any).tracking_id,
      applicant_name: `${(form as any).applicant_data.first_name} ${
        (form as any).applicant_data.last_name
      }`,
      submission_date: (form as any).created_at,
      last_updated: (form as any).updated_at,
      processing_status: (form as any).processing_status,
      payment_status: (form as any).payment_status,
      payment_amount: (form as any).payment_amount || 1,
      payment_currency: (form as any).payment_currency || 'USD',
      completion_document_url: (form as any).completion_document_url,
    }));

    // Get total count for pagination
    const totalCount = await Form.countDocuments(query);

    // Get stats
    const statsQuery = userRole === 'admin' ? {} : { user_id: userId };
    const totalApplications = await Form.countDocuments(statsQuery);
    const completedApplications = await Form.countDocuments({
      ...statsQuery,
      processing_status: 'completed',
    });
    const pendingApplications = await Form.countDocuments({
      ...statsQuery,
      processing_status: { $in: ['draft', 'submitted', 'processing'] },
    });

    return NextResponse.json({
      success: true,
      forms: transformedForms,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      stats: {
        total: totalApplications,
        successful: completedApplications,
        pending: pendingApplications,
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
