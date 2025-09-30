'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type HistoryPageProps = {
  params: Promise<{ locale: string }>;
};

const content = {
  en: {
    title: 'Application History',
    subtitle: 'View all your DV lottery application submissions',
    back_dashboard: 'Back to Dashboard',
    no_history: 'No applications found',
    create_first: 'Submit your first application to see history',
    apply_now: 'Apply Now',
    confirmation_number: 'Confirmation Number',
    status: 'Status',
    date_submitted: 'Date Submitted',
    last_updated: 'Last Updated',
    actions: 'Actions',
    view_details: 'View Details',
    download: 'Download',
    submitted: 'Submitted',
    processing: 'Processing',
    completed: 'Completed',
    rejected: 'Rejected',
    under_review: 'Under Review',
    search_placeholder: 'Search by confirmation number...',
    filter_status: 'Filter by Status',
    all_statuses: 'All Statuses',
    export_history: 'Export History',
    total_applications: 'Total Applications',
    successful: 'Successful',
    pending: 'Pending',
    sort_by: 'Sort by',
    newest_first: 'Newest First',
    oldest_first: 'Oldest First',
    status_first: 'Status',
    clear_filters: 'Clear Filters'
  },
  am: {
    title: 'የማመልከቻ ታሪክ',
    subtitle: 'ሁሉንም የዲቪ ሎተሪ ማመልከቻ ማስመሳያዎች ይመልከቱ',
    back_dashboard: 'ወደ ዳሽቦርድ ይመለሱ',
    no_history: 'ማመልከቻዎች አልተገኙም',
    create_first: 'ታሪክ ለማየት የመጀመሪያ ማመልከቻዎን ያስመሱ',
    apply_now: 'አሁን ማመልክቱ',
    confirmation_number: 'የማረጋገጫ ቁጥር',
    status: 'ሁኔታ',
    date_submitted: 'የተላከበት ቀን',
    last_updated: 'የመጨረሻ ዝማኔ',
    actions: 'እርምጃዎች',
    view_details: 'ዝርዝሮችን ይመልከቱ',
    download: 'አውርድ',
    submitted: 'ተልኳል',
    processing: 'በሂደት ላይ',
    completed: 'ተጠናቋል',
    rejected: 'ተከልክሏል',
    under_review: 'በግምገማ ሂደት',
    search_placeholder: 'በማረጋገጫ ቁጥር ይፈልጉ...',
    filter_status: 'በሁኔታ አጣራ',
    all_statuses: 'ሁሉም ሁኔታዎች',
    export_history: 'ታሪክ ወደ ውጭ ውጣ',
    total_applications: 'ጠቅላላ ማመልከቻዎች',
    successful: 'የተሳኩ',
    pending: 'በጥበቃ ላይ',
    sort_by: 'ቅደም ተከተል',
    newest_first: 'አዲስ መጀመሪያ',
    oldest_first: 'ቆይቶ መጀመሪያ',
    status_first: 'ሁኔታ',
    clear_filters: 'ማጣሪያዎችን ሰርዝ'
  },
  ti: {
    title: 'ናይ ምዝገባ ታሪኽ',
    subtitle: 'ናይ ዲቪ ሎተሪ ምዝገባታት ዓቕሚ ከም ዝተመዝገቡ ወጺኢ',
    back_dashboard: 'ናብ ዳሽቦርድ ተመለስ',
    no_history: 'ምዝገባታት ኣይተረኽቡን',
    create_first: 'ታሪኽ ንምርኣይ ናይ መጀመርታ ምዝገባ ኣብጽሕ',
    apply_now: 'ሕጂ ተመዝገብ',
    confirmation_number: 'ናይ ምርግጋጽ ቁጽሪ',
    status: 'ኩነታት',
    date_submitted: 'ዝተላኣኸሉ ዕለት',
    last_updated: 'ናይ መወዳእታ ምዕራፍ',
    actions: 'ስጓማት',
    view_details: 'ዝርዝራት ርአ',
    download: 'ኣውርድ',
    submitted: 'ተላኢኹ',
    processing: 'ኣብ መስርሕ',
    completed: 'ተወዲኡ',
    rejected: 'ተነጺሉ',
    under_review: 'ኣብ ምግምጋም',
    search_placeholder: 'ብናይ ምርግጋጽ ቁጽሪ ድለ...',
    filter_status: 'ብኩነታት ፍልፍል',
    all_statuses: 'ኩሉ ኩነታት',
    export_history: 'ታሪኽ ወጻኢ',
    total_applications: 'ጠቅላላ ምዝገባታት',
    successful: 'ዝዓወተ',
    pending: 'ኣብ ጽንሓት',
    sort_by: 'ድሕሪት ቅደም',
    newest_first: 'ሓዲሽ መጀመርያ',
    oldest_first: 'ጊዜ መጀመርያ',
    status_first: 'ኩነታት',
    clear_filters: 'ማጣሪያታት ስረዝ'
  },
  or: {
    title: 'Seenaa Iyyannoo',
    subtitle: 'Iyyannoo DV lottery hunda ilaali',
    back_dashboard: 'Gara Dashboordii Deebiʼi',
    no_history: 'Iyyannoon hin argamne',
    create_first: 'Seenaa ilaaluuf iyyannoo jalqabaa galchi',
    apply_now: 'Amma Iyyaadhu',
    confirmation_number: 'Lakkoofsa Mirkaneessaa',
    status: 'Haala',
    date_submitted: 'Guyyaa Ergame',
    last_updated: 'Fooyessuu Dhumaatii',
    actions: 'Tarkaanfiilee',
    view_details: 'Bal\'ina Ilaali',
    download: 'Buufadhu',
    submitted: 'Ergamee',
    processing: 'Hojii keessa jira',
    completed: 'Xumurameera',
    rejected: 'Diidameera',
    under_review: 'Gamaaggama jalatti',
    search_placeholder: 'Lakkoofsa mirkaneessaatiin barbaadi...',
    filter_status: 'Haala waliin cali',
    all_statuses: 'Haala Hunda',
    export_history: 'Seenaa Baasi',
    total_applications: 'Iyyannoo Walitti',
    successful: 'Milkaaʼan',
    pending: 'Eegumsaa keessa',
    sort_by: 'Tartiiba',
    newest_first: 'Haaraa Jalqaba',
    oldest_first: 'Durii Jalqaba',
    status_first: 'Haala',
    clear_filters: 'Calchitoota Balleessi'
  }
};

