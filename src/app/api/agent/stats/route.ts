import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Form from '@/models/Form';
import Payment from '@/models/Payment';
import { requireRole } from '@/middleware/auth';
import { AgentStats } from '@/types/agent';

async function getAgentStatsHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const userId = (request as any).user.userId;

    // Get all forms for this agent
    const allForms = await Form.find({ user_id: userId });
    
    // Get all payments for this agent
    const allPayments = await Payment.find({ 
      user_id: userId,
      status: 'completed' 
    });

    // Calculate statistics
    const totalSubmissions = allForms.length;
    const completedSubmissions = allForms.filter(f => f.processing_status === 'completed').length;
    const pendingSubmissions = allForms.filter(f => 
      ['submitted', 'processing'].includes(f.processing_status)
    ).length;
    const failedSubmissions = allForms.filter(f => f.processing_status === 'failed').length;

    // Calculate total revenue from completed payments
    const totalRevenue = allPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate this month's submissions
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthSubmissions = allForms.filter(f => 
      new Date(f.created_at) >= thisMonth
    ).length;

    // Determine current tier based on total submissions
    let currentTier: 'bronze' | 'silver' | 'gold' = 'bronze';
    let discountRate = 100; // Default ETB per form
    
    if (totalSubmissions >= 50) {
      currentTier = 'gold';
      discountRate = 50;
    } else if (totalSubmissions >= 11) {
      currentTier = 'silver';
      discountRate = 75;
    }

    // Calculate average processing time (mock data for now)
    const avgProcessingTime = 2.5; // hours

    const stats: AgentStats = {
      total_submissions: totalSubmissions,
      completed_submissions: completedSubmissions,
      pending_submissions: pendingSubmissions,
      failed_submissions: failedSubmissions,
      total_revenue: totalRevenue,
      current_tier: currentTier,
      discount_rate: discountRate,
      this_month_submissions: thisMonthSubmissions,
      avg_processing_time: avgProcessingTime
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Agent stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireRole(['agent'])(getAgentStatsHandler);