export interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile' | 'bank';
  logo?: string;
  description: string;
  instructions: string[];
  account_info: {
    account_name: string;
    account_number: string;
    bank_name?: string;
    additional_info?: string;
  };
}

export interface PaymentInfo {
  form_id: string;
  amount: number;
  currency: string;
  user_type: 'individual' | 'agent';
  selected_method?: PaymentMethod;
}

export interface TransactionReference {
  reference_number: string;
  payment_method_id: string;
  amount_paid: number;
  payment_date: string;
  payer_name: string;
  payer_phone?: string;
}

export interface PaymentValidationResponse {
  success: boolean;
  status: 'pending' | 'verified' | 'failed' | 'invalid';
  message: string;
  transaction_id?: string;
  verification_details?: {
    amount_matches: boolean;
    reference_valid: boolean;
    timing_valid: boolean;
  };
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'telebirr',
    name: 'TeleBirr',
    type: 'mobile',
    description: 'Mobile money payment via TeleBirr',
    instructions: [
      'Open your TeleBirr app',
      'Go to "Send Money" or "Transfer"',
      'Enter the receiver phone number below',
      'Enter the amount and confirm payment',
      'Copy the transaction reference number',
      'Return here and enter the reference number'
    ],
    account_info: {
      account_name: 'Etho-DV Services',
      account_number: '+251911234567',
      additional_info: 'Make sure to use the exact amount shown'
    }
  },
  {
    id: 'cbe',
    name: 'Commercial Bank of Ethiopia (CBE)',
    type: 'bank',
    description: 'Bank transfer via CBE',
    instructions: [
      'Visit any CBE branch or use mobile/internet banking',
      'Transfer to the account details below',
      'Keep your transaction receipt',
      'Enter the transaction reference number here',
      'We will verify payment within 2-4 hours'
    ],
    account_info: {
      account_name: 'Etho-DV Services',
      account_number: '1000123456789',
      bank_name: 'Commercial Bank of Ethiopia',
      additional_info: 'Branch: Bole Branch, Addis Ababa'
    }
  },
  {
    id: 'abyssinia',
    name: 'Abyssinia Bank',
    type: 'bank',
    description: 'Bank transfer via Abyssinia Bank',
    instructions: [
      'Visit any Abyssinia Bank branch or use online banking',
      'Transfer to the account details below',
      'Keep your transaction receipt',
      'Enter the transaction reference number here',
      'We will verify payment within 2-4 hours'
    ],
    account_info: {
      account_name: 'Etho-DV Services',
      account_number: '2000987654321',
      bank_name: 'Abyssinia Bank',
      additional_info: 'Branch: Mexico Square Branch, Addis Ababa'
    }
  }
];

export const getPaymentAmount = (userType: 'individual' | 'agent', formCount: number = 1): number => {
  if (userType === 'individual') {
    return 300; // 300 ETB for individuals (controlled in database)
  }
  
  // Agent pricing: flat 300 ETB per form
  // Agents get 20 ETB commission back per completed form
  return 300 * formCount; // 300 ETB per form
};

export const getCurrency = (userType: 'individual' | 'agent'): string => {
  return 'ETB'; // All payments in ETB
};