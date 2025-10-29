import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import {
  requireAdmin,
  AuthenticatedAdminRequest,
} from '@/middleware/adminAuth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

async function uploadCompletionDocumentHandler(
  request: AuthenticatedAdminRequest
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type - accept PDF, JPG, PNG
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.',
        },
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

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext =
      path.extname(file.name) ||
      (file.type === 'application/pdf' ? '.pdf' : '.jpg');
    const filename = `completion-${timestamp}-${randomStr}${ext}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return success response with URL
    const documentUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: documentUrl,
      filename: filename,
      size: file.size,
    });
  } catch (error) {
    console.error('Completion document upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withDBConnection(
  requireAdmin(uploadCompletionDocumentHandler)
);




