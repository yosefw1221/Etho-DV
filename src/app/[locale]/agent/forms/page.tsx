'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormManagement from '@/components/agent/FormManagement';
import { FormSubmissionSummary } from '@/types/agent';

type FormsPageProps = {
  params: Promise<{ locale: string }>;
};

export default function FormsPage({ params }: FormsPageProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [forms, setForms] = useState<FormSubmissionSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  useEffect(() => {
    const checkAuthAndFetchForms = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push(`/${locale}/login`);
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (user.role !== 'agent') {
          router.push(`/${locale}/dashboard`);
          return;
        }

        // Fetch all forms for this agent
        const formsResponse = await fetch('/api/user/forms?limit=1000', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!formsResponse.ok) {
          if (formsResponse.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            router.push(`/${locale}/login`);
            return;
          }
          throw new Error('Failed to fetch forms');
        }

        const formsData = await formsResponse.json();
        
        // Transform the data to match FormSubmissionSummary interface
        const transformedForms: FormSubmissionSummary[] = (formsData.forms || []).map((form: any) => ({
          id: form.id,
          applicant_name: form.applicant_name,
          submission_date: new Date(form.submission_date),
          status: form.processing_status,
          payment_status: form.payment_status,
          cost: form.payment_amount || 300,
          reference_number: form.tracking_id
        }));

        setForms(transformedForms);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError(err instanceof Error ? err.message : 'Failed to load forms');
        setIsLoading(false);
      }
    };

    if (locale) {
      checkAuthAndFetchForms();
    }
  }, [locale, router]);

  const handleFormAction = async (formId: string, action: 'view' | 'download' | 'resend') => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');

    switch (action) {
      case 'view':
        router.push(`/${locale}/history/${formId}`);
        break;

      case 'download':
        try {
          const response = await fetch(`/api/user/forms/${formId}/download`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `form_${formId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } else {
            alert('Download failed. Please try again.');
          }
        } catch (err) {
          console.error('Download failed:', err);
          alert('Download failed. Please try again.');
        }
        break;

      case 'resend':
        // Retry payment/submission logic
        try {
          const response = await fetch(`/api/user/forms/${formId}/retry`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            alert('Form resubmission initiated successfully');
            // Reload forms
            window.location.reload();
          } else {
            alert('Retry failed. Please contact support.');
          }
        } catch (err) {
          console.error('Retry failed:', err);
          alert('Retry failed. Please contact support.');
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Forms</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href={`/${locale}/agent`} className="hover:text-gray-700">
                Agent Dashboard
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium">Form Management</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form Management</h1>
            <p className="mt-2 text-gray-600">
              View and manage all your client form submissions
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/${locale}/agent/bulk-submit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              📤 Bulk Submit
            </Link>
            <Link
              href={`/${locale}/apply`}
              className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md border border-gray-300 transition-colors"
            >
              ➕ New Form
            </Link>
          </div>
        </div>

        {/* Form Management Component */}
        <FormManagement forms={forms} onFormAction={handleFormAction} />

        {/* Back Link */}
        <div className="mt-6">
          <Link
            href={`/${locale}/agent`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}


