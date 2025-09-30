import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  form_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_gateway_response?: any;
  created_at: Date;
  updated_at: Date;
}

const PaymentSchema: Schema = new Schema({
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
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'ETB'],
    default: 'USD'
  },
  payment_method: {
    type: String,
    required: true
  },
  transaction_id: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_gateway_response: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for faster queries
PaymentSchema.index({ user_id: 1, created_at: -1 });
PaymentSchema.index({ transaction_id: 1 });
PaymentSchema.index({ status: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);