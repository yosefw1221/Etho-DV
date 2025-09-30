import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Form from '@/models/Form';
import { requireAuth } from '@/middleware/auth';

async function getPhotoStatusHandler(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    const userId = (request as any).user.userId;

    // Find the form
    const form = await Form.findOne({ 
      _id: formId, 
      user_id: userId 
    }).select('photos family_members applicant_data.marital_status');

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or access denied' },
        { status: 404 }
      );
    }

    // Determine required photos based on form data
    const requiredPhotos = ['primary']; // Primary applicant always required
    
    // Add spouse if married
    if (form.applicant_data?.marital_status === 'Married') {
      requiredPhotos.push('spouse');
    }

    // Add children
    const children = form.family_members?.filter((member: any) => member.relationship_type === 'child') || [];
    children.forEach((child: any, index: number) => {
      requiredPhotos.push(`child-${child.id || index}`);
    });

    // Check which photos are uploaded
    const uploadedPhotos = form.photos || [];
    const photoStatus = requiredPhotos.map(photoType => {
      const isChildPhoto = photoType.startsWith('child-');
      const uploaded = uploadedPhotos.find((photo: any) => {
        if (isChildPhoto) {
          const childId = photoType.replace('child-', '');
          return photo.person_type === 'child' && photo.person_id === childId;
        }
        return photo.person_type === photoType;
      });

      return {
        person_type: isChildPhoto ? 'child' : photoType,
        person_id: isChildPhoto ? photoType.replace('child-', '') : undefined,
        required: true,
        uploaded: !!uploaded,
        url: uploaded?.url,
        size: uploaded?.size,
        uploaded_at: uploaded?.uploaded_at,
      };
    });

    // Calculate completion stats
    const totalRequired = requiredPhotos.length;
    const totalUploaded = photoStatus.filter(status => status.uploaded).length;
    const completionPercentage = totalRequired > 0 ? Math.round((totalUploaded / totalRequired) * 100) : 100;

    return NextResponse.json({
      success: true,
      form_id: formId,
      photos: photoStatus,
      stats: {
        total_required: totalRequired,
        total_uploaded: totalUploaded,
        completion_percentage: completionPercentage,
        is_complete: totalUploaded === totalRequired,
      }
    });

  } catch (error) {
    console.error('Photo status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getPhotoStatusHandler);