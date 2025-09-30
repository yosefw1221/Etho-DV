'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import TeleBirrPayment from './TeleBirrPayment';
import CBEPayment from './CBEPayment';
import AbyssiniaPayment from './AbyssiniaPayment';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  type: 'mobile' | 'bank';
  icon: string;
  fee?: string;
}

interface PaymentMethodSelectorProps {
  amount: number;
  currency: string;
  onMethodSelect: (method: any, referenceNumber?: string) => void;
  locale: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  currency,
  onMethodSelect,
  locale
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'telebirr',
      name: 'TeleBirr',
      description: 'Pay instantly with your TeleBirr mobile wallet',
      type: 'mobile',
      icon: '📱',
      fee: 'No fees'
    },
    {
      id: 'cbe',
      name: 'Commercial Bank of Ethiopia',
      description: 'Bank transfer via CBE mobile banking or branch',
      type: 'bank',
      icon: '🏦',
      fee: 'Standard bank fees apply'
    },
    {
      id: 'abyssinia',
      name: 'Abyssinia Bank',
      description: 'Bank transfer via Abyssinia mobile banking or branch',
      type: 'bank',
      icon: '🏦',
      fee: 'Standard bank fees apply'
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handlePaymentComplete = (paymentData: any) => {
    onMethodSelect(paymentData);
  };

  const handleCancel = () => {
    setSelectedMethod(null);
  };

  // Show specific payment component based on selection
  if (selectedMethod === 'telebirr') {
    return (
      <TeleBirrPayment
        amount={amount}
        currency={currency}
        onPaymentComplete={handlePaymentComplete}
        onCancel={handleCancel}
      />
    );
  }

  if (selectedMethod === 'cbe') {
    return (
      <CBEPayment
        amount={amount}
        currency={currency}
        onPaymentComplete={handlePaymentComplete}
        onCancel={handleCancel}
      />
    );
  }

  if (selectedMethod === 'abyssinia') {
    return (
      <AbyssiniaPayment
        amount={amount}
        currency={currency}
        onPaymentComplete={handlePaymentComplete}
        onCancel={handleCancel}
      />
    );
  }

  // Show method selection
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Payment Method
        </h3>
        <p className="text-gray-600">
          Select your preferred Ethiopian payment method
        </p>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => handleMethodSelect(method.id)}
            className="w-full p-6 border-2 border-gray-200 rounded-lg text-left transition-all duration-200 hover:border-primary-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">{method.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {method.description}
                    </p>
                  </div>
                </div>
                
                <div className="ml-16">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      method.type === 'mobile' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    )}>
                      {method.type === 'mobile' ? 'Mobile Money' : 'Bank Transfer'}
                    </span>
                    
                    <span className="text-gray-500">{method.fee}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {method.type === 'mobile' ? 'Instant verification' : '2-4 hours verification'}
                  </p>
                </div>
              </div>

              <div className="ml-4 text-primary-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Payment Amount Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Amount to Pay:</span>
          <span className="font-bold text-lg text-primary-600">
            {currency === 'USD' ? '$' : 'ETB '}{amount} {currency}
          </span>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">💡 Payment Information</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• All payments are securely processed</li>
          <li>• Keep your transaction reference number safe</li>
          <li>• Payment verification is required before form submission</li>
          <li>• Contact support if you encounter any issues</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;