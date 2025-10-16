import mongoose, { Document, Schema } from 'mongoose';

export interface IFamilyMember {
  relationship_type: 'spouse' | 'child';
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: Date;
  place_of_birth: string;
  gender: 'Male' | 'Female';
  country_of_birth: string;
  // passport_number?: string;
  // passport_expiry?: Date;
  photo_url?: string;
}

export interface IApplicantData {
  // Personal Details
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: Date;
  place_of_birth: string;
  gender: 'Male' | 'Female';
  country_of_birth: string;
  country_of_eligibility?: string;

  // Contact Information (optional for public submissions)
  address?: string;
  phone?: string;
  email?: string;

  // Documentation
  // passport_number: string;
  // passport_expiry: Date;

  // Background
  education_level: string;
  occupation?: string;
  photo_url?: string;
  marital_status: 'Single' | 'Married';
}

export interface IForm extends Document {
  user_id?: mongoose.Types.ObjectId | null; // Optional for public submissions
  applicant_data: IApplicantData;
  family_members: IFamilyMember[];
  photos: string[];
  payment_status: 'pending' | 'paid' | 'failed';
  processing_status:
    | 'draft'
    | 'submitted'
    | 'processing'
    | 'approved'
    | 'declined'
    | 'completed'
    | 'failed';
  confirmation_document_url?: string;
  completion_document_url?: string;
  bank_receipt_url?: string;
  bank_receipt_verified?: boolean;
  payment_amount: number;
  payment_currency: string;
  transaction_id?: string;
  tracking_id: string;
  admin_notes?: string;
  // Optional notification contact for public submissions
  notification_email?: string;
  notification_phone?: string;
  created_at: Date;
  updated_at: Date;
}

const FamilyMemberSchema = new Schema({
  relationship_type: {
    type: String,
    enum: ['spouse', 'child'],
    required: true,
  },
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  middle_name: {
    type: String,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  place_of_birth: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true,
  },
  country_of_birth: {
    type: String,
    required: true,
    trim: true,
  },
  // passport_number: {
  //   type: String,
  //   trim: true
  // },
  // passport_expiry: {
  //   type: Date,
  // },
  photo_url: {
    type: String,
  },
});

const ApplicantDataSchema = new Schema({
  // Personal Details
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  middle_name: {
    type: String,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  place_of_birth: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true,
  },
  country_of_birth: {
    type: String,
    required: true,
    trim: true,
  },
  country_of_eligibility: {
    type: String,
    trim: true,
  },

  // Contact Information (optional for public submissions)
  address: {
    type: String,
    required: false,
    trim: true,
  },
  phone: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
  },

  // Documentation
  // passport_number: {
  //   type: String,
  //   required: true,
  //   trim: true
  // },
  // // passport_expiry: {
  //     type: Date,
  //     required: true,
  //   },

  // Background
  education_level: {
    type: String,
    required: true,
  },
  occupation: {
    type: String,
    trim: true,
  },
  photo_url: {
    type: String,
  },
  marital_status: {
    type: String,
    enum: ['Single', 'Married'],
    required: true,
  },
});

const FormSchema: Schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for public submissions
      default: null,
    },
    applicant_data: {
      type: ApplicantDataSchema,
      required: true,
    },
    family_members: [FamilyMemberSchema],
    photos: [String],
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    processing_status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'processing',
        'approved',
        'declined',
        'completed',
        'failed',
      ],
      default: 'draft',
    },
    confirmation_document_url: {
      type: String,
    },
    completion_document_url: {
      type: String,
    },
    bank_receipt_url: {
      type: String,
    },
    bank_receipt_verified: {
      type: Boolean,
      default: false,
    },
    payment_amount: {
      type: Number,
      required: true,
    },
    payment_currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    transaction_id: {
      type: String,
    },
    tracking_id: {
      type: String,
      required: true,
    },
    admin_notes: {
      type: String,
    },
    // Optional notification contact for public submissions
    notification_email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    notification_phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Generate tracking ID
function generateTrackingId(): string {
  return (
    'TRK-' +
    Date.now() +
    '-' +
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
}

// Pre-save hook to generate tracking ID
FormSchema.pre('save', function (next) {
  if (this.isNew && !this.tracking_id) {
    this.tracking_id = generateTrackingId();
  }
  next();
});

// Index for faster queries
FormSchema.index({ user_id: 1, created_at: -1 });
FormSchema.index({ payment_status: 1 });
FormSchema.index({ processing_status: 1 });
FormSchema.index({ tracking_id: 1 }, { unique: true });

export default mongoose.models.Form ||
  mongoose.model<IForm>('Form', FormSchema);
