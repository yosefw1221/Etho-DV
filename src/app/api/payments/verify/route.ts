import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Form from '@/models/Form';
import { requireAuth } from '@/middleware/auth';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  form_id: z.string().min(1, 'Form ID is required'),
  reference_number: z.string().min(6, 'Reference number must be at least 6 characters'),
  payment_method_id: z.string().min(1, 'Payment method is required'),
  amount_paid: z.number().positive('Amount must be positive'),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  payer_name: z.string().min(1, 'Payer name is required'),
  payer_phone: z.string().optional()
});

async function verifyPaymentHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = verifyPaymentSchema.parse(body);
    
    const { 
      form_id, 
      reference_number, 
      payment_method_id, 
      amount_paid, 
      payment_date, 
      payer_name,
      payer_phone 
    } = validatedData;

    // Get user from authenticated request
    const userId = (request as any).user.userId;

    // Find the form and verify ownership
    const form = await Form.findById(form_id);
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    if (form.user_id.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if payment already exists for this form
    const existingPayment = await Payment.findOne({ form_id });
    if (existingPayment && existingPayment.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed for this form' },
        { status: 400 }
      );
    }

    // Check for duplicate reference number
    const duplicatePayment = await Payment.findOne({ 
      transaction_id: reference_number,
      status: { $in: ['completed', 'pending'] }
    });
    
    if (duplicatePayment) {
      return NextResponse.json({
        success: false,
        status: 'invalid',
        message: 'This reference number has already been used',
        verification_details: {
          amount_matches: false,
          reference_valid: false,
          timing_valid: false
        }
      });
    }

    // Validate payment amount matches expected amount
    const expectedAmount = form.payment_amount;
    const amountMatches = Math.abs(amount_paid - expectedAmount) < 0.01; // Allow small floating point differences

    // Validate payment date (not older than 30 days, not in future)
    const paymentDateTime = new Date(payment_date);
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const timingValid = paymentDateTime <= now && paymentDateTime >= thirtyDaysAgo;

    // Basic reference number validation (length and format)
    const referenceValid = reference_number.length >= 6 && reference_number.length <= 50;

    // Create or update payment record
    let payment;
    if (existingPayment) {
      payment = existingPayment;
      payment.transaction_id = reference_number;
      payment.amount = amount_paid;
      payment.payment_method = payment_method_id;
      payment.payment_gateway_response = {
        payer_name,
        payer_phone,
        payment_date,
        verification_time: new Date(),
        amount_matches: amountMatches,
        reference_valid: referenceValid,
        timing_valid: timingValid
      };
    } else {
      payment = new Payment({
        form_id,
        user_id: userId,
        amount: amount_paid,
        currency: form.payment_currency,
        payment_method: payment_method_id,
        transaction_id: reference_number,
        payment_gateway_response: {
          payer_name,
          payer_phone,
          payment_date,
          verification_time: new Date(),
          amount_matches: amountMatches,
          reference_valid: referenceValid,
          timing_valid: timingValid
        }
      });
    }

    // Determine payment status based on validation
    if (amountMatches && referenceValid && timingValid) {
      // For TeleBirr, we might auto-approve if all validations pass
      // For bank transfers, always require manual verification
      if (payment_method_id === 'telebirr') {
        payment.status = 'completed';
        form.payment_status = 'paid';
        form.processing_status = 'submitted';
      } else {
        payment.status = 'pending';
        form.payment_status = 'pending';
      }
    } else {
      payment.status = 'failed';
      form.payment_status = 'failed';
    }

    // Save payment and form
    await payment.save();
    await form.save();

    // Simulate external API call for payment verification
    // In real implementation, you would call TeleBirr/bank APIs here
    const verificationResult = await simulatePaymentVerification(
      payment_method_id,
      reference_number,
      amount_paid,
      payment_date
    );

    // Prepare response based on verification result
    let responseStatus: 'pending' | 'verified' | 'failed';
    let message: string;

    if (payment.status === 'completed') {
      responseStatus = 'verified';
      message = 'Payment verified successfully';
    } else if (payment.status === 'pending') {
      responseStatus = 'pending';
      message = 'Payment submitted for manual verification. You will be notified within 2-4 hours.';
    } else {
      responseStatus = 'failed';
      message = 'Payment verification failed. Please check your information and try again.';
    }

    return NextResponse.json({
      success: payment.status !== 'failed',
      status: responseStatus,
      message,
      transaction_id: payment._id.toString(),
      verification_details: {
        amount_matches: amountMatches,
        reference_valid: referenceValid,
        timing_valid: timingValid
      }
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simulate external payment verification API call
async function simulatePaymentVerification(
  paymentMethod: string,
  referenceNumber: string,
  amount: number,
  paymentDate: string
): Promise<{
  success: boolean;
  verified: boolean;
  message: string;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Simulate different responses based on payment method and reference format
  if (paymentMethod === 'telebirr') {
    // Simulate TeleBirr API response
    if (referenceNumber.startsWith('TXN') && referenceNumber.length >= 10) {
      return {
        success: true,
        verified: true,
        message: 'Payment verified with TeleBirr'
      };
    } else {
      return {
        success: false,
        verified: false,
        message: 'Invalid TeleBirr reference number format'
      };
    }
  } else {
    // For bank transfers, always require manual verification
    return {
      success: true,
      verified: false,
      message: 'Submitted for manual verification'
    };
  }
}

export const POST = requireAuth(verifyPaymentHandler);