'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface AbyssiniaPaymentProps {
  amount: number;
  currency: string;
  onPaymentComplete: (data: {
    payment_method: string;
    reference_number: string;
    sender_name: string;
    sender_phone: string;
  }) => void;
  onCancel: () => void;
}

const AbyssiniaPayment: React.FC<AbyssiniaPaymentProps> = ({
  amount,
  currency,
  onPaymentComplete,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_phone: '',
    reference_number: ''
  });
  const [step, setStep] = useState<'instructions' | 'confirmation'>('instructions');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Abyssinia Bank account details for receiving payments
  const abyssiniaAccountDetails = {
    account_name: 'Etho-DV Services',
    account_number: '2000987654321',
    branch: 'Addis Ababa Piassa Branch',
    swift_code: 'ABYSETTA'
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sender_name.trim()) {
      newErrors.sender_name = 'Your full name is required';
    }

    if (!formData.sender_phone.trim()) {
      newErrors.sender_phone = 'Phone number is required';
    } else if (!/^(\+251|251|0)?[97]\d{8}$/.test(formData.sender_phone.replace(/\s/g, ''))) {
      newErrors.sender_phone = 'Please enter a valid Ethiopian phone number';
    }

    if (!formData.reference_number.trim()) {
      newErrors.reference_number = 'Transaction reference number is required';
    } else if (formData.reference_number.length < 8) {
      newErrors.reference_number = 'Please enter a valid transaction reference number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentConfirmation = () => {
    if (!validateForm()) return;

    onPaymentComplete({
      payment_method: 'abyssinia',
      reference_number: formData.reference_number,
      sender_name: formData.sender_name,
      sender_phone: formData.sender_phone
    });
  };

  const renderInstructionsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏦</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Abyssinia Bank Transfer
        </h3>
        <p className="text-gray-600">
          Transfer the payment amount to our Abyssinia Bank account
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-purple-800 font-medium">Payment Amount:</span>
          <span className="text-purple-900 font-bold text-lg">
            {currency === 'USD' ? '$' : 'ETB '}{amount} {currency}
          </span>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">🏦 Abyssinia Bank Account Details</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Account Name:</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{abyssiniaAccountDetails.account_name}</span>
              <button
                onClick={() => copyToClipboard(abyssiniaAccountDetails.account_name)}
                className="text-purple-600 hover:text-purple-700 text-xs"
              >
                📋
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Account Number:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-medium">{abyssiniaAccountDetails.account_number}</span>
              <button
                onClick={() => copyToClipboard(abyssiniaAccountDetails.account_number)}
                className="text-purple-600 hover:text-purple-700 text-xs"
              >
                📋
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Branch:</span>
            <span className="font-medium">{abyssiniaAccountDetails.branch}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">SWIFT Code:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-medium">{abyssiniaAccountDetails.swift_code}</span>
              <button
                onClick={() => copyToClipboard(abyssiniaAccountDetails.swift_code)}
                className="text-purple-600 hover:text-purple-700 text-xs"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-3">📱 How to Transfer</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <div>
            <h5 className="font-medium mb-2">Abyssinia Mobile Banking:</h5>
            <ol className="space-y-1">
              <li>1. Open Abyssinia mobile app</li>
              <li>2. Select "Fund Transfer"</li>
              <li>3. Choose "To Abyssinia Account"</li>
              <li>4. Enter account details above</li>
              <li>5. Enter amount: <strong>{amount} {currency}</strong></li>
              <li>6. Complete transaction</li>
            </ol>
          </div>
          <div>
            <h5 className="font-medium mb-2">Branch/ATM Transfer:</h5>
            <ol className="space-y-1">
              <li>1. Visit any Abyssinia branch or ATM</li>
              <li>2. Fill transfer form or use ATM</li>
              <li>3. Use account details above</li>
              <li>4. Transfer exact amount</li>
              <li>5. Keep the receipt</li>
              <li>6. Note transaction reference</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={() => setStep('confirmation')}
          className="flex-1"
        >
          I've Made the Transfer
        </Button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Confirm Your Transfer
        </h3>
        <p className="text-gray-600">
          Please provide your transfer details for verification
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-purple-800 font-medium">Amount Transferred:</span>
          <span className="text-purple-900 font-bold text-lg">
            {currency === 'USD' ? '$' : 'ETB '}{amount} {currency}
          </span>
        </div>
      </div>

      <Input
        label="Your Full Name"
        type="text"
        value={formData.sender_name}
        onChange={(e) => handleInputChange('sender_name', e.target.value)}
        placeholder="Enter your full name as on bank account"
        error={errors.sender_name}
        required
        infoContent="Enter your full name exactly as it appears on your bank account or ID."
        infoTitle="Sender Name"
      />

      <Input
        label="Your Phone Number"
        type="tel"
        value={formData.sender_phone}
        onChange={(e) => handleInputChange('sender_phone', e.target.value)}
        placeholder="+251912345678"
        error={errors.sender_phone}
        required
        infoContent="Your phone number for verification and payment confirmation."
        infoTitle="Contact Number"
      />

      <Input
        label="Transaction Reference Number"
        type="text"
        value={formData.reference_number}
        onChange={(e) => handleInputChange('reference_number', e.target.value.toUpperCase())}
        placeholder="Enter Abyssinia transaction reference"
        error={errors.reference_number}
        required
        infoContent="The transaction reference number from your Abyssinia Bank transfer receipt or mobile banking confirmation."
        infoTitle="Reference Number"
      />

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setStep('instructions')}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handlePaymentConfirmation}
          className="flex-1"
        >
          Confirm Payment
        </Button>
      </div>

      <div className="text-center">
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            {['instructions', 'confirmation'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step === stepName
                    ? 'bg-primary-600 text-white'
                    : index < ['instructions', 'confirmation'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}>
                  {index + 1}
                </div>
                {index < 1 && (
                  <div className={cn(
                    'w-16 h-1 mx-2',
                    index < ['instructions', 'confirmation'].indexOf(step)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 'instructions' && renderInstructionsStep()}
        {step === 'confirmation' && renderConfirmationStep()}
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">💡 Abyssinia Transfer Help</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Ensure you transfer the exact amount shown</li>
          <li>• Keep your transaction receipt safe</li>
          <li>• Verification may take 2-4 hours during business days</li>
          <li>• Contact support if you encounter any issues</li>
        </ul>
      </div>
    </div>
  );
};

export default AbyssiniaPayment;