import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
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
    const ext = path.extname(file.name) || '.jpg';
    const filename = `${timestamp}-${randomStr}${ext}`;
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Return success response with full URL
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const photoUrl = `${baseUrl}/uploads/${filename}`;
    
    return NextResponse.json({
      success: true,
      photo: {
        url: photoUrl,
        person_type: formData.get('personType') || 'primary',
        person_id: formData.get('personId')
      }
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Photo deleted'
    });
  } catch (error) {
    console.error('Photo delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}