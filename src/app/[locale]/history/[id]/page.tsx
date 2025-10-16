'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type HistoryDetailsPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const content = {
  en: {
    title: 'Application Details',
    back_to_history: 'Back to History',
    application_info: 'Application Information',
    confirmation_number: 'Confirmation Number',
    status: 'Status',
    date_submitted: 'Date Submitted',
    last_updated: 'Last Updated',
    applicant_info: 'Applicant Information',
    full_name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
// passport_number: 'Passport Number',
// passport_expiry: 'Passport Expiry',
    payment_info: 'Payment Information',
    payment_status: 'Payment Status',
    amount: 'Amount',
    currency: 'Currency',
    loading: 'Loading application details...',
    not_found: 'Application not found',
    error: 'Error loading application details'
  }
};

export default function HistoryDetailsPage({ params }: HistoryDetailsPageProps) {
  const [locale, setLocale] = useState<string>('en');
  const [id, setId] = useState<string>('');
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ locale: resolvedLocale, id: resolvedId }) => {
      setLocale(resolvedLocale);
      setId(resolvedId);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchApplicationDetails = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        
        if (!token) {
          window.location.href = `/${locale}/login`;
          return;
        }

        const response = await fetch(`/api/user/applications/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = `/${locale}/login`;
          return;
        }

        if (!response.ok) {
          if (response.status === 404) {
            setError('Application not found');
          } else {
            setError('Error loading application details');
          }
          return;
        }

        const data = await response.json();
        setApplication(data.application);
      } catch (error) {
        console.error('Failed to fetch application details:', error);
        setError('Error loading application details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id, locale]);

  const t = content[locale as keyof typeof content] || content.en;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/${locale}/history`}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← {t.back_to_history}
          </Link>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-600 text-xl font-semibold">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/${locale}/history`}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← {t.back_to_history}
          </Link>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-600">{t.not_found}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/history`}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← {t.back_to_history}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>

        {/* Application Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.application_info}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">{t.confirmation_number}</label>
              <p className="text-gray-900 font-mono">{application.confirmationNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t.status}</label>
              <div className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t.date_submitted}</label>
              <p className="text-gray-900">{new Date(application.dateSubmitted).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t.last_updated}</label>
              <p className="text-gray-900">{new Date(application.dateSubmitted).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Applicant Information */}
        {application.applicant_data && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.applicant_info}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t.full_name}</label>
                <p className="text-gray-900">
                  {`${application.applicant_data.first_name} ${application.applicant_data.middle_name || ''} ${application.applicant_data.last_name}`.trim()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t.email}</label>
                <p className="text-gray-900">{application.applicant_data.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t.phone}</label>
                <p className="text-gray-900">{application.applicant_data.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t.address}</label>
                <p className="text-gray-900">{application.applicant_data.address}</p>
              </div>
              {/* <div>
                <label className="text-sm font-medium text-gray-500">{t.passport_number}</label>
                <p className="text-gray-900 font-mono">{application.applicant_data.passport_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t.passport_expiry}</label>
                <p className="text-gray-900">{application.applicant_data.passport_expiry}</p>
              </div> */}
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.payment_info}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">{t.payment_status}</label>
              <p className="text-gray-900">{application.paymentStatus}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t.amount}</label>
              <p className="text-gray-900">{application.paymentAmount}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t.currency}</label>
              <p className="text-gray-900">{application.paymentCurrency}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}