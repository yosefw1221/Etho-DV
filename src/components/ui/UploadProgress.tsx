'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface UploadProgressProps {
  progress: number; // 0-100
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  fileName?: string;
  fileSize?: number;
  uploadSpeed?: number; // bytes per second
  timeRemaining?: number; // seconds
  className?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  status,
  fileName,
  fileSize,
  uploadSpeed,
  timeRemaining,
  className
}) => {
  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Upload failed';
      default:
        return 'Ready to upload';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-400';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatFileSize(bytesPerSecond)}/s`;
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* File Info */}
      {fileName && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900 truncate">{fileName}</span>
          {fileSize && (
            <span className="text-gray-500 ml-2">{formatFileSize(fileSize)}</span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">{getStatusText()}</span>
          <span className="text-gray-500">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={cn(
              'h-2 rounded-full transition-all duration-300 ease-out',
              getStatusColor(),
              status === 'uploading' && 'animate-pulse'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Additional Info */}
      {(uploadSpeed || timeRemaining) && status === 'uploading' && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          {uploadSpeed && (
            <span>{formatSpeed(uploadSpeed)}</span>
          )}
          {timeRemaining && (
            <span>{formatTimeRemaining(timeRemaining)} remaining</span>
          )}
        </div>
      )}

      {/* Status Icons */}
      <div className="flex items-center space-x-2 text-sm">
        {status === 'uploading' && (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-blue-600">Uploading photo...</span>
          </>
        )}
        {status === 'processing' && (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-blue-600">Processing image...</span>
          </>
        )}
        {status === 'completed' && (
          <>
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-green-600">Upload completed</span>
          </>
        )}
        {status === 'error' && (
          <>
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-600">Upload failed</span>
          </>
        )}
      </div>
    </div>
  );
};

// Multi-file upload progress component
interface MultiUploadProgressProps {
  uploads: Array<{
    id: string;
    fileName: string;
    progress: number;
    status: UploadProgressProps['status'];
    fileSize?: number;
  }>;
  className?: string;
}

export const MultiUploadProgress: React.FC<MultiUploadProgressProps> = ({
  uploads,
  className
}) => {
  const totalProgress = uploads.length > 0 
    ? uploads.reduce((sum, upload) => sum + upload.progress, 0) / uploads.length
    : 0;

  const completedUploads = uploads.filter(upload => upload.status === 'completed').length;
  const failedUploads = uploads.filter(upload => upload.status === 'error').length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900">
            Overall Progress ({completedUploads}/{uploads.length} completed)
          </span>
          <span className="text-gray-500">{Math.round(totalProgress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Individual Upload Progress */}
      <div className="space-y-3">
        {uploads.map((upload) => (
          <UploadProgress
            key={upload.id}
            progress={upload.progress}
            status={upload.status}
            fileName={upload.fileName}
            fileSize={upload.fileSize}
            className="bg-gray-50 p-3 rounded-lg"
          />
        ))}
      </div>

      {/* Summary */}
      {(completedUploads > 0 || failedUploads > 0) && (
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <span>
            {completedUploads > 0 && (
              <span className="text-green-600">✓ {completedUploads} completed</span>
            )}
            {completedUploads > 0 && failedUploads > 0 && <span className="mx-2">•</span>}
            {failedUploads > 0 && (
              <span className="text-red-600">✗ {failedUploads} failed</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;