import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPayment extends Document {
  _id: string;
  applicationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  agentId?: mongoose.Types.ObjectId;
  
  // Payment details
  amount: number;
  currency: 'USD' | 'ETB';
  exchangeRate?: number; // ETB to USD rate at time of payment
  amountUSD: number; // Converted amount in USD
  
  // Payment method
  paymentMethod: 'card' | 'mobile_money' | 'bank_transfer' | 'cash' | 'telebirr' | 'cbepay';
  paymentProvider?: string; // e.g., 'stripe', 'telebirr', 'cbepay'
  
  // Transaction details
  transactionId: string;
  externalTransactionId?: string; // Transaction ID from payment provider
  paymentReference?: string; // Reference number for manual payments
  
  // Status and timestamps
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentDate?: Date;
  completedDate?: Date;
  failedDate?: Date;
  
  // Agent commission (if applicable)
  agentCommission?: number;
  agentCommissionCurrency?: 'USD' | 'ETB';
  agentCommissionPaid?: boolean;
  agentCommissionPaidDate?: Date;
  
  // Receipt and documentation
  receiptNumber?: string;
  receiptUrl?: string;
  invoiceUrl?: string;
  
  // Failure details
  failureReason?: string;
  failureCode?: string;
  
  // Refund details
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;
  refundTransactionId?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Payment details
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    enum: ['USD', 'ETB'],
    required: true,
    default: 'USD'
  },
  exchangeRate: {
    type: Number,
    min: 0
  },
  amountUSD: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['card', 'mobile_money', 'bank_transfer', 'cash', 'telebirr', 'cbepay'],
    required: true
  },
  paymentProvider: {
    type: String,
    trim: true
  },
  
  // Transaction details
  transactionId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  externalTransactionId: {
    type: String,
    trim: true
  },
  paymentReference: {
    type: String,
    trim: true
  },
  
  // Status and timestamps
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  failedDate: {
    type: Date
  },
  
  // Agent commission
  agentCommission: {
    type: Number,
    min: 0
  },
  agentCommissionCurrency: {
    type: String,
    enum: ['USD', 'ETB']
  },
  agentCommissionPaid: {
    type: Boolean,
    default: false
  },
  agentCommissionPaidDate: {
    type: Date
  },
  
  // Receipt and documentation
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  receiptUrl: {
    type: String
  },
  invoiceUrl: {
    type: String
  },
  
  // Failure details
  failureReason: {
    type: String,
    maxlength: 500
  },
  failureCode: {
    type: String,
    maxlength: 50
  },
  
  // Refund details
  refundAmount: {
    type: Number,
    min: 0
  },
  refundDate: {
    type: Date
  },
  refundReason: {
    type: String,
    maxlength: 500
  },
  refundTransactionId: {
    type: String
  },
  
  // Metadata
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Generate transaction ID before saving
paymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionId = `TXN${timestamp}${random}`;
  }
  next();
});

// Generate receipt number when payment is completed
paymentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.receiptNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.receiptNumber = `RCP${date}${random}`;
    this.completedDate = new Date();
  }
  next();
});

// Update payment date when status changes
paymentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'processing':
        if (!this.paymentDate) this.paymentDate = now;
        break;
      case 'completed':
        if (!this.completedDate) this.completedDate = now;
        break;
      case 'failed':
        if (!this.failedDate) this.failedDate = now;
        break;
    }
  }
  next();
});

// Convert amount to USD if needed
paymentSchema.pre('save', function(next) {
  if (this.currency === 'ETB' && this.exchangeRate) {
    this.amountUSD = this.amount / this.exchangeRate;
  } else if (this.currency === 'USD') {
    this.amountUSD = this.amount;
  }
  next();
});

// Calculate agent commission
paymentSchema.methods.calculateAgentCommission = function(commissionRate: number) {
  if (this.agentId && this.status === 'completed') {
    this.agentCommission = (commissionRate / 100) * this.amount;
    this.agentCommissionCurrency = this.currency;
  }
};

// Mark agent commission as paid
paymentSchema.methods.markAgentCommissionPaid = function() {
  if (this.agentCommission && !this.agentCommissionPaid) {
    this.agentCommissionPaid = true;
    this.agentCommissionPaidDate = new Date();
  }
};

// Indexes for performance
paymentSchema.index({ applicationId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ agentId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ completedDate: -1 });
paymentSchema.index({ receiptNumber: 1 });

const Payment = (mongoose.models.Payment as Model<IPayment>) || 
  mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;