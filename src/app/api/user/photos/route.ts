import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Form from '@/models/Form';
import StorageService from '@/lib/storage';
import ImageProcessor from '@/lib/imageProcessor';
import { requireAuth } from '@/middleware/auth';
import { z } from 'zod';

// Validation schema for photo upload
const photoUploadSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  personType: z.enum(['primary', 'spouse', 'child'], {
    errorMap: () => ({ message: 'Person type must be primary, spouse, or child' })
  }),
  personId: z.string().optional(), // For children, to identify which child
});

async function uploadPhotoHandler(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const formId = formData.get('formId') as string;
    const personType = formData.get('personType') as string;
    const personId = formData.get('personId') as string | null;

    // Validate required fields
    const validation = photoUploadSchema.safeParse({
      formId,
      personType,
      personId: personId || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Check if file is provided
    if (!file) {
      return NextResponse.json(
        { error: 'No photo file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const fileValidation = StorageService.validatePhotoFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      );
    }

    const userId = (request as any).user.userId;

    // Check if form exists and belongs to user
    const form = await Form.findOne({ 
      _id: formId, 
      user_id: userId 
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or access denied' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Validate JPEG format
    if (!ImageProcessor.isValidJPEG(fileBuffer)) {
      return NextResponse.json(
        { error: 'Invalid JPEG file format' },
        { status: 400 }
      );
    }

    // Process image (validate dimensions, optimize)
    let processedImage;
    try {
      processedImage = await ImageProcessor.processPhoto(fileBuffer, {
        maxSize: 240 * 1024, // 240KB
        targetDimensions: 800,
        quality: 85
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Image processing failed' },
        { status: 400 }
      );
    }

    // Generate unique file key
    const fileExtension = 'jpg';
    const fileKey = StorageService.generatePhotoKey(
      userId,
      formId,
      personType + (personId ? `-${personId}` : ''),
      fileExtension
    );

    // Upload to DigitalOcean Spaces
    const uploadResult = await StorageService.uploadFile(
      processedImage.buffer,
      fileKey,
      'image/jpeg',
      {
        userId,
        formId,
        personType,
        personId: personId || '',
        originalSize: file.size.toString(),
        processedSize: processedImage.size.toString(),
        dimensions: `${processedImage.width}x${processedImage.height}`,
        uploadDate: new Date().toISOString(),
      }
    );

    // Update form with photo information
    const photoInfo = {
      url: uploadResult.url,
      key: uploadResult.key,
      size: uploadResult.size,
      person_type: personType,
      person_id: personId || undefined,
      uploaded_at: new Date(),
    };

    // Remove any existing photo for this person
    form.photos = form.photos.filter((photo: any) => {
      if (personType === 'child' && personId) {
        return !(photo.person_type === personType && photo.person_id === personId);
      }
      return photo.person_type !== personType;
    });

    // Add new photo
    form.photos.push(photoInfo);
    await form.save();

    return NextResponse.json({
      success: true,
      photo: {
        url: uploadResult.url,
        person_type: personType,
        person_id: personId,
        size: uploadResult.size,
        dimensions: `${processedImage.width}x${processedImage.height}`,
      }
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during photo upload' },
      { status: 500 }
    );
  }
}

async function deletePhotoHandler(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    const personType = searchParams.get('personType');
    const personId = searchParams.get('personId');

    if (!formId || !personType) {
      return NextResponse.json(
        { error: 'Form ID and person type are required' },
        { status: 400 }
      );
    }

    const userId = (request as any).user.userId;

    // Find the form
    const form = await Form.findOne({ 
      _id: formId, 
      user_id: userId 
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or access denied' },
        { status: 404 }
      );
    }

    // Find the photo to delete
    const photoToDelete = form.photos.find((photo: any) => {
      if (personType === 'child' && personId) {
        return photo.person_type === personType && photo.person_id === personId;
      }
      return photo.person_type === personType;
    });

    if (!photoToDelete) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Delete from DigitalOcean Spaces
    try {
      await StorageService.deleteFile(photoToDelete.key);
    } catch (error) {
      console.error('Error deleting from storage:', error);
      // Continue with database deletion even if storage deletion fails
    }

    // Remove from form
    form.photos = form.photos.filter((photo: any) => {
      if (personType === 'child' && personId) {
        return !(photo.person_type === personType && photo.person_id === personId);
      }
      return photo.person_type !== personType;
    });

    await form.save();

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully'
    });

  } catch (error) {
    console.error('Photo deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error during photo deletion' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(uploadPhotoHandler);
export const DELETE = requireAuth(deletePhotoHandler);