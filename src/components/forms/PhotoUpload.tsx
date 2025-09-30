'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  onPhotoUpload: (photo: {
    file: File;
    preview: string;
    person_type: 'primary' | 'spouse' | 'child';
    person_id?: string;
  }) => void;
  personType: 'primary' | 'spouse' | 'child';
  personId?: string;
  currentPhoto?: string;
  error?: string;
  required?: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotoUpload,
  personType,
  personId,
  currentPhoto,
  error,
  required = false
}) => {
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validatePhoto = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      return { valid: false, error: 'Photo must be in JPEG format' };
    }

    // Check file size (240KB max)
    const maxSize = 240 * 1024; // 240KB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: `File size must be under 240KB (current: ${Math.round(file.size / 1024)}KB)` };
    }

    return { valid: true };
  };

  const validateImageDimensions = (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        
        // DV photo requirements: 600x600 to 1200x1200 pixels, square
        if (width !== height) {
          resolve({ valid: false, error: 'Photo must be square (equal width and height)' });
          return;
        }
        
        if (width < 600 || height < 600) {
          resolve({ valid: false, error: 'Photo must be at least 600x600 pixels' });
          return;
        }
        
        if (width > 1200 || height > 1200) {
          resolve({ valid: false, error: 'Photo must not exceed 1200x1200 pixels' });
          return;
        }
        
        resolve({ valid: true });
      };
      
      img.onerror = () => {
        resolve({ valid: false, error: 'Invalid image file' });
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setValidationError(null);

    try {
      // Basic validation
      const basicValidation = validatePhoto(file);
      if (!basicValidation.valid) {
        setValidationError(basicValidation.error || 'Invalid photo');
        return;
      }

      // Dimension validation
      const dimensionValidation = await validateImageDimensions(file);
      if (!dimensionValidation.valid) {
        setValidationError(dimensionValidation.error || 'Invalid photo dimensions');
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      
      // Call parent callback
      onPhotoUpload({
        file,
        preview,
        person_type: personType,
        person_id: personId
      });

    } catch (error) {
      console.error('Photo upload error:', error);
      setValidationError('Failed to process photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getPersonLabel = () => {
    switch (personType) {
      case 'primary':
        return 'Your Photo';
      case 'spouse':
        return 'Spouse Photo';
      case 'child':
        return `Child Photo ${personId ? `(${personId})` : ''}`;
      default:
        return 'Photo';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {getPersonLabel()}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-700"
          onClick={() => {
            // Show photo requirements help
            alert('DV Photo Requirements:\n\n• Recent photo (taken within 6 months)\n• 600x600 to 1200x1200 pixels\n• Square format (equal width and height)\n• JPEG format only\n• Maximum 240KB file size\n• Clear, well-lit, front-facing\n• Plain white or off-white background\n• No glasses, hats, or head coverings (unless religious)');
          }}
        >
          📖 Photo Requirements
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-300',
          error || validationError ? 'border-red-300 bg-red-50' : '',
          'hover:border-primary-400 hover:bg-primary-50 cursor-pointer'
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={openFileDialog}
      >
        {currentPhoto ? (
          <div className="space-y-4">
            <img
              src={currentPhoto}
              alt={getPersonLabel()}
              className="mx-auto w-32 h-32 object-cover rounded-lg border border-gray-200"
            />
            <div>
              <p className="text-sm text-green-600 font-medium">✅ Photo uploaded successfully</p>
              <p className="text-xs text-gray-500 mt-1">Click to replace or drag a new photo</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">📷</div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isUploading ? 'Processing photo...' : 'Upload your photo'}
              </p>
              <p className="text-sm text-gray-600">
                Drag and drop your photo here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-2">
                JPEG format, 600x600 to 1200x1200 pixels, max 240KB
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Error Messages */}
      {(error || validationError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">
            ⚠️ {error || validationError}
          </p>
        </div>
      )}

      {/* Photo Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">📋 Photo Guidelines</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
          <div>
            <h5 className="font-medium text-gray-700 mb-1">Technical Requirements:</h5>
            <ul className="space-y-1">
              <li>• Square format (600x600 to 1200x1200 pixels)</li>
              <li>• JPEG format only</li>
              <li>• Maximum 240KB file size</li>
              <li>• Clear and in focus</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-1">Photo Composition:</h5>
            <ul className="space-y-1">
              <li>• Taken within the last 6 months</li>
              <li>• Plain white or off-white background</li>
              <li>• Face directly facing camera</li>
              <li>• Natural expression, both eyes open</li>
              <li>• No glasses, hats, or head coverings*</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">*Except for religious reasons</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;