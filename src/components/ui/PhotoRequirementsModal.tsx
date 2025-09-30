'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PhotoRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PhotoRequirementsModal: React.FC<PhotoRequirementsModalProps> = ({
  isOpen,
  onClose
}) => {
  const t = useTranslations();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              📸 DV Photo Requirements
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quick Reference */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-3">📋 Quick Reference</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-blue-800">Format:</strong> JPEG only<br />
                  <strong className="text-blue-800">Size:</strong> 600x600 to 1200x1200 pixels<br />
                  <strong className="text-blue-800">File Size:</strong> Maximum 240KB
                </div>
                <div>
                  <strong className="text-blue-800">Background:</strong> White or off-white<br />
                  <strong className="text-blue-800">Recent:</strong> Taken within 6 months<br />
                  <strong className="text-blue-800">Quality:</strong> Clear and in focus
                </div>
              </div>
            </div>

            {/* Technical Requirements */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">🔧 Technical Requirements</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Square format:</strong> Equal width and height (600x600 to 1200x1200 pixels)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>JPEG format only:</strong> File must end in .jpg or .jpeg</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>File size:</strong> Maximum 240KB (approximately 240,000 bytes)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Resolution:</strong> High quality, clear and in focus</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Photo Composition */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">📐 Photo Composition</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Recent photo:</strong> Taken within the last 6 months</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Background:</strong> Plain white or off-white background</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Head position:</strong> Face directly facing the camera</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Expression:</strong> Natural expression, both eyes open</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span><strong>Lighting:</strong> Well-lit, no shadows on face</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* What NOT to Include */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">❌ What NOT to Include</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-red-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span><strong>Glasses:</strong> No eyeglasses (unless for medical reasons)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span><strong>Head coverings:</strong> No hats, caps, or head coverings (religious exceptions allowed)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span><strong>Uniforms:</strong> No military, airline, or other uniforms</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span><strong>Poor quality:</strong> No blurry, pixelated, or heavily edited photos</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span><strong>Group photos:</strong> No other people in the background</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Common Issues */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">⚠️ Common Issues to Avoid</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li><strong>Wrong dimensions:</strong> Photo must be square (equal width and height)</li>
                  <li><strong>File too large:</strong> Compress image to under 240KB</li>
                  <li><strong>Wrong format:</strong> Convert PNG, GIF, or other formats to JPEG</li>
                  <li><strong>Shadows:</strong> Ensure even lighting with no shadows on face</li>
                  <li><strong>Red eyes:</strong> Fix red-eye effect before uploading</li>
                  <li><strong>Tilted head:</strong> Keep head straight and level</li>
                </ul>
              </div>
            </div>

            {/* Tips for Taking a Good Photo */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">💡 Tips for Taking a Good Photo</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-green-800">
                  <li><strong>Use good lighting:</strong> Natural light from a window works best</li>
                  <li><strong>Use a plain wall:</strong> Stand against a white or light-colored wall</li>
                  <li><strong>Keep camera level:</strong> Hold camera at eye level, not above or below</li>
                  <li><strong>Fill the frame:</strong> Your head should take up about 50-70% of the photo</li>
                  <li><strong>Check focus:</strong> Ensure eyes are sharp and in focus</li>
                  <li><strong>Take multiple shots:</strong> Take several photos and choose the best one</li>
                </ul>
              </div>
            </div>

            {/* File Size Help */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">📏 How to Reduce File Size</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  If your photo is larger than 240KB, try these methods:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Use photo editing software to compress the image</li>
                  <li>• Reduce image quality slightly (but keep it clear)</li>
                  <li>• Use online compression tools (ensure they don't change dimensions)</li>
                  <li>• Take a new photo with lower camera settings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for using the modal
export const usePhotoRequirementsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const ModalComponent = () => (
    <PhotoRequirementsModal isOpen={isOpen} onClose={closeModal} />
  );

  return {
    isOpen,
    openModal,
    closeModal,
    ModalComponent
  };
};

export default PhotoRequirementsModal;