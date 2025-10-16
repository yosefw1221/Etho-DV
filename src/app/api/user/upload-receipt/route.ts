import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';
import { requireAuth } from '@/middleware/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

async function uploadReceiptHandler(request: NextRequest) {
  try {
    const userId = (request as any).user.userId;
    const formData = await request.formData();
    
    const file = formData.get('receipt') as File;
    const formId = formData.get('formId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Find the form and verify ownership
    const form = await Form.findOne({ _id: formId, user_id: userId });
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or unauthorized' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Update form with receipt URL
    const receiptUrl = `/uploads/${filename}`;
    form.bank_receipt_url = receiptUrl;
    form.payment_status = 'pending'; // Set to pending verification
    form.processing_status = 'submitted'; // Update processing status
    await form.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Receipt uploaded successfully',
        receipt_url: receiptUrl,
        tracking_id: form.tracking_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Receipt upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withDBConnection(requireAuth(uploadReceiptHandler));

