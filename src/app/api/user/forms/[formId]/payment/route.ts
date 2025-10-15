import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';
import Payment from '@/models/Payment';
import { requireAuth } from '@/middleware/auth';
import { z } from 'zod';

const paymentSchema = z.object({
  payment_method: z.string().min(1, 'Payment method is required'),
  reference_number: z.string().optional(),
});

async function processPaymentHandler(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const userId = (request as any).user.userId;
    const { formId } = params;
    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    // Find the form and verify ownership
    const form = await Form.findOne({
      _id: formId,
      user_id: userId,
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or access denied' },
        { status: 404 }
      );
    }

    // Check if payment is already completed
    if (form.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Payment already completed for this form' },
        { status: 400 }
      );
    }

    // Create payment record
    const paymentData = {
      user_id: userId,
      form_id: formId,
      amount: form.payment_amount || 1,
      currency: form.payment_currency || 'USD',
      payment_method: validatedData.payment_method,
      reference_number: validatedData.reference_number,
      status: 'pending', // In real implementation, this would be 'completed' after verification
      transaction_id: generateTransactionId(),
      metadata: {
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    };

    const payment = new Payment(paymentData);
    await payment.save();

    // For demo purposes, we'll mark payment as completed immediately
    // In production, this would require actual payment gateway integration
    payment.status = 'completed';
    payment.completed_at = new Date();
    await payment.save();

    // Update form status
    form.payment_status = 'paid';
    form.processing_status = 'submitted';
    form.reference_number = generateReferenceNumber();
    form.submitted_at = new Date();
    await form.save();

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      payment_id: payment._id.toString(),
      reference_number: form.reference_number,
      transaction_id: payment.transaction_id,
    });
  } catch (error) {
    console.error('Payment processing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

function generateTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
}

function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DV${year}${timestamp}${random}`;
}

export const POST = withDBConnection(requireAuth(processPaymentHandler));
