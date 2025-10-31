'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PhotoUploadWithCropProps {
  formId: string;
  personType: 'primary' | 'spouse' | 'child';
  personId?: string;
  currentPhoto?: string;
  error?: string;
  required?: boolean;
  onUploadSuccess?: (result: { url: string; person_type: string; person_id?: string }) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const PhotoUploadWithCrop: React.FC<PhotoUploadWithCropProps> = ({
  formId,
  personType,
  personId,
  currentPhoto,
  error,
  required = false,
  onUploadSuccess,
  onUploadError,
  disabled = false
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhoto || null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset preview when currentPhoto changes
  useEffect(() => {
    setPreviewUrl(currentPhoto || null);
  }, [currentPhoto]);

  // Check for cropped image on mount and when component updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const croppedImage = sessionStorage.getItem('croppedImage');
    const metadata = sessionStorage.getItem('cropMetadata');

    if (croppedImage && metadata) {
      try {
        const meta = JSON.parse(metadata);

        // Check if this cropped image is for this component
        if (meta.formId === formId && meta.personType === personType &&
            (personId ? meta.personId === personId : !meta.personId)) {

          // Convert base64 to file and upload
          fetch(croppedImage)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], 'cropped-photo.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              // Clean up sessionStorage
              sessionStorage.removeItem('croppedImage');
              sessionStorage.removeItem('croppedImageSize');
              sessionStorage.removeItem('cropMetadata');

              // Upload the file
              uploadToServer(file);
            })
            .catch(error => {
              console.error('Failed to process cropped image:', error);
              setValidationError('Failed to process cropped image');
            });
        }
      } catch (error) {
        console.error('Failed to parse crop metadata:', error);
      }
    }
  }, [formId, personType, personId]);

  const validateFile = (file: File): boolean => {
    setValidationError(null);

    // Check file type
    if (!file.type.match(/^image\/(jpeg|jpg)$/)) {
      setValidationError('Only JPEG files are allowed');
      return false;
    }

    // Check file size (max 10MB before processing)
    if (file.size > 10 * 1024 * 1024) {
      setValidationError('File size must be less than 10MB');
      return false;
    }

    return true;
  };


  const uploadToServer = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('formId', formId);
    formData.append('personType', personType);
    if (personId) {
      formData.append('personId', personId);
    }

    setUploadProgress({ loaded: 0, total: 100, percentage: 0 });

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (!prev || prev.percentage >= 90) return prev;
        const newPercentage = Math.min(prev.percentage + 10, 90);
        return {
          loaded: newPercentage,
          total: 100,
          percentage: newPercentage
        };
      });
    }, 200);

    try {
      // Get authentication token
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/user/photos', {
        method: 'POST',
        headers,
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress({ loaded: 100, total: 100, percentage: 100 });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setPreviewUrl(result.photo.url);
        onUploadSuccess?.(result.photo);
        
        setTimeout(() => {
          setUploadProgress(null);
        }, 1000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(null);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setValidationError(errorMessage);
      onUploadError?.(errorMessage);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (disabled || isUploading) return;

    if (!validateFile(file)) return;

    try {
      // Convert file to base64 and store in sessionStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        sessionStorage.setItem('cropImage', base64data);

        // Navigate to crop page with parameters
        const params = new URLSearchParams({
          formId,
          personType,
          ...(personId && { personId }),
          returnUrl: pathname
        });

        router.push(`/crop-photo?${params.toString()}`);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      setValidationError('Failed to process file');
    }
  };

  const handleDelete = async () => {
    if (disabled || isDeleting || !previewUrl) return;

    setIsDeleting(true);
    
    try {
      const params = new URLSearchParams({
        formId,
        personType,
        ...(personId && { personId })
      });

      // Get authentication token
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/user/photos?${params}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      setPreviewUrl(null);
      setValidationError(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      setValidationError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [disabled, isUploading]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    if (disabled || isUploading) return;
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
        <PhotoRequirementsButton />
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300',
          error || validationError ? 'border-red-300 bg-red-50' : '',
          previewUrl ? 'border-green-300 bg-green-50' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={openFileDialog}
      >
        {previewUrl ? (
          <PhotoPreview
            url={previewUrl}
            label={getPersonLabel()}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            disabled={disabled}
          />
        ) : (
          <UploadPrompt 
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled || isUploading}
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
      <PhotoGuidelines />
    </div>
  );
};

// Sub-components
const PhotoRequirementsButton: React.FC = () => (
  <button
    type="button"
    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
    onClick={() => {
      alert('DV Photo Requirements:\n\n• Recent photo (taken within 6 months)\n• Will be automatically resized to 600x600 pixels\n• JPEG format only\n• Maximum 10MB file size before cropping\n• Clear, well-lit, front-facing\n• Plain white or off-white background\n• No glasses, hats, or head coverings (unless religious)');
    }}
  >
    📖 Photo Requirements
  </button>
);

const PhotoPreview: React.FC<{
  url: string;
  label: string;
  onDelete: () => void;
  isDeleting: boolean;
  disabled: boolean;
}> = ({ url, label, onDelete, isDeleting, disabled }) => (
  <div className="space-y-4">
    <img
      src={url}
      alt={label}
      className="mx-auto w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
    />
    <div>
      <p className="text-sm text-green-600 font-medium">✅ Photo uploaded successfully (600x600)</p>
      <p className="text-xs text-gray-500 mt-1">Click to replace or drag a new photo</p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={disabled || isDeleting}
        className="mt-2 text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {isDeleting ? 'Deleting...' : '🗑️ Delete Photo'}
      </button>
    </div>
  </div>
);

const UploadPrompt: React.FC<{
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
}> = ({ isUploading, uploadProgress }) => (
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
        JPEG format, will be cropped to 600x600 pixels, max 10MB
      </p>
    </div>

    {uploadProgress && (
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${uploadProgress.percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {uploadProgress.percentage}% uploaded
        </p>
      </div>
    )}
  </div>
);

const PhotoGuidelines: React.FC = () => (
  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
    <h4 className="text-sm font-medium text-gray-900 mb-2">📋 Photo Guidelines</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
      <div>
        <h5 className="font-medium text-gray-700 mb-1">Technical Requirements:</h5>
        <ul className="space-y-1">
          <li>• Automatically resized to 600x600 pixels</li>
          <li>• JPEG format only</li>
          <li>• Final size under 240KB</li>
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
);

export default PhotoUploadWithCrop;