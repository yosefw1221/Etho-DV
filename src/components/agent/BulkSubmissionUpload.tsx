'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { BulkSubmission, ValidationError, getAgentTier, calculateBulkCost } from '@/types/agent';
import { cn } from '@/lib/utils';

interface BulkSubmissionUploadProps {
  onUploadComplete: (submission: BulkSubmission) => void;
  currentTierSubmissions: number;
}

const BulkSubmissionUpload: React.FC<BulkSubmissionUploadProps> = ({
  onUploadComplete,
  currentTierSubmissions
}) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'validating' | 'completed' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [estimatedForms, setEstimatedForms] = useState(0);

  const currentTier = getAgentTier(currentTierSubmissions);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate file upload progress
    simulateUpload(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: uploadStatus !== 'idle'
  });

  const simulateUpload = async (file: File) => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setUploadStatus('validating');
    
    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock validation results
    const mockRowCount = Math.floor(Math.random() * 50) + 10; // 10-60 forms
    const mockErrors: ValidationError[] = [];
    
    // Add some random validation errors for demo
    if (Math.random() > 0.7) {
      mockErrors.push({
        row: 5,
        field: 'email',
        value: 'invalid-email',
        error: 'Invalid email format'
      });
    }
    
    if (Math.random() > 0.8) {
      mockErrors.push({
        row: 12,
        field: 'date_of_birth',
        value: '2030-01-01',
        error: 'Date of birth cannot be in the future'
      });
    }

    setValidationErrors(mockErrors);
    setEstimatedForms(mockRowCount);
    setEstimatedCost(calculateBulkCost(mockRowCount, currentTier));
    
    if (mockErrors.length === 0) {
      setUploadStatus('completed');
    } else {
      setUploadStatus('error');
    }
  };

  const handleConfirmUpload = () => {
    if (!uploadedFile) return;

    const submission: BulkSubmission = {
      id: Date.now().toString(),
      upload_date: new Date(),
      filename: uploadedFile.name,
      total_forms: estimatedForms,
      processed_forms: 0,
      failed_forms: validationErrors.length,
      status: validationErrors.length > 0 ? 'failed' : 'processing',
      validation_errors: validationErrors,
      estimated_cost: estimatedCost
    };

    onUploadComplete(submission);
  };

  const handleReset = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setValidationErrors([]);
    setUploadedFile(null);
    setEstimatedCost(0);
    setEstimatedForms(0);
  };

  const downloadTemplate = () => {
    // Create CSV template
    const headers = [
      'first_name',
      'middle_name',
      'last_name',
      'date_of_birth',
      'place_of_birth',
      'gender',
      'country_of_birth',
      'address',
      'phone',
      'email',
      'passport_number',
      'passport_expiry',
      'education_level',
      'occupation',
      'marital_status',
      'spouse_first_name',
      'spouse_last_name',
      'spouse_date_of_birth',
      'child1_first_name',
      'child1_last_name',
      'child1_date_of_birth'
    ];

    const csvContent = headers.join(',') + '\n' +
      'John,Michael,Doe,1990-05-15,"Addis Ababa, Ethiopia",Male,Ethiopia,"123 Bole Road, Addis Ababa",+251911234567,john.doe@email.com,ET1234567,2030-12-31,university_degree,Engineer,Married,Jane,Doe,1992-03-20,,,';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'dv-bulk-submission-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (uploadStatus === 'idle') {
    return (
      <div className="space-y-6">
        {/* Upload Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            📋 Bulk Submission Guide
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Supported Formats</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• CSV files (.csv)</li>
                <li>• Excel files (.xls, .xlsx)</li>
                <li>• Maximum 1000 forms per upload</li>
                <li>• All required fields must be included</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Current Pricing</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>{currentTier.rate_per_form} ETB</strong> per form</p>
                <p>Your tier: <strong>{currentTier.name.toUpperCase()}</strong></p>
                <p>Total submissions: <strong>{currentTierSubmissions}</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Template Download */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                📄 Download Template
              </h3>
              <p className="text-sm text-gray-600">
                Use our CSV template to ensure proper formatting of your bulk submission.
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              Download Template
            </Button>
          </div>
        </div>

        {/* File Upload Area */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="text-6xl">📤</div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop your file here' : 'Upload Bulk Submission File'}
              </h3>
              <p className="text-gray-600">
                Drag and drop your CSV or Excel file, or click to browse
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Supported: .csv, .xls, .xlsx (max 10MB)
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-medium text-yellow-900 mb-3">📋 File Requirements</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-800">
            <div>
              <h5 className="font-medium mb-2">Required Fields:</h5>
              <ul className="space-y-1">
                <li>• First Name, Last Name</li>
                <li>• Date of Birth, Place of Birth</li>
                <li>• Gender, Country of Birth</li>
                <li>• Email, Phone, Address</li>
                <li>• Passport Number, Expiry Date</li>
                <li>• Education Level, Marital Status</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Optional Fields:</h5>
              <ul className="space-y-1">
                <li>• Middle Name, Occupation</li>
                <li>• Spouse Information (if married)</li>
                <li>• Children Information (if applicable)</li>
                <li>• Country of Eligibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (uploadStatus === 'uploading') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl">⬆️</div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Uploading File...
          </h3>
          <p className="text-gray-600 mb-4">
            Please wait while we upload your file.
          </p>
          <ProgressBar current={uploadProgress} total={100} showSteps={false} />
        </div>
      </div>
    );
  }

  if (uploadStatus === 'validating') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl animate-pulse">🔍</div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Validating Data...
          </h3>
          <p className="text-gray-600">
            We're checking your data for completeness and accuracy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Validation Results */}
      <div className={cn(
        'border rounded-lg p-6',
        validationErrors.length === 0
          ? 'border-green-200 bg-green-50'
          : 'border-red-200 bg-red-50'
      )}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className={cn(
              'text-lg font-semibold mb-2',
              validationErrors.length === 0 ? 'text-green-900' : 'text-red-900'
            )}>
              {validationErrors.length === 0 ? '✅ Validation Successful' : '❌ Validation Issues Found'}
            </h3>
            <div className="space-y-1 text-sm">
              <p>File: <strong>{uploadedFile?.name}</strong></p>
              <p>Total Forms: <strong>{estimatedForms}</strong></p>
              <p>Estimated Cost: <strong>{estimatedCost} ETB</strong></p>
              {validationErrors.length > 0 && (
                <p className="text-red-700">Errors: <strong>{validationErrors.length}</strong></p>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleReset}>
              Try Again
            </Button>
            {validationErrors.length === 0 && (
              <Button onClick={handleConfirmUpload}>
                Confirm Upload
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-white border border-red-200 rounded-lg p-6">
          <h4 className="font-medium text-red-900 mb-4">
            Validation Errors (Please fix these in your file)
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {validationErrors.map((error, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{error.row}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{error.field}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 font-mono">{error.value}</td>
                    <td className="px-4 py-2 text-sm text-red-600">{error.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      {uploadStatus === 'completed' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">💰 Cost Breakdown</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Number of Forms:</span>
                  <span className="font-medium">{estimatedForms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate per Form:</span>
                  <span className="font-medium">{currentTier.rate_per_form} ETB</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Cost:</span>
                  <span className="font-bold text-lg">{estimatedCost} ETB</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Your Tier Benefits:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {currentTier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-1">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkSubmissionUpload;