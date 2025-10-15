'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Button from '@/components/ui/Button';

export default function CropPhotoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: 'px',
    width: 600,
    height: 600,
    x: 0,
    y: 0
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get image from sessionStorage
    const storedImage = sessionStorage.getItem('cropImage');
    if (storedImage) {
      setImageSrc(storedImage);
    } else {
      setError('No image found. Please go back and select an image.');
    }
  }, []);

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not found');
    }

    // Set canvas size to exactly 600x600
    canvas.width = 600;
    canvas.height = 600;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the cropped image scaled to 600x600
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      600,
      600
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleCropComplete = async () => {
    if (!imageRef.current || !completedCrop) {
      setError('Please select a crop area');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const croppedBlob = await getCroppedImg(imageRef.current, completedCrop);

      // Check final file size (should be max 240KB)
      if (croppedBlob.size > 240 * 1024) {
        setError('Cropped image is too large. Please try a different crop area.');
        setIsProcessing(false);
        return;
      }

      // Convert blob to base64 and store in sessionStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        sessionStorage.setItem('croppedImage', base64data);
        sessionStorage.setItem('croppedImageSize', croppedBlob.size.toString());

        // Clear the original image
        sessionStorage.removeItem('cropImage');

        // Get return parameters
        const formId = searchParams.get('formId') || '';
        const personType = searchParams.get('personType') || 'primary';
        const personId = searchParams.get('personId') || '';
        const returnUrl = searchParams.get('returnUrl') || '/apply';

        // Store metadata for the upload component
        sessionStorage.setItem('cropMetadata', JSON.stringify({
          formId,
          personType,
          personId,
        }));

        // Navigate back
        router.push(returnUrl);
      };
      reader.readAsDataURL(croppedBlob);
    } catch (error) {
      console.error('Crop error:', error);
      setError('Failed to process cropped image. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem('cropImage');
    const returnUrl = searchParams.get('returnUrl') || '/apply';
    router.push(returnUrl);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    // Calculate initial crop area (center square)
    const cropSize = Math.min(width, height);
    const x = (width - cropSize) / 2;
    const y = (height - cropSize) / 2;

    setCrop({
      unit: 'px',
      width: cropSize,
      height: cropSize,
      x,
      y
    });
  };

  if (error && !imageSrc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={handleCancel}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Crop Your Photo
            </h1>
            <p className="text-gray-600">
              Adjust the crop area to select the portion of your photo you want to use.
              The final photo will be 600x600 pixels.
            </p>
          </div>

          {imageSrc && (
            <div className="mb-6">
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 inline-block">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  minWidth={200}
                  minHeight={200}
                >
                  <img
                    ref={imageRef}
                    alt="Crop preview"
                    src={imageSrc}
                    onLoad={onImageLoad}
                    className="max-w-full max-h-[600px] object-contain"
                  />
                </ReactCrop>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">⚠️ {error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Drag the corners to adjust the crop area</li>
              <li>• Move the entire box to reposition</li>
              <li>• The selected area will be resized to 600x600 pixels</li>
              <li>• Make sure your face is centered and clearly visible</li>
              <li>• Final file size must be under 240KB</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCropComplete}
              disabled={isProcessing || !completedCrop}
            >
              {isProcessing ? 'Processing...' : 'Crop & Continue'}
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
