'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
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
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  AlertCircle,
} from 'lucide-react';

interface FamilyMember {
  relationship_type: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  place_of_birth: string;
  gender: string;
  country_of_birth: string;
  photo_url?: string;
}

interface FormDetail {
  id: string;
  tracking_id: string;
  applicant_data: any;
  family_members: FamilyMember[];
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

export default function FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<FormDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formId = params.formId as string;
  const locale = params.locale as string;

  useEffect(() => {
    if (formId) {
      fetchFormDetails();
    }
  }, [formId]);

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

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPhoto = (url: string, name: string) => {
    downloadFile(url, `${formData?.tracking_id}_${name}.jpg`);
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
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'processing':
      case 'submitted':
        return <Clock className="w-5 h-5" />;
      case 'declined':
      case 'failed':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            Error Loading Form
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => router.push(`/${locale}/admin`)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/${locale}/admin`)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Application Details
                </h1>
                <p className="text-sm text-gray-600">
                  Tracking ID: <span className="font-mono font-medium">{formData.tracking_id}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-xl border-2 p-6 ${getStatusColor(formData.processing_status)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Processing Status</span>
                {getStatusIcon(formData.processing_status)}
              </div>
              <p className="text-2xl font-bold capitalize">
                {formData.processing_status}
              </p>
            </div>

            <div className={`rounded-xl border-2 p-6 ${getStatusColor(formData.payment_status)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Payment Status</span>
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold capitalize">
                {formData.payment_status}
              </p>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Payment Amount
                </span>
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formData.payment_amount} {formData.payment_currency}
              </p>
            </div>
          </div>

          {/* Main Applicant Photo */}
          {formData.photo_url && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <ImageIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Main Applicant Photo
                </h2>
                <button
                  onClick={() => downloadPhoto(formData.photo_url!, 'main_applicant')}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={formData.photo_url}
                    alt="Main Applicant"
                    className="max-w-sm rounded-lg border-4 border-gray-200 shadow-lg"
                  />
                  <div className="mt-2 text-center text-sm text-gray-600">
                    {formData.applicant_data.first_name} {formData.applicant_data.last_name}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="w-6 h-6 mr-2 text-blue-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">First Name</label>
                <p className="text-lg text-gray-900 font-medium mt-1">
                  {formData.applicant_data.first_name}
                </p>
              </div>
              {formData.applicant_data.middle_name && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Middle Name</label>
                  <p className="text-lg text-gray-900 font-medium mt-1">
                    {formData.applicant_data.middle_name}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Last Name</label>
                <p className="text-lg text-gray-900 font-medium mt-1">
                  {formData.applicant_data.last_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Gender</label>
                <p className="text-lg text-gray-900 font-medium mt-1">
                  {formData.applicant_data.gender}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-lg text-gray-900 font-medium mt-1">
                  {formatDate(formData.applicant_data.date_of_birth)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Place of Birth</label>
                <p className="text-lg text-gray-900 font-medium mt-1">
                  {formData.applicant_data.place_of_birth}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Country of Birth</label>
                <p className="text-lg text-gray-900 font-medium mt-1">
                  {formData.applicant_data.country_of_birth}
                </p>
              </div>
              {formData.applicant_data.country_of_eligibility && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Country of Eligibility
                  </label>
                  <p className="text-lg text-gray-900 font-medium mt-1">
                    {formData.applicant_data.country_of_eligibility}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Mail className="w-6 h-6 mr-2 text-blue-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg text-gray-900 font-medium mt-1">
                  {formData.applicant_data.email || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-lg text-gray-900 font-medium mt-1">
                  {formData.applicant_data.phone || 'Not provided'}
                </p>
              </div>
              {formData.applicant_data.address && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-lg text-gray-900 font-medium mt-1">
                    {formData.applicant_data.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Background Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
              Background Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Education Level
                </label>
                <p className="text-lg text-gray-900 font-medium mt-1">
                  {formData.applicant_data.education_level?.replace(/_/g, ' ') || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  Occupation
                </label>
                <p className="text-lg text-gray-900 font-medium mt-1">
                  {formData.applicant_data.occupation || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  Marital Status
                </label>
                <p className="text-lg text-gray-900 font-medium mt-1">
                  {formData.applicant_data.marital_status}
                </p>
              </div>
            </div>
          </div>

          {/* Family Members */}
          {formData.family_members && formData.family_members.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Family Members ({formData.family_members.length})
              </h2>
              <div className="space-y-6">
                {formData.family_members.map((member, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {member.relationship_type}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {member.first_name} {member.middle_name} {member.last_name}
                        </p>
                      </div>
                      {member.photo_url && (
                        <button
                          onClick={() =>
                            downloadPhoto(
                              member.photo_url!,
                              `${member.relationship_type}_${member.first_name}`
                            )
                          }
                          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download Photo</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {member.photo_url && (
                        <div className="md:col-span-2 lg:col-span-1">
                          <img
                            src={member.photo_url}
                            alt={`${member.first_name} ${member.last_name}`}
                            className="w-full max-w-[200px] rounded-lg border-2 border-gray-200 shadow-sm"
                          />
                        </div>
                      )}
                      <div className={member.photo_url ? 'md:col-span-2 lg:col-span-3' : 'md:col-span-2 lg:col-span-4'}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Gender</label>
                            <p className="text-sm text-gray-900 font-medium">{member.gender}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">
                              Date of Birth
                            </label>
                            <p className="text-sm text-gray-900 font-medium">
                              {formatDate(member.date_of_birth)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">
                              Place of Birth
                            </label>
                            <p className="text-sm text-gray-900 font-medium">
                              {member.place_of_birth}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">
                              Country of Birth
                            </label>
                            <p className="text-sm text-gray-900 font-medium">
                              {member.country_of_birth}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Receipt */}
          {formData.bank_receipt_url && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600" />
                  Bank Receipt
                  {formData.bank_receipt_verified && (
                    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => downloadFile(formData.bank_receipt_url!, `${formData.tracking_id}_receipt.jpg`)}
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
                  className="max-w-2xl w-full rounded-lg border-2 border-gray-200 shadow-lg"
                />
              </div>
            </div>
          )}

          {/* Submitted By */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Submitted By</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-lg text-gray-900 font-medium mt-1">{formData.user_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg text-gray-900 font-medium mt-1">{formData.user_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <p className="text-lg text-gray-900 font-medium mt-1 capitalize">
                  {formData.user_role}
                </p>
              </div>
              {formData.user_business_name && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Business Name</label>
                  <p className="text-lg text-gray-900 font-medium mt-1">
                    {formData.user_business_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {formData.admin_notes && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-6 h-6 mr-2 text-yellow-600" />
                Admin Notes
              </h2>
              <p className="text-gray-800 whitespace-pre-wrap">{formData.admin_notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-600" />
              Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Created</span>
                <span className="text-gray-900 font-semibold">
                  {new Date(formData.created_at).toLocaleString()}
                </span>
              </div>
              {formData.submitted_at && (
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Submitted</span>
                  <span className="text-gray-900 font-semibold">
                    {new Date(formData.submitted_at).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Last Updated</span>
                <span className="text-gray-900 font-semibold">
                  {new Date(formData.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

