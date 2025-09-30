import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Form from '@/models/Form';
import User from '@/models/User';
import { requireRole } from '@/middleware/auth';
import Papa from 'papaparse';
import { z } from 'zod';

// Validation schema for CSV row data
const csvRowSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  place_of_birth: z.string().min(1, 'Place of birth is required'),
  gender: z.enum(['Male', 'Female'], { errorMap: () => ({ message: 'Gender must be Male or Female' }) }),
  country_of_birth: z.string().min(1, 'Country of birth is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(8, 'Phone number is required'),
  email: z.string().email('Invalid email format'),
  passport_number: z.string().min(1, 'Passport number is required'),
  passport_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid passport expiry date format'),
  education_level: z.string().min(1, 'Education level is required'),
  occupation: z.string().optional(),
  marital_status: z.enum(['Single', 'Married'], { errorMap: () => ({ message: 'Marital status must be Single or Married' }) }),
  // Optional spouse fields
  spouse_first_name: z.string().optional(),
  spouse_last_name: z.string().optional(),
  spouse_date_of_birth: z.string().optional(),
  spouse_place_of_birth: z.string().optional(),
  spouse_gender: z.enum(['Male', 'Female']).optional(),
  spouse_country_of_birth: z.string().optional(),
  spouse_passport_number: z.string().optional(),
  spouse_passport_expiry: z.string().optional(),
  // Optional child fields (up to 3 children)
  child1_first_name: z.string().optional(),
  child1_last_name: z.string().optional(),
  child1_date_of_birth: z.string().optional(),
  child1_place_of_birth: z.string().optional(),
  child1_gender: z.enum(['Male', 'Female']).optional(),
  child1_country_of_birth: z.string().optional(),
  child2_first_name: z.string().optional(),
  child2_last_name: z.string().optional(),
  child2_date_of_birth: z.string().optional(),
  child2_place_of_birth: z.string().optional(),
  child2_gender: z.enum(['Male', 'Female']).optional(),
  child2_country_of_birth: z.string().optional(),
  child3_first_name: z.string().optional(),
  child3_last_name: z.string().optional(),
  child3_date_of_birth: z.string().optional(),
  child3_place_of_birth: z.string().optional(),
  child3_gender: z.enum(['Male', 'Female']).optional(),
  child3_country_of_birth: z.string().optional(),
});

interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

