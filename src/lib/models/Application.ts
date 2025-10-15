import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFamilyMember {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  placeOfBirth: string;
  relationship: 'spouse' | 'child';
  gender: 'male' | 'female';
}

export interface IApplication extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  agentId?: mongoose.Types.ObjectId;
  confirmationNumber: string;
  
  // Primary applicant information
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  placeOfBirth: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  
  // Contact information
  phone: string;
  address: string;
  city: string;
  country: string;
  
  // Passport information
  passportNumber: string;
  passportExpiry: Date;
  passportCountry: string;
  
  // Education
  education: 'primary' | 'high_school' | 'vocational' | 'university' | 'masters' | 'phd';
  
  // Family members
  familyMembers: IFamilyMember[];
  
  // Photos and documents
  applicantPhoto?: string;
  familyPhotos: string[];
  
  // Application status
  status: 'draft' | 'submitted' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  submissionDate?: Date;
  completionDate?: Date;
  
  // DV lottery specific
  dvYear: string;
  entryConfirmationNumber?: string;
  
  // Payment information
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentAmount: number;
  paymentCurrency: string;
  paymentDate?: Date;
  
  // Processing notes
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const familyMemberSchema = new Schema<IFamilyMember>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  placeOfBirth: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  relationship: {
    type: String,
    enum: ['spouse', 'child'],
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  }
}, { _id: false });

const applicationSchema = new Schema<IApplication>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmationNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Primary applicant information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: 50
  },
  middleName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: 50
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  placeOfBirth: {
    type: String,
    required: [true, 'Place of birth is required'],
    trim: true,
    maxlength: 100
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Gender is required']
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed'],
    required: [true, 'Marital status is required']
  },
  
  // Contact information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: 200
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: 100
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: 100,
    default: 'Ethiopia'
  },
  
  // Passport information
  passportNumber: {
    type: String,
    required: [true, 'Passport number is required'],
    trim: true,
    uppercase: true
  },
  passportExpiry: {
    type: Date,
    required: [true, 'Passport expiry date is required']
  },
  passportCountry: {
    type: String,
    required: [true, 'Passport issuing country is required'],
    trim: true,
    default: 'Ethiopia'
  },
  
  // Education
  education: {
    type: String,
    enum: ['primary', 'high_school', 'vocational', 'university', 'masters', 'phd'],
    required: [true, 'Education level is required']
  },
  
  // Family members
  familyMembers: [familyMemberSchema],
  
  // Photos and documents
  applicantPhoto: {
    type: String
  },
  familyPhotos: [{
    type: String
  }],
  
  // Application status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'draft'
  },
  submissionDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  
  // DV lottery specific
  dvYear: {
    type: String,
    required: true,
    default: () => {
      const currentYear = new Date().getFullYear();
      return `DV${currentYear + 2}`;
    }
  },
  entryConfirmationNumber: {
    type: String,
    uppercase: true
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: true,
    default: 1
  },
  paymentCurrency: {
    type: String,
    required: true,
    default: 'USD'
  },
  paymentDate: {
    type: Date
  },
  
  // Processing notes
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Generate confirmation number before saving
applicationSchema.pre('save', function(next) {
  if (!this.confirmationNumber) {
    const year = this.dvYear.replace('DV', '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.confirmationNumber = `${this.dvYear}-${random}`;
  }
  next();
});

// Update submission date when status changes to submitted
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'submitted' && !this.submissionDate) {
    this.submissionDate = new Date();
  }
  if (this.isModified('status') && this.status === 'completed' && !this.completionDate) {
    this.completionDate = new Date();
  }
  next();
});

// Indexes for performance
applicationSchema.index({ userId: 1 });
applicationSchema.index({ agentId: 1 });
applicationSchema.index({ confirmationNumber: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ submissionDate: -1 });
applicationSchema.index({ dvYear: 1 });

const Application = (mongoose.models.Application as Model<IApplication>) || 
  mongoose.model<IApplication>('Application', applicationSchema);

export default Application;