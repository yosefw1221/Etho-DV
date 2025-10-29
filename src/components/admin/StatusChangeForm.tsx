'use client';

import React, { useState } from 'react';
import { Save, Upload, AlertCircle, CheckCircle, Loader2, FileText } from 'lucide-react';

interface StatusChangeFormProps {
  formId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  currentNotes?: string;
  currentCompletionDoc?: string;
  onStatusUpdated: () => void;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'text-gray-600 bg-gray-100' },
  { value: 'submitted', label: 'Submitted', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'processing', label: 'Processing', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'approved', label: 'Approved', color: 'text-blue-600 bg-blue-100' },
  { value: 'declined', label: 'Declined', color: 'text-red-600 bg-red-100' },
  { value: 'completed', label: 'Completed', color: 'text-green-600 bg-green-100' },
  { value: 'failed', label: 'Failed', color: 'text-red-600 bg-red-100' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'paid', label: 'Paid', color: 'text-green-600 bg-green-100' },
  { value: 'failed', label: 'Failed', color: 'text-red-600 bg-red-100' },
];

const StatusChangeForm: React.FC<StatusChangeFormProps> = ({
  formId,
  currentStatus,
  currentPaymentStatus,
  currentNotes,
  currentCompletionDoc,
  onStatusUpdated,
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [adminNotes, setAdminNotes] = useState(currentNotes || '');
  const [completionDocument, setCompletionDocument] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only PDF, JPG, and PNG files are allowed.');
        setCompletionDocument(null);
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('File size exceeds 10MB limit');
        setCompletionDocument(null);
        return;
      }

      setCompletionDocument(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsSaving(false);
        return;
      }

      let completionDocumentUrl = currentCompletionDoc;

      // Upload completion document if selected and status is completed
      if (completionDocument && status === 'completed') {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', completionDocument);

        const uploadResponse = await fetch('/api/admin/upload-completion-document', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || 'Failed to upload completion document');
        }

        const uploadData = await uploadResponse.json();
        completionDocumentUrl = uploadData.url;
        setIsUploading(false);
      }

      // Update form status
      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          paymentStatus,
          adminNotes,
          completionDocumentUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update form');
      }

      const data = await response.json();
      setSuccess('Form updated successfully!');
      setCompletionDocument(null);
      
      // Refresh form details after a short delay
      setTimeout(() => {
        onStatusUpdated();
        setSuccess(null);
      }, 1500);

    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update form. Please try again.');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const hasChanges = 
    status !== currentStatus || 
    paymentStatus !== currentPaymentStatus ||
    adminNotes !== (currentNotes || '') || 
    completionDocument !== null;

  return (
    <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Save className="w-6 h-6 mr-2 text-blue-600" />
        Update Application Status
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Completion Document */}
        {currentCompletionDoc && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Completion Document Available</p>
                  <p className="text-xs text-green-700">A completion document has already been uploaded</p>
                </div>
              </div>
              <a
                href={currentCompletionDoc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-600 hover:text-green-800 text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>View</span>
              </a>
            </div>
          </div>
        )}

        {/* Status Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Processing Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900 font-medium"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                STATUS_OPTIONS.find(opt => opt.value === status)?.color || 'text-gray-600 bg-gray-100'
              }`}>
                Current: {STATUS_OPTIONS.find(opt => opt.value === status)?.label}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              id="paymentStatus"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900 font-medium"
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                PAYMENT_STATUS_OPTIONS.find(opt => opt.value === paymentStatus)?.color || 'text-gray-600 bg-gray-100'
              }`}>
                Current: {PAYMENT_STATUS_OPTIONS.find(opt => opt.value === paymentStatus)?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        <div>
          <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Admin Notes
          </label>
          <textarea
            id="adminNotes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes for the applicant (optional)..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            rows={4}
          />
          <p className="mt-1 text-xs text-gray-500">
            These notes will be visible to the applicant when tracking their application
          </p>
        </div>

        {/* Completion Document Upload (only show when status is completed) */}
        {status === 'completed' && (
          <div>
            <label htmlFor="completionDocument" className="block text-sm font-medium text-gray-700 mb-2">
              Completion Document {currentCompletionDoc ? '(Replace)' : '(Required)'}
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {completionDocument ? completionDocument.name : 'Choose file (PDF, JPG, PNG)'}
                </span>
                <input
                  type="file"
                  id="completionDocument"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {completionDocument && (
                <button
                  type="button"
                  onClick={() => setCompletionDocument(null)}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            {completionDocument && (
              <p className="mt-2 text-xs text-green-600 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                File ready to upload: {(completionDocument.size / 1024).toFixed(2)} KB
              </p>
            )}
            {!currentCompletionDoc && !completionDocument && (
              <p className="mt-1 text-xs text-amber-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                A completion document is recommended when marking as completed
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setStatus(currentStatus);
              setPaymentStatus(currentPaymentStatus);
              setAdminNotes(currentNotes || '');
              setCompletionDocument(null);
              setError(null);
              setSuccess(null);
            }}
            disabled={isSaving || isUploading || !hasChanges}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploading || !hasChanges}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isSaving || isUploading) ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isUploading ? 'Uploading...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatusChangeForm;

