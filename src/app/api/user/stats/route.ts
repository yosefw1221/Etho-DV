import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';
import { requireAuth } from '@/middleware/auth';

async function getUserStatsHandler(request: NextRequest) {
  try {

    const userId = (request as any).user.userId;

    // Get all forms for this user
    const allForms = await Form.find({ user_id: userId });
    
    // Calculate statistics
    const totalSubmissions = allForms.length;
    const completedSubmissions = allForms.filter(f => f.processing_status === 'completed').length;
    const pendingSubmissions = allForms.filter(f => 
      ['submitted', 'processing'].includes(f.processing_status)
    ).length;
    const failedSubmissions = allForms.filter(f => f.processing_status === 'failed').length;

    // Get last submission date
    const lastSubmissionDate = allForms.length > 0 
      ? allForms.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
      : null;

    const stats = {
      total_submissions: totalSubmissions,
      completed_submissions: completedSubmissions,
      pending_submissions: pendingSubmissions,
      failed_submissions: failedSubmissions,
      last_submission_date: lastSubmissionDate?.toISOString()
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('User stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withDBConnection(requireAuth(getUserStatsHandler));