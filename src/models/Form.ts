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
  passport_number?: string;
  passport_expiry?: Date;
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
  
  // Contact Information
  address: string;
  phone: string;
  email: string;
  
  // Documentation
  passport_number: string;
  passport_expiry: Date;
  
  // Background
  education_level: string;
  occupation?: string;
  photo_url?: string;
  marital_status: 'Single' | 'Married';
}

export interface IForm extends Document {
  user_id: mongoose.Types.ObjectId;
  applicant_data: IApplicantData;
  family_members: IFamilyMember[];
  photos: string[];
  payment_status: 'pending' | 'paid' | 'failed';
  processing_status: 'draft' | 'submitted' | 'processing' | 'completed' | 'failed';
  confirmation_document_url?: string;
  payment_amount: number;
  payment_currency: string;
  transaction_id?: string;
  created_at: Date;
  updated_at: Date;
}

const FamilyMemberSchema = new Schema({
  relationship_type: {
    type: String,
    enum: ['spouse', 'child'],
    required: true
  },
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  middle_name: {
    type: String,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  date_of_birth: {
    type: Date,
    required: true
  },
  place_of_birth: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  country_of_birth: {
    type: String,
    required: true,
    trim: true
  },
  passport_number: {
    type: String,
    trim: true
  },
  passport_expiry: {
    type: Date
  },
  photo_url: {
    type: String
  }
});

const ApplicantDataSchema = new Schema({
  // Personal Details
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  middle_name: {
    type: String,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  date_of_birth: {
    type: Date,
    required: true
  },
  place_of_birth: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  country_of_birth: {
    type: String,
    required: true,
    trim: true
  },
  country_of_eligibility: {
    type: String,
    trim: true
  },
  
  // Contact Information
  address: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  // Documentation
  passport_number: {
    type: String,
    required: true,
    trim: true
  },
  passport_expiry: {
    type: Date,
    required: true
  },
  
  // Background
  education_level: {
    type: String,
    required: true
  },
  occupation: {
    type: String,
    trim: true
  },
  photo_url: {
    type: String
  },
  marital_status: {
    type: String,
    enum: ['Single', 'Married'],
    required: true
  }
});

const FormSchema: Schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicant_data: {
    type: ApplicantDataSchema,
    required: true
  },
  family_members: [FamilyMemberSchema],
  photos: [String],
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  processing_status: {
    type: String,
    enum: ['draft', 'submitted', 'processing', 'completed', 'failed'],
    default: 'draft'
  },
  confirmation_document_url: {
    type: String
  },
  payment_amount: {
    type: Number,
    required: true
  },
  payment_currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  transaction_id: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for faster queries
FormSchema.index({ user_id: 1, created_at: -1 });
FormSchema.index({ payment_status: 1 });
FormSchema.index({ processing_status: 1 });

export default mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema);