'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BulkSubmissionUpload from '@/components/agent/BulkSubmissionUpload';

type BulkSubmitPageProps = {
  params: Promise<{ locale: string }>;
};

export default function BulkSubmitPage({ params }: BulkSubmitPageProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [currentTierSubmissions, setCurrentTierSubmissions] = useState(0);

  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  useEffect(() => {
    const checkAuthAndFetchStats = async () => {
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

        // Fetch agent statistics to get current tier submissions
        const statsResponse = await fetch('/api/agent/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setCurrentTierSubmissions(statsData.stats.total_submissions || 0);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching agent data:', err);
        setIsLoading(false);
      }
    };

    if (locale) {
      checkAuthAndFetchStats();
    }
  }, [locale, router]);

  const handleUploadComplete = () => {
    // Redirect to forms page after successful upload
    router.push(`/${locale}/agent/forms`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
            <li className="text-gray-900 font-medium">Bulk Submit</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Form Submission</h1>
          <p className="mt-2 text-gray-600">
            Upload multiple DV lottery applications at once using CSV or Excel files
          </p>
        </div>

        {/* Upload Component */}
        <BulkSubmissionUpload
          onUploadComplete={handleUploadComplete}
          currentTierSubmissions={currentTierSubmissions}
        />

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            📋 How to Use Bulk Upload
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <span>Download the CSV template to see the required format</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <span>Fill in applicant information for each row (one applicant per row)</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <span>Upload your completed CSV or Excel file</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
              <span>Review validation results and fix any errors</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">5.</span>
              <span>Confirm and submit all valid applications</span>
            </div>
          </div>
        </div>

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


