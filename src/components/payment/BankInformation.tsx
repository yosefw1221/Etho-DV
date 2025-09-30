'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { PaymentMethod } from '@/types/payment';
import { cn } from '@/lib/utils';

interface BankInformationProps {
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  onCopySuccess?: () => void;
}

const BankInformation: React.FC<BankInformationProps> = ({
  paymentMethod,
  amount,
  currency,
  onCopySuccess
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      onCopySuccess?.();
      
      // Reset after 2 seconds
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const CopyableField: React.FC<{
    label: string;
    value: string;
    fieldName: string;
    important?: boolean;
  }> = ({ label, value, fieldName, important = false }) => {
    const isCopied = copiedField === fieldName;
    
    return (
      <div className={cn(
        'flex justify-between items-center p-4 border rounded-lg',
        important ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-gray-50'
      )}>
        <div className="flex-1">
          <p className={cn(
            'text-sm font-medium mb-1',
            important ? 'text-primary-900' : 'text-gray-700'
          )}>
            {label}
          </p>
          <p className={cn(
            'font-mono text-lg',
            important ? 'text-primary-800 font-semibold' : 'text-gray-900'
          )}>
            {value}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(value, fieldName)}
          className={cn(
            'ml-4 min-w-[80px]',
            isCopied && 'bg-green-50 border-green-300 text-green-700'
          )}
        >
          {isCopied ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Payment Details - {paymentMethod.name}
        </h3>
        <p className="text-sm text-gray-600">
          Use the information below to complete your payment. Copy the details carefully to avoid errors.
        </p>
      </div>

      {/* Payment Amount - Most Important */}
      <CopyableField
        label="Amount to Pay"
        value={`${amount} ${currency}`}
        fieldName="amount"
        important={true}
      />

      {/* Account Information */}
      <div className="space-y-4">
        <CopyableField
          label="Account Name"
          value={paymentMethod.account_info.account_name}
          fieldName="account_name"
        />

        <CopyableField
          label={paymentMethod.type === 'mobile' ? 'Phone Number' : 'Account Number'}
          value={paymentMethod.account_info.account_number}
          fieldName="account_number"
        />

        {paymentMethod.account_info.bank_name && (
          <CopyableField
            label="Bank Name"
            value={paymentMethod.account_info.bank_name}
            fieldName="bank_name"
          />
        )}

        {paymentMethod.account_info.additional_info && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-1">Additional Information</p>
            <p className="text-sm text-gray-600">{paymentMethod.account_info.additional_info}</p>
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-4 flex items-center">
          <span className="text-xl mr-2">📋</span>
          Payment Instructions
        </h4>
        <ol className="space-y-2 text-sm text-blue-800">
          {paymentMethod.instructions.map((instruction, index) => (
            <li key={index} className="flex">
              <span className="font-medium mr-2 text-blue-600">{index + 1}.</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Warning Box */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-900 mb-2 flex items-center">
          <span className="text-xl mr-2">⚠️</span>
          Important Warnings
        </h4>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• Use the exact amount shown above ({amount} {currency})</li>
          <li>• Double-check all account details before sending money</li>
          <li>• Keep your transaction reference/receipt safe</li>
          <li>• Do not send money to any other account</li>
          <li>• Contact support if you have any doubts</li>
        </ul>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2 flex items-center">
          <span className="text-xl mr-2">🔒</span>
          Security Notice
        </h4>
        <div className="text-sm text-green-800 space-y-1">
          <p>• Your payment is protected by our verification system</p>
          <p>• We verify each transaction manually for security</p>
          <p>• Only proceed to the next step after completing payment</p>
          <p>• Your form will be processed once payment is confirmed</p>
        </div>
      </div>

      {/* Contact Support */}
      <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">
          Need help with payment?
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm">
          <a 
            href="mailto:support@etho-dv.com" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            📧 support@etho-dv.com
          </a>
          <span className="hidden sm:inline text-gray-400">|</span>
          <a 
            href="tel:+251911234567" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            📞 +251 911 234 567
          </a>
        </div>
      </div>
    </div>
  );
};

export default BankInformation;