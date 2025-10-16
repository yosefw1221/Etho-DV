'use client';

import React, { useState } from 'react';
import { CheckCircle, Copy, Check, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingId: string;
  locale?: string;
}

const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  isOpen,
  onClose,
  trackingId,
  locale = 'en'
}) => {
  const [copied, setCopied] = useState(false);
  const trackingUrl = `${window.location.origin}/${locale}/track/${trackingId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-2">
              Your application has been successfully submitted and your payment receipt has been uploaded.
            </p>
            <p className="text-sm text-gray-500">
              We'll review your payment and update the status within 24-48 hours.
            </p>
          </div>

          {/* Tracking ID Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Your Tracking ID
              </p>
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <p className="text-xl font-bold text-blue-600 font-mono">
                  {trackingId}
                </p>
              </div>
            </div>

            {/* Tracking URL */}
            <div className="space-y-3">
              <p className="text-xs text-gray-600 text-center">
                Share this link to track your application:
              </p>
              
              <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-gray-200">
                <input
                  type="text"
                  value={trackingUrl}
                  readOnly
                  className="flex-1 text-sm text-gray-700 bg-transparent outline-none overflow-x-auto"
                />
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {copied && (
                <p className="text-xs text-green-600 text-center animate-in fade-in">
                  ✓ Link copied to clipboard!
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href={trackingUrl}
              target="_blank"
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <span>Track Application</span>
              <ExternalLink className="w-4 h-4" />
            </Link>

            <Link
              href={`/${locale}/dashboard`}
              className="w-full block text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>

          {/* Important Note */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-yellow-800">
              <strong>Important:</strong> Please save your tracking ID or bookmark the tracking link. 
              You'll need it to check your application status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccessModal;

