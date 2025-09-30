'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PaymentMethod, TransactionReference } from '@/types/payment';
import { cn } from '@/lib/utils';

interface TransactionVerificationProps {
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  formId: string;
  onVerificationSubmit: (reference: TransactionReference) => Promise<void>;
  isVerifying: boolean;
}

const TransactionVerification: React.FC<TransactionVerificationProps> = ({
  paymentMethod,
  amount,
  currency,
  formId,
  onVerificationSubmit,
  isVerifying
}) => {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    reference_number: '',
    amount_paid: amount,
    payment_date: new Date().toISOString().split('T')[0],
    payer_name: '',
    payer_phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reference_number.trim()) {
      newErrors.reference_number = 'Transaction reference number is required';
    } else if (formData.reference_number.length < 6) {
      newErrors.reference_number = 'Reference number seems too short';
    }

    if (!formData.payer_name.trim()) {
      newErrors.payer_name = 'Payer name is required';
    }

    if (formData.amount_paid !== amount) {
      newErrors.amount_paid = `Amount must be exactly ${amount} ${currency}`;
    }

    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required';
    } else {
      const paymentDate = new Date(formData.payment_date);
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      if (paymentDate > today) {
        newErrors.payment_date = 'Payment date cannot be in the future';
      } else if (paymentDate < thirtyDaysAgo) {
        newErrors.payment_date = 'Payment date cannot be more than 30 days ago';
      }
    }

    if (paymentMethod.type === 'mobile' && !formData.payer_phone.trim()) {
      newErrors.payer_phone = 'Phone number is required for mobile payments';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const reference: TransactionReference = {
      reference_number: formData.reference_number.trim(),
      payment_method_id: paymentMethod.id,
      amount_paid: formData.amount_paid,
      payment_date: formData.payment_date,
      payer_name: formData.payer_name.trim(),
      payer_phone: formData.payer_phone.trim() || undefined
    };

    await onVerificationSubmit(reference);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Verify Your Payment
        </h3>
        <p className="text-sm text-gray-600">
          Enter your transaction details below to verify your payment. Make sure all information matches your receipt.
        </p>
      </div>

      {/* Payment Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="font-medium text-primary-900 mb-3 flex items-center">
          <span className="text-xl mr-2">💳</span>
          Payment Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-primary-800">Method:</span>
            <p className="text-primary-700">{paymentMethod.name}</p>
          </div>
          <div>
            <span className="font-medium text-primary-800">Amount:</span>
            <p className="text-primary-700 font-semibold">{amount} {currency}</p>
          </div>
        </div>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Transaction Reference Number"
          value={formData.reference_number}
          onChange={(e) => handleInputChange('reference_number', e.target.value.toUpperCase())}
          error={errors.reference_number}
          required
          placeholder={paymentMethod.type === 'mobile' ? 'TXN123456789' : 'REF123456789'}
          helpText="Enter the reference number from your payment receipt or SMS"
          className="font-mono"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Amount Paid"
            type="number"
            value={formData.amount_paid}
            onChange={(e) => handleInputChange('amount_paid', parseFloat(e.target.value) || 0)}
            error={errors.amount_paid}
            required
            min={0}
            step={0.01}
            helpText={`Must be exactly ${amount} ${currency}`}
          />

          <Input
            label="Payment Date"
            type="date"
            value={formData.payment_date}
            onChange={(e) => handleInputChange('payment_date', e.target.value)}
            error={errors.payment_date}
            required
            max={new Date().toISOString().split('T')[0]}
            helpText="Date when you made the payment"
          />
        </div>

        <Input
          label="Payer Name"
          value={formData.payer_name}
          onChange={(e) => handleInputChange('payer_name', e.target.value)}
          error={errors.payer_name}
          required
          placeholder="Name as shown on the payment receipt"
          helpText="Enter the name exactly as it appears on your receipt"
        />

        {paymentMethod.type === 'mobile' && (
          <Input
            label="Payer Phone Number"
            type="tel"
            value={formData.payer_phone}
            onChange={(e) => handleInputChange('payer_phone', e.target.value)}
            error={errors.payer_phone}
            required
            placeholder="+251911234567"
            helpText="Phone number used for the mobile payment"
          />
        )}

        {/* Important Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            Verification Requirements
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Reference number must match your payment receipt exactly</li>
            <li>• Amount must be the exact amount shown in payment summary</li>
            <li>• Payment date must be when you actually made the payment</li>
            <li>• All information will be verified against payment records</li>
            <li>• False information may result in payment rejection</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            loading={isVerifying}
            disabled={isVerifying}
            size="lg"
            className="px-12"
          >
            {isVerifying ? 'Verifying Payment...' : 'Verify Payment'}
          </Button>
        </div>
      </form>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <span className="text-xl mr-2">💡</span>
          Need Help Finding Your Reference Number?
        </h4>
        <div className="text-sm text-blue-800 space-y-2">
          {paymentMethod.type === 'mobile' ? (
            <>
              <p><strong>TeleBirr:</strong> Check your SMS or app transaction history</p>
              <p><strong>Reference Format:</strong> Usually starts with TXN, REF, or numbers</p>
            </>
          ) : (
            <>
              <p><strong>Bank Transfer:</strong> Check your receipt or bank statement</p>
              <p><strong>Reference Format:</strong> Usually on the receipt as "Ref No" or "Transaction ID"</p>
            </>
          )}
          <p><strong>Still need help?</strong> Contact support with your receipt: support@etho-dv.com</p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          🔒 Your payment information is encrypted and secure. 
          We verify all transactions manually to prevent fraud.
        </p>
      </div>
    </div>
  );
};

export default TransactionVerification;