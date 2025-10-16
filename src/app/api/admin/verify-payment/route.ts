import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import Payment from '@/models/Payment';
import Form from '@/models/Form';
import { requireRole } from '@/middleware/auth';
import { processReferralReward } from '@/lib/referralProcessor';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  payment_id: z.string().min(1, 'Payment ID is required'),
  status: z.enum(['verified', 'rejected']),
  verification_notes: z.string().optional(),
  verified_amount: z.number().optional(),
});

async function verifyPaymentHandler(request: NextRequest) {
  try {

    const adminId = (request as any).user.userId;
    const body = await request.json();
    const validatedData = verifyPaymentSchema.parse(body);

    // Find the payment
    const payment = await Payment.findById(validatedData.payment_id);
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if payment is already processed
    if (payment.status === 'completed' || payment.status === 'failed') {
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      );
    }

    // Update payment status
    const updateData: any = {
      status: validatedData.status === 'verified' ? 'completed' : 'failed',
      verified_by: adminId,
      verified_at: new Date(),
      verification_notes: validatedData.verification_notes
    };

    if (validatedData.verified_amount) {
      updateData.verified_amount = validatedData.verified_amount;
    }

    if (validatedData.status === 'verified') {
      updateData.completed_at = new Date();
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      validatedData.payment_id,
      updateData,
      { new: true }
    );

    // Update associated form status
    const form = await Form.findById(payment.form_id);
    if (form) {
      if (validatedData.status === 'verified') {
        form.payment_status = 'paid';
        form.processing_status = 'submitted';
        if (!form.reference_number) {
          form.reference_number = generateReferenceNumber();
        }
        form.submitted_at = new Date();
        await form.save();

        // Process referral reward when payment is verified
        try {
          console.log(`Processing referral reward for form ${form._id}`);
          await processReferralReward(form._id.toString());
        } catch (error) {
          console.error(`Failed to process referral for form ${form._id}:`, error);
          // Don't fail the payment verification if referral processing fails
        }
      } else {
        form.payment_status = 'failed';
        form.processing_status = 'draft';
        await form.save();
      }
    }

    // Log verification action
    console.log(`Payment ${payment._id} ${validatedData.status} by admin ${adminId}`);

    return NextResponse.json({
      success: true,
      message: `Payment ${validatedData.status} successfully`,
      payment: {
        id: updatedPayment._id,
        status: updatedPayment.status,
        verified_at: updatedPayment.verified_at,
        verification_notes: updatedPayment.verification_notes
      },
      form_status: form ? {
        payment_status: form.payment_status,
        processing_status: form.processing_status,
        reference_number: form.reference_number
      } : null
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}

function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DV${year}${timestamp}${random}`;
}

export const POST = withDBConnection(requireRole(['admin', 'operator'])(verifyPaymentHandler));