'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

const content = {
  en: {
    title: 'Dashboard',
    subtitle: 'Manage your DV lottery applications',
    welcome: 'Welcome back!',
    applications: 'My Applications',
    new_application: 'New Application',
    profile: 'Profile',
    history: 'Application History',
    logout: 'Logout',
    no_applications: 'No applications found',
    create_first: 'Create your first application',
    status: 'Status',
    submitted: 'Submitted',
    processing: 'Processing',
    completed: 'Completed',
    date_submitted: 'Date Submitted',
    actions: 'Actions',
    view: 'View',
    download: 'Download',
    quick_stats: 'Quick Stats',
    total_apps: 'Total Applications',
    pending: 'Pending',
    success: 'Successful'
  },
  am: {
    title: 'ዳሽቦርድ',
    subtitle: 'የዲቪ ሎተሪ ማመልከቻዎችን ይቆጣጠሩ',
    welcome: 'እንደገና እንኳን ደህና መጡ!',
    applications: 'የኔ ማመልከቻዎች',
    new_application: 'አዲስ ማመልከቻ',
    profile: 'መገለጫ',
    history: 'የማመልከቻ ታሪክ',
    logout: 'ውጣ',
    no_applications: 'ማመልከቻዎች አልተገኙም',
    create_first: 'የመጀመሪያ ማመልከቻዎን ይፍጠሩ',
    status: 'ሁኔታ',
    submitted: 'ተልኳል',
    processing: 'በሂደት ላይ',
    completed: 'ተጠናቋል',
    date_submitted: 'የተላከበት ቀን',
    actions: 'እርምጃዎች',
    view: 'ይመልከቱ',
    download: 'አውርድ',
    quick_stats: 'ፈጣን ስታቲስቲክስ',
    total_apps: 'ጠቅላላ ማመልከቻዎች',
    pending: 'በጥበቃ ላይ',
    success: 'የተሳኩ'
  },
  ti: {
    title: 'ዳሽቦርድ',
    subtitle: 'ናይ ዲቪ ሎተሪ ምዝገባታትካ ዝቆጻጸር',
    welcome: 'ደገም ብደሓን መጹ!',
    applications: 'ናይ መዝግባታተይ',
    new_application: 'ሓዲሽ ምዝገባ',
    profile: 'መልክዕ',
    history: 'ናይ ምዝገባ ታሪኽ',
    logout: 'ወጽእ',
    no_applications: 'ምዝገባታት ኣይተረኽቡን',
    create_first: 'ናይ መጀመርታ ምዝገባኻ ፍጠር',
    status: 'ኩነታት',
    submitted: 'ተላኢኹ',
    processing: 'ኣብ መስርሕ',
    completed: 'ተወዲኡ',
    date_submitted: 'ዝተላኣኸሉ ዕለት',
    actions: 'ስጓማት',
    view: 'ርአ',
    download: 'ኣውርድ',
    quick_stats: 'ቅልጡፍ ስታቲስቲክስ',
    total_apps: 'ጠቅላላ ምዝገባታት',
    pending: 'ኣብ ጽንሓት',
    success: 'ዝዓወተ'
  },
  or: {
    title: 'Dashboordii',
    subtitle: 'Iyyannoo DV lottery kee bulchi',
    welcome: 'Ammas nagaan dhufuuf baga gammadne!',
    applications: 'Iyyannoo Koo',
    new_application: 'Iyyannoo Haaraa',
    profile: 'Eenyummaa',
    history: 'Seenaa Iyyannoo',
    logout: 'Baʼi',
    no_applications: 'Iyyannoon hin argamne',
    create_first: 'Iyyannoo kee isa jalqabaa uumi',
    status: 'Haala',
    submitted: 'Ergamee',
    processing: 'Hojii keessa jira',
    completed: 'Xumurameera',
    date_submitted: 'Guyyaa Ergame',
    actions: 'Tarkaanfiilee',
    view: 'Ilaali',
    download: 'Buufadhu',
    quick_stats: 'Shallaggii Saffisaa',
    total_apps: 'Iyyannoo Walitti',
    pending: 'Eegumsaa keessa',
    success: 'Milkaaʼan'
  }
};

export default function DashboardPage({ params }: DashboardPageProps) {
  const [locale, setLocale] = useState<string>('en');
  const [applications, setApplications] = useState([
    {
      id: 1,
      status: 'submitted',
      dateSubmitted: '2024-01-15',
      confirmationNumber: 'DV2025-001234'
    },
    {
      id: 2,
      status: 'processing',
      dateSubmitted: '2024-01-10',
      confirmationNumber: 'DV2025-001235'
    }
  ]);

  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  const t = content[locale as keyof typeof content] || content.en;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'submitted' || app.status === 'processing').length,
    success: applications.filter(app => app.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href={`/${locale}/profile`}
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md border border-gray-300 transition-colors"
              >
                {t.profile}
              </Link>
              <Link
                href={`/${locale}/apply`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {t.new_application}
              </Link>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.welcome}</h2>
          <p className="text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.total_apps}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.pending}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.success}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.success}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{t.applications}</h3>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900">{t.no_applications}</h3>
              <p className="mt-1 text-sm text-gray-500">{t.create_first}</p>
              <div className="mt-6">
                <Link
                  href={`/${locale}/apply`}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  {t.new_application}
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.status}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.date_submitted}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.confirmationNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {t[app.status as keyof typeof t] || app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(app.dateSubmitted).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/${locale}/history/${app.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          {t.view}
                        </Link>
                        {app.status === 'completed' && (
                          <button className="text-green-600 hover:text-green-900">
                            {t.download}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center space-x-6">
          <Link
            href={`/${locale}/history`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t.history}
          </Link>
          <Link
            href={`/${locale}/profile`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t.profile}
          </Link>
          <Link
            href={`/${locale}`}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            {t.logout}
          </Link>
        </div>
      </div>
    </div>
  );
}