export default function HistoryPage({ params }: HistoryPageProps) {
  const [locale, setLocale] = useState<string>('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [applications] = useState([
    {
      id: 1,
      confirmationNumber: 'DV2025-001234',
      status: 'completed',
      dateSubmitted: '2024-01-15',
      lastUpdated: '2024-01-20',
      applicantName: 'John Doe'
    },
    {
      id: 2,
      confirmationNumber: 'DV2025-001235',
      status: 'processing',
      dateSubmitted: '2024-01-10',
      lastUpdated: '2024-01-18',
      applicantName: 'Jane Smith'
    },
    {
      id: 3,
      confirmationNumber: 'DV2025-001236',
      status: 'submitted',
      dateSubmitted: '2024-01-05',
      lastUpdated: '2024-01-05',
      applicantName: 'Bob Johnson'
    },
    {
      id: 4,
      confirmationNumber: 'DV2025-001237',
      status: 'rejected',
      dateSubmitted: '2023-12-20',
      lastUpdated: '2024-01-12',
      applicantName: 'Alice Brown'
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
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.confirmationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.applicantName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime();
        case 'oldest':
          return new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const stats = {
    total: applications.length,
    successful: applications.filter(app => app.status === 'completed').length,
    pending: applications.filter(app => ['submitted', 'processing', 'under_review'].includes(app.status)).length
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/${locale}/dashboard`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← {t.back_dashboard}
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
            <div className="flex space-x-4">
              <button className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md border border-gray-300 transition-colors">
                {t.export_history}
              </button>
              <Link
                href={`/${locale}/apply`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {t.apply_now}
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.total_applications}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-sm font-medium text-gray-600">{t.successful}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successful}</p>
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
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search_placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                {t.filter_status}
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">{t.all_statuses}</option>
                <option value="submitted">{t.submitted}</option>
                <option value="processing">{t.processing}</option>
                <option value="completed">{t.completed}</option>
                <option value="rejected">{t.rejected}</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                {t.sort_by}
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="newest">{t.newest_first}</option>
                <option value="oldest">{t.oldest_first}</option>
                <option value="status">{t.status_first}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t.clear_filters}
              </button>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {t.title} ({filteredApplications.length})
            </h3>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900">{t.no_history}</h3>
              <p className="mt-1 text-sm text-gray-500">{t.create_first}</p>
              <div className="mt-6">
                <Link
                  href={`/${locale}/apply`}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  {t.apply_now}
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.confirmation_number}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.status}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.date_submitted}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.last_updated}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app.confirmationNumber}</div>
                          <div className="text-sm text-gray-500">{app.applicantName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {t[app.status as keyof typeof t] || app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(app.dateSubmitted).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(app.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/${locale}/history/${app.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          {t.view_details}
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
      </div>
    </div>
  );
}