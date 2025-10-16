import { NextRequest, NextResponse } from 'next/server';
import { withDBConnection } from '@/middleware/dbConnection';
import Form from '@/models/Form';
import User from '@/models/User';
import { requireAuth, authenticateUser } from '@/middleware/auth';
import { z } from 'zod';

// Form submission schema for public users (no authentication required)
const formSubmissionSchema = z.object({
  applicant_data: z.object({
    first_name: z.string().min(1, 'First name is required'),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, 'Last name is required'),
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    place_of_birth: z.string().min(1, 'Place of birth is required'),
    gender: z.enum(['Male', 'Female']),
    country_of_birth: z.string().min(1, 'Country of birth is required'),
    address: z.string().optional(),
    phone: z.string().optional(), // Made optional for public submissions
    email: z.string().email('Invalid email format').optional(), // Made optional
    education_level: z.string().min(1, 'Education level is required'),
    occupation: z.string().optional(),
    marital_status: z.enum(['Single', 'Married']),
  }),
  family_members: z
    .array(
      z.object({
        relationship_type: z.enum(['spouse', 'child']),
        first_name: z.string().min(1, 'First name is required'),
        middle_name: z.string().optional(),
        last_name: z.string().min(1, 'Last name is required'),
        date_of_birth: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
        place_of_birth: z.string().min(1, 'Place of birth is required'),
        gender: z.enum(['Male', 'Female']),
        country_of_birth: z.string().min(1, 'Country of birth is required'),
      })
    )
    .optional(),
  photos: z.array(z.string().url('Invalid photo URL')).optional(),
  // Optional notification contact (added at the end of form)
  notification_contact: z
    .object({
      email: z.string().email('Invalid email format').optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

async function submitFormHandler(request: NextRequest) {
  try {
    // Check for optional authentication (for logged-in users)
    const { user: authUser } = await authenticateUser(request);
    const userId = authUser?.userId || null;

    const body = await request.json();
    const validatedData = formSubmissionSchema.parse(body);

    // Validate business rules
    const validationErrors = validateBusinessRules(validatedData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          validation_errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Generate tracking ID
    const generateTrackingId = (): string => {
      return (
        'TRK-' +
        Date.now() +
        '-' +
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
    };

    const trackingId = generateTrackingId();

    // Merge notification contact with applicant data if provided
    const notificationContact = validatedData.notification_contact || {};
    const applicantData = {
      ...validatedData.applicant_data,
      // Use notification contact if primary contact info is not provided
      email:
        validatedData.applicant_data.email ||
        notificationContact.email ||
        undefined,
      phone:
        validatedData.applicant_data.phone ||
        notificationContact.phone ||
        undefined,
      date_of_birth: new Date(validatedData.applicant_data.date_of_birth),
    };

    // Create form with payment information
    const formData = {
      user_id: userId, // Can be null for public submissions
      applicant_data: applicantData,
      family_members:
        validatedData.family_members?.map((member) => ({
          ...member,
          date_of_birth: new Date(member.date_of_birth),
        })) || [],
      photos: validatedData.photos || [],
      payment_amount: 1, // $1 USD for individual users
      payment_currency: 'USD',
      payment_status: 'pending',
      processing_status: 'draft',
      tracking_id: trackingId,
      // Store notification preferences
      notification_email: notificationContact.email,
      notification_phone: notificationContact.phone,
    };

    const form = new Form(formData);
    await form.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Form submitted successfully',
        form_id: form._id.toString(),
        tracking_id: trackingId,
        payment_required: true,
        payment_amount: 1,
        payment_currency: 'USD',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Form submission error:', error);

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

function validateBusinessRules(
  data: any
): Array<{ field: string; error: string }> {
  const errors: Array<{ field: string; error: string }> = [];

  // Check age validation for primary applicant
  const birthDate = new Date(data.applicant_data.date_of_birth);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  if (age < 18 || age > 100) {
    errors.push({
      field: 'applicant_data.date_of_birth',
      error: 'Age must be between 18 and 100 years',
    });
  }

  // Check passport expiry
  // const passportExpiry = new Date(data.applicant_data.passport_expiry);
  // if (passportExpiry <= new Date()) {
  //   errors.push({
  //     field: 'applicant_data.passport_expiry',
  //     error: 'Passport must not be expired',
  //   });
  // }

  // Validate spouse information if married
  if (data.applicant_data.marital_status === 'Married') {
    const spouseExists = data.family_members?.some(
      (member: any) => member.relationship_type === 'spouse'
    );
    if (!spouseExists) {
      errors.push({
        field: 'family_members',
        error: 'Spouse information is required for married applicants',
      });
    }
  }

  // Validate children ages
  data.family_members?.forEach((member: any, index: number) => {
    if (member.relationship_type === 'child') {
      const childBirthDate = new Date(member.date_of_birth);
      const childAge = new Date().getFullYear() - childBirthDate.getFullYear();

      if (childAge >= 21) {
        errors.push({
          field: `family_members[${index}].date_of_birth`,
          error: 'Children must be under 21 years old',
        });
      }
    }
  });

  return errors;
}

// Remove authentication requirement - now open for public submissions
export const POST = withDBConnection(submitFormHandler);
