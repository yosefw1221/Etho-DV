'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import PhotoUploadWithCrop from './PhotoUploadWithCrop';
import { DVFormData } from '@/types/form';

interface PhotoUploadStepProps {
  data: DVFormData;
  updateData: (updates: Partial<DVFormData>) => void;
  errors: Record<string, string>;
}

const PhotoUploadStep: React.FC<PhotoUploadStepProps> = ({
  data,
  updateData,
  errors
}) => {
  const t = useTranslations();
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('form.upload_photo') || 'Upload Your Photo'}
        </h3>
        <p className="text-sm text-gray-600">
          Please upload a recent passport-style photograph that meets the DV lottery requirements.
          Your photo will be automatically resized to 600x600 pixels.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Important Photo Requirements
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Your photo must meet specific DV lottery requirements. Click "View Requirements" below for full details.</p>
            </div>
          </div>
        </div>
      </div>

      <PhotoUploadWithCrop
        formId="temp-form-id"
        personType="primary"
        required
        error={errors.photo}
        currentPhoto={
          data.background_info.photo && typeof data.background_info.photo === 'object' && 'url' in data.background_info.photo
            ? data.background_info.photo.url
            : undefined
        }
        onUploadSuccess={(result) => {
          updateData({
            background_info: {
              ...data.background_info,
              photo: {
                name: 'cropped-photo.jpg',
                url: result.url,
                size: 0
              }
            }
          });
        }}
        onUploadError={(error) => {
          console.error('Photo upload error:', error);
        }}
      />

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowInfoModal(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
        >
          📖 View Complete Photo Requirements & Guidelines
        </button>
      </div>

      {/* Detailed Requirements Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="DV Lottery Photo Requirements"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Technical Requirements:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span><strong>Size:</strong> Will be automatically resized to 600x600 pixels</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span><strong>Format:</strong> JPEG only (.jpg or .jpeg)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span><strong>File Size:</strong> Final size must be under 240KB (automatically handled)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span><strong>Color:</strong> Must be in color (not black and white)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span><strong>Quality:</strong> Clear focus, proper exposure, no pixelation</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="font-semibold text-green-900 mb-3">Photo Composition:</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span><strong>Recency:</strong> Must be taken within the last 6 months</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span><strong>Background:</strong> Plain white or off-white background</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span><strong>Position:</strong> Full face, front view, looking directly at camera</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span><strong>Expression:</strong> Neutral facial expression or natural smile</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span><strong>Eyes:</strong> Both eyes open and clearly visible</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span><strong>Head Coverage:</strong> Head must be bare (no hat, headband, etc.)</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="font-semibold text-red-900 mb-3">Not Acceptable:</h4>
            <ul className="space-y-2 text-sm text-red-800">
              <li className="flex items-start">
                <span className="mr-2">✗</span>
                <span>Eyeglasses (even if you normally wear them)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✗</span>
                <span>Sunglasses or tinted glasses</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✗</span>
                <span>Hats, head coverings, or scarves (except for religious purposes)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✗</span>
                <span>Headphones or wireless hands-free devices</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✗</span>
                <span>Uniforms (unless religious clothing)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✗</span>
                <span>Photos with shadows on face or background</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✗</span>
                <span>Group photos or photos with other people visible</span>
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <h4 className="font-semibold text-purple-900 mb-3">Religious Head Coverings:</h4>
            <p className="text-sm text-purple-800">
              If you wear a head covering for religious purposes, it is acceptable in your photo.
              However, your full face must be visible, and the head covering must not cast shadows on your face.
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-md p-4">
            <h4 className="font-semibold text-gray-900 mb-2">⚠️ Important Notice:</h4>
            <p className="text-sm text-gray-700">
              Submitting a photo that does not meet these requirements may result in disqualification from the DV lottery.
              Please ensure your photo complies with all requirements before proceeding.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PhotoUploadStep;