async function bulkUploadHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload CSV or Excel files.' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const userId = (request as any).user.userId;
    
    // Get user info for tier calculation
    const user = await User.findById(userId);
    if (!user || user.role !== 'agent') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Read and parse CSV file
    const fileText = await file.text();
    
    const parseResult = Papa.parse(fileText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_')
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'CSV parsing failed',
        details: parseResult.errors
      }, { status: 400 });
    }

    const csvData = parseResult.data as any[];
    
    if (csvData.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    if (csvData.length > 1000) {
      return NextResponse.json(
        { error: 'Too many rows. Maximum 1000 forms per upload.' },
        { status: 400 }
      );
    }

    // Validate each row
    const validationErrors: ValidationError[] = [];
    const validRows: any[] = [];

    csvData.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
      
      try {
        // Basic validation
        const validatedRow = csvRowSchema.parse(row);
        
        // Additional business logic validation
        const additionalErrors = validateBusinessRules(validatedRow, rowNumber);
        validationErrors.push(...additionalErrors);
        
        if (additionalErrors.length === 0) {
          validRows.push({
            ...validatedRow,
            row_number: rowNumber
          });
        }
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            validationErrors.push({
              row: rowNumber,
              field: err.path.join('.'),
              value: row[err.path[0]] || '',
              error: err.message
            });
          });
        }
      }
    });

    // Calculate costs
    const totalForms = validRows.length;
    const currentTier = user.current_tier || 'bronze';
    const ratePerForm = user.discount_rate || 100;
    const estimatedCost = totalForms * ratePerForm;

    // If validation passed, optionally create draft forms
    let createdForms: string[] = [];
    
    if (validationErrors.length === 0) {
      // Create draft forms in database
      for (const rowData of validRows) {
        try {
          const form = await createFormFromRowData(rowData, userId, ratePerForm);
          createdForms.push(form._id.toString());
        } catch (error) {
          console.error('Error creating form:', error);
          validationErrors.push({
            row: rowData.row_number,
            field: 'general',
            value: '',
            error: 'Failed to create form in database'
          });
        }
      }
    }

    return NextResponse.json({
      success: validationErrors.length === 0,
      total_rows: csvData.length,
      valid_rows: validRows.length,
      validation_errors: validationErrors,
      estimated_cost: estimatedCost,
      rate_per_form: ratePerForm,
      current_tier: currentTier,
      created_forms: createdForms,
      upload_id: Date.now().toString() // For tracking
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateBusinessRules(row: any, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check age validation
  const birthDate = new Date(row.date_of_birth);
  const age = new Date().getFullYear() - birthDate.getFullYear();
  
  if (age < 18 || age > 100) {
    errors.push({
      row: rowNumber,
      field: 'date_of_birth',
      value: row.date_of_birth,
      error: 'Age must be between 18 and 100 years'
    });
  }

  // Check passport expiry
  const passportExpiry = new Date(row.passport_expiry);
  if (passportExpiry <= new Date()) {
    errors.push({
      row: rowNumber,
      field: 'passport_expiry',
      value: row.passport_expiry,
      error: 'Passport must not be expired'
    });
  }

  // Validate spouse information if married
  if (row.marital_status === 'Married') {
    if (!row.spouse_first_name || !row.spouse_last_name) {
      errors.push({
        row: rowNumber,
        field: 'spouse_first_name',
        value: row.spouse_first_name || '',
        error: 'Spouse name is required for married applicants'
      });
    }
    
    if (!row.spouse_date_of_birth) {
      errors.push({
        row: rowNumber,
        field: 'spouse_date_of_birth',
        value: row.spouse_date_of_birth || '',
        error: 'Spouse date of birth is required for married applicants'
      });
    }
  }

  // Validate children ages
  for (let i = 1; i <= 3; i++) {
    const childDob = row[`child${i}_date_of_birth`];
    if (childDob) {
      const childBirthDate = new Date(childDob);
      const childAge = new Date().getFullYear() - childBirthDate.getFullYear();
      
      if (childAge >= 21) {
        errors.push({
          row: rowNumber,
          field: `child${i}_date_of_birth`,
          value: childDob,
          error: 'Children must be under 21 years old'
        });
      }
      
      // If child DOB is provided, name is required
      if (!row[`child${i}_first_name`] || !row[`child${i}_last_name`]) {
        errors.push({
          row: rowNumber,
          field: `child${i}_first_name`,
          value: row[`child${i}_first_name`] || '',
          error: 'Child name is required when date of birth is provided'
        });
      }
    }
  }

  return errors;
}

async function createFormFromRowData(rowData: any, userId: string, costPerForm: number) {
  // Create primary applicant data
  const applicantData = {
    first_name: rowData.first_name,
    middle_name: rowData.middle_name || '',
    last_name: rowData.last_name,
    date_of_birth: new Date(rowData.date_of_birth),
    place_of_birth: rowData.place_of_birth,
    gender: rowData.gender,
    country_of_birth: rowData.country_of_birth,
    address: rowData.address,
    phone: rowData.phone,
    email: rowData.email,
    passport_number: rowData.passport_number,
    passport_expiry: new Date(rowData.passport_expiry),
    education_level: rowData.education_level,
    occupation: rowData.occupation || '',
    marital_status: rowData.marital_status
  };

  // Create family members array
  const familyMembers = [];

  // Add spouse if married
  if (rowData.marital_status === 'Married' && rowData.spouse_first_name) {
    familyMembers.push({
      relationship_type: 'spouse',
      first_name: rowData.spouse_first_name,
      middle_name: '',
      last_name: rowData.spouse_last_name,
      date_of_birth: new Date(rowData.spouse_date_of_birth),
      place_of_birth: rowData.spouse_place_of_birth || rowData.place_of_birth,
      gender: rowData.spouse_gender || (rowData.gender === 'Male' ? 'Female' : 'Male'),
      country_of_birth: rowData.spouse_country_of_birth || rowData.country_of_birth,
      passport_number: rowData.spouse_passport_number || '',
      passport_expiry: rowData.spouse_passport_expiry ? new Date(rowData.spouse_passport_expiry) : undefined
    });
  }

  // Add children
  for (let i = 1; i <= 3; i++) {
    const childFirstName = rowData[`child${i}_first_name`];
    if (childFirstName) {
      familyMembers.push({
        relationship_type: 'child',
        first_name: childFirstName,
        middle_name: '',
        last_name: rowData[`child${i}_last_name`],
        date_of_birth: new Date(rowData[`child${i}_date_of_birth`]),
        place_of_birth: rowData[`child${i}_place_of_birth`] || rowData.place_of_birth,
        gender: rowData[`child${i}_gender`] || 'Male',
        country_of_birth: rowData[`child${i}_country_of_birth`] || rowData.country_of_birth
      });
    }
  }

  // Create the form
  const form = new Form({
    user_id: userId,
    applicant_data,
    family_members: familyMembers,
    photos: [],
    payment_amount: costPerForm,
    payment_currency: 'ETB',
    payment_status: 'pending',
    processing_status: 'draft'
  });

  return await form.save();
}

export const POST = requireRole(['agent'])(bulkUploadHandler);