'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Search, FileText, Clock, CheckCircle, XCircle, Download, AlertCircle, Calendar, User } from 'lucide-react';

interface ApplicationData {
  tracking_id: string;
  applicant_data: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: string;
    country_of_birth: string;
    country_of_eligibility?: string;
    address?: string;
    phone?: string;
    email?: string;
    education_level: string;
    occupation?: string;
    marital_status: string;
    photo_url?: string;
  };
  family_members: Array<{
    relationship_type: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: string;
    country_of_birth: string;
    photo_url?: string;
  }>;
  photos: string[];
  submission_date: string;
  processing_status: string;
  payment_status: string;
  payment_amount: number;
  payment_currency: string;
  completion_document_url?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

export default function TrackApplicationPage() {
  const params = useParams();
  const [trackingId, setTrackingId] = useState<string>('');
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (params.id) {
      setTrackingId(params.id as string);
      trackApplication(params.id as string);
    }
  }, [params.id]);

  const trackApplication = async (id: string) => {
    if (!id.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/public/track/${id}`);
      const data = await response.json();

      if (response.ok) {
        setApplicationData(data.data);
      } else {
        setError(data.error || 'Application not found');
        setApplicationData(null);
      }
    } catch (error) {
      console.error('Tracking error:', error);
      setError('Failed to track application. Please try again.');
      setApplicationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    trackApplication(trackingId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'approved':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'processing':
      case 'submitted':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'declined':
      case 'failed':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'draft':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'processing':
      case 'submitted':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'declined':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Application is being prepared';
      case 'submitted':
        return 'Application has been submitted and is awaiting review';
      case 'processing':
        return 'Application is being processed by our team';
      case 'approved':
        return 'Application has been approved and is being finalized';
      case 'completed':
        return 'Application processing is complete';
      case 'declined':
        return 'Application has been declined';
      case 'failed':
        return 'Application processing failed';
      default:
        return 'Status unknown';
    }
  };

  const downloadDocument = async () => {
    if (!applicationData?.completion_document_url) return;

    try {
      const response = await fetch(applicationData.completion_document_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `completion-document-${applicationData.tracking_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Track Your Application
          </h1>
          <p className="text-gray-600">
            Enter your tracking ID to check the status of your DV lottery application
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking ID
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  id="trackingId"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  placeholder="Enter your tracking ID (e.g., TRK-1234567890-ABC123)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Track</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Application Details */}
        {applicationData && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Application Status</h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(applicationData.processing_status)}`}>
                  {getStatusIcon(applicationData.processing_status)}
                  <span className="ml-2 capitalize">{applicationData.processing_status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Applicant Name</p>
                      <p className="font-medium text-gray-900">
                        {`${applicationData.applicant_data.first_name} ${applicationData.applicant_data.middle_name || ''} ${applicationData.applicant_data.last_name}`.trim()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tracking ID</p>
                      <p className="font-medium text-gray-900">{applicationData.tracking_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900">{applicationData.applicant_data.gender}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium text-gray-900">
                        {new Date(applicationData.applicant_data.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Submission Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(applicationData.submission_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium text-gray-900">
                        {new Date(applicationData.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Status:</strong> {getStatusDescription(applicationData.processing_status)}
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Country of Birth</p>
                  <p className="font-medium text-gray-900">{applicationData.applicant_data.country_of_birth}</p>
                </div>
                <div>
                  <p className="text-gray-600">Place of Birth</p>
                  <p className="font-medium text-gray-900">{applicationData.applicant_data.place_of_birth}</p>
                </div>
                <div>
                  <p className="text-gray-600">Education Level</p>
                  <p className="font-medium text-gray-900">{applicationData.applicant_data.education_level}</p>
                </div>
                {applicationData.applicant_data.occupation && (
                  <div>
                    <p className="text-gray-600">Occupation</p>
                    <p className="font-medium text-gray-900">{applicationData.applicant_data.occupation}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Marital Status</p>
                  <p className="font-medium text-gray-900">{applicationData.applicant_data.marital_status}</p>
                </div>
                {applicationData.applicant_data.email && (
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{applicationData.applicant_data.email}</p>
                  </div>
                )}
                {applicationData.applicant_data.phone && (
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{applicationData.applicant_data.phone}</p>
                  </div>
                )}
                {applicationData.applicant_data.address && (
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">{applicationData.applicant_data.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Main Applicant Photo */}
            {applicationData.applicant_data.photo_url && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Main Applicant Photo</h3>
                <div className="flex justify-center">
                  <img 
                    src={applicationData.applicant_data.photo_url} 
                    alt="Main Applicant" 
                    className="max-w-sm rounded-lg border-2 border-gray-300 shadow-md"
                  />
                </div>
                <div className="mt-4 text-center">
                  <a 
                    href={applicationData.applicant_data.photo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Photo</span>
                  </a>
                </div>
              </div>
            )}

            {/* Family Members */}
            {applicationData.family_members && applicationData.family_members.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h3>
                <div className="space-y-6">
                  {applicationData.family_members.map((member, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {`${member.first_name} ${member.middle_name || ''} ${member.last_name}`.trim()}
                          </h4>
                          <p className="text-sm text-gray-600 capitalize">{member.relationship_type}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Gender</p>
                          <p className="font-medium text-gray-900">{member.gender}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date of Birth</p>
                          <p className="font-medium text-gray-900">
                            {new Date(member.date_of_birth).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Country of Birth</p>
                          <p className="font-medium text-gray-900">{member.country_of_birth}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Place of Birth</p>
                          <p className="font-medium text-gray-900">{member.place_of_birth}</p>
                        </div>
                      </div>
                      {member.photo_url && (
                        <div className="mt-4 flex justify-center">
                          <div className="text-center">
                            <img 
                              src={member.photo_url} 
                              alt={`${member.first_name} ${member.last_name}`}
                              className="max-w-xs rounded-lg border-2 border-gray-300 shadow-md mb-2"
                            />
                            <a 
                              href={member.photo_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download Photo</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {applicationData.admin_notes && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{applicationData.admin_notes}</p>
                </div>
              </div>
            )}

            {/* Download Section */}
            {applicationData.processing_status === 'completed' && applicationData.completion_document_url && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Documents</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Application Completed</p>
                        <p className="text-sm text-green-700">Your completion document is ready for download</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadDocument}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(applicationData.payment_status)}`}>
                {getStatusIcon(applicationData.payment_status)}
                <span className="ml-2 capitalize">{applicationData.payment_status}</span>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• If you can't find your tracking ID, check your email confirmation</p>
            <p>• Processing times may vary depending on application volume</p>
            <p>• Contact support if your application has been in processing for more than 30 days</p>
            <p>• Make sure to download your completion document when available</p>
          </div>
        </div>
      </div>
    </div>
  );
}
