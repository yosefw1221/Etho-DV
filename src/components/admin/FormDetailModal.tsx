'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from 'lucide-react';

interface FormDetailModalProps {
  formId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FormDetail {
  id: string;
  tracking_id: string;
  applicant_data: any;
  contact_info: any;
  background_info: any;
  family_info: any;
  photo_url?: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  user_role: string;
  user_business_name?: string;
  processing_status: string;
  payment_status: string;
  payment_amount: number;
  payment_currency: string;
  bank_receipt_url?: string;
  bank_receipt_verified?: boolean;
  admin_notes?: string;
  completion_document_url?: string;
  referred_by?: string;
  referral_code_used?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

const FormDetailModal: React.FC<FormDetailModalProps> = ({
  formId,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<FormDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && formId) {
      fetchFormDetails();
    }
  }, [isOpen, formId]);

  const fetchFormDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('admin_token');

      const response = await fetch(`/api/admin/forms/${formId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(data.form);
      } else {
        setError('Failed to load form details');
      }
    } catch (error) {
      console.error('Failed to fetch form details:', error);
      setError('An error occurred while loading form details');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPhoto = () => {
    if (formData?.photo_url) {
      const link = document.createElement('a');
      link.href = formData.photo_url;
      link.download = `${formData.tracking_id}_photo.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadReceipt = () => {
    if (formData?.bank_receipt_url) {
      const link = document.createElement('a');
      link.href = formData.bank_receipt_url;
      link.download = `${formData.tracking_id}_receipt.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadCompletionDoc = () => {
    if (formData?.completion_document_url) {
      const link = document.createElement('a');
      link.href = formData.completion_document_url;
      link.download = `${formData.tracking_id}_completion.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'approved':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
      case 'submitted':
        return 'text-yellow-600 bg-yellow-100';
      case 'declined':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-2xl font-bold">Form Details</h2>
            {formData && (
              <p className="text-blue-100 text-sm mt-1">
                Tracking ID: {formData.tracking_id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
              {error}
            </div>
          )}

          {formData && !isLoading && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Processing Status</p>
                      <p className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(formData.processing_status)}`}>
                        {formData.processing_status}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(formData.payment_status)}`}>
                        {formData.payment_status}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Payment Amount</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {formData.payment_amount} {formData.payment_currency}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Applicant Photo */}
              {formData.photo_url && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Applicant Photo
                    </h3>
                    <button
                      onClick={downloadPhoto}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={formData.photo_url}
                      alt="Applicant"
                      className="max-w-xs rounded-lg border-2 border-gray-200 shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Applicant Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Applicant Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">First Name</label>
                    <p className="text-gray-900 font-medium">
                      {formData.applicant_data.first_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Last Name</label>
                    <p className="text-gray-900 font-medium">
                      {formData.applicant_data.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Gender</label>
                    <p className="text-gray-900 font-medium">
                      {formData.applicant_data.gender}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Date of Birth</label>
                    <p className="text-gray-900 font-medium">
                      {formData.applicant_data.date_of_birth}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Place of Birth</label>
                    <p className="text-gray-900 font-medium">
                      {formData.applicant_data.place_of_birth}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Country of Birth</label>
                    <p className="text-gray-900 font-medium">
                      {formData.applicant_data.country_of_birth}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {formData.contact_info && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="text-gray-900 font-medium">
                        {formData.contact_info.email || formData.applicant_data.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Phone</label>
                      <p className="text-gray-900 font-medium">
                        {formData.contact_info.phone}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-600">Address</label>
                      <p className="text-gray-900 font-medium">
                        {formData.contact_info.address}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">City</label>
                      <p className="text-gray-900 font-medium">
                        {formData.contact_info.city}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Country</label>
                      <p className="text-gray-900 font-medium">
                        {formData.contact_info.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submitted By Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Submitted By
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="text-gray-900 font-medium">{formData.user_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="text-gray-900 font-medium">{formData.user_email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Role</label>
                    <p className="text-gray-900 font-medium capitalize">
                      {formData.user_role}
                    </p>
                  </div>
                  {formData.user_business_name && (
                    <div>
                      <label className="text-sm text-gray-600">Business Name</label>
                      <p className="text-gray-900 font-medium">
                        {formData.user_business_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Receipt */}
              {formData.bank_receipt_url && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Bank Receipt
                      {formData.bank_receipt_verified && (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                      )}
                    </h3>
                    <button
                      onClick={downloadReceipt}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={formData.bank_receipt_url}
                      alt="Bank Receipt"
                      className="max-w-md rounded-lg border-2 border-gray-200 shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {formData.admin_notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Admin Notes
                  </h3>
                  <p className="text-gray-700">{formData.admin_notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(formData.created_at).toLocaleString()}
                    </span>
                  </div>
                  {formData.submitted_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(formData.submitted_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(formData.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormDetailModal;

