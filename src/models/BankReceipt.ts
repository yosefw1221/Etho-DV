import mongoose, { Document, Schema } from 'mongoose';

export interface IBankReceipt extends Document {
  form_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_by?: mongoose.Types.ObjectId;
  verification_date?: Date;
  verification_notes?: string;
  created_at: Date;
  updated_at: Date;
}

const BankReceiptSchema: Schema = new Schema({
  form_id: {
    type: Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  file_url: {
    type: String,
    required: true
  },
  file_name: {
    type: String,
    required: true
  },
  file_type: {
    type: String,
    required: true,
    enum: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  },
  file_size: {
    type: Number,
    required: true,
    max: 10485760 // 10MB limit
  },
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verified_by: {
    type: Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  verification_date: {
    type: Date
  },
  verification_notes: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better performance
BankReceiptSchema.index({ form_id: 1 });
BankReceiptSchema.index({ user_id: 1 });
BankReceiptSchema.index({ verification_status: 1 });

export default mongoose.models.BankReceipt || mongoose.model<IBankReceipt>('BankReceipt', BankReceiptSchema);
