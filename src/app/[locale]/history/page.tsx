'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type HistoryPageProps = {
  params: Promise<{ locale: string }>;
};

interface Application {
  id: string;
  tracking_id: string;
  applicant_name: string;
  processing_status: string;
  payment_status: string;
  submission_date: string;
  last_updated: string;
  completion_document_url?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Stats {
  total: number;
  successful: number;
  pending: number;
}

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
    draft: 'Draft',
    submitted: 'Submitted',
    processing: 'Processing',
    approved: 'Approved',
    completed: 'Completed',
    declined: 'Declined',
    failed: 'Failed',
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
    clear_filters: 'Clear Filters',
    loading: 'Loading...',
    error_loading: 'Error loading applications',
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
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
    draft: 'ረቂቅ',
    submitted: 'ተልኳል',
    processing: 'በሂደት ላይ',
    approved: 'ጸድቋል',
    completed: 'ተጠናቋል',
    declined: 'ተከልክሏል',
    failed: 'ተስፏል',
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
    clear_filters: 'ማጣሪያዎችን ሰርዝ',
    loading: 'በመጫን ላይ...',
    error_loading: 'ማመልከቻዎችን በመጫን ላይ ስህተት',
    page: 'ገጽ',
    of: 'ከ',
    previous: 'ቀዳሚ',
    next: 'ቀጣይ',
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
    draft: 'ድራፍት',
    submitted: 'ተላኢኹ',
    processing: 'ኣብ መስርሕ',
    approved: 'ተቐቢሉ',
    completed: 'ተወዲኡ',
    declined: 'ተነጺሉ',
    failed: 'ሓሲሩ',
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
    clear_filters: 'ማጣሪያታት ስረዝ',
    loading: 'ኣብ ምጽዓን...',
    error_loading: 'ምዝገባታት ኣብ ምጽዓን ጌጋ',
    page: 'ገጽ',
    of: 'ካብ',
    previous: 'ዝሓለፈ',
    next: 'ቀጻሊ',
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
    draft: 'Qopheessaa',
    submitted: 'Ergamee',
    processing: 'Hojii keessa jira',
    approved: 'Fudhatame',
    completed: 'Xumurameera',
    declined: 'Diidameera',
    failed: 'Hin milkoofne',
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
    clear_filters: 'Calchitoota Balleessi',
    loading: 'Fe\'aa jira...',
    error_loading: 'Iyyannoo fe\'uutti dogoggora',
    page: 'Fuula',
    of: 'irraa',
    previous: 'Duraanii',
    next: 'Itti Fufi',
  }
};

export default function HistoryPage({ params }: HistoryPageProps) {
  const [locale, setLocale] = useState<string>('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [stats, setStats] = useState<Stats>({
    total: 0,
    successful: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  // Fetch applications from API
  const fetchApplications = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!token) {
        // Redirect to login if not authenticated
        window.location.href = `/${locale}/login`;
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        sortBy: sortBy,
      });

      const response = await fetch(`/api/user/forms?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      
      if (data.success) {
        setApplications(data.forms);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to load applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(error instanceof Error ? error.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch applications on mount and when filters change
  useEffect(() => {
    if (locale) {
      fetchApplications();
    }
  }, [locale, currentPage, searchTerm, statusFilter, sortBy]);

  const t = content[locale as keyof typeof content] || content.en;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
  };

  const downloadDocument = async (documentUrl: string, trackingId: string) => {
    try {
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `completion-document-${trackingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document');
    }
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">{t.all_statuses}</option>
                <option value="draft">{t.draft}</option>
                <option value="submitted">{t.submitted}</option>
                <option value="processing">{t.processing}</option>
                <option value="approved">{t.approved}</option>
                <option value="completed">{t.completed}</option>
                <option value="declined">{t.declined}</option>
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
              {t.title} ({pagination.total})
            </h3>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-red-700">{t.error_loading}: {error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">{t.loading}</p>
            </div>
          ) : applications.length === 0 ? (
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
            <>
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
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{app.tracking_id}</div>
                            <div className="text-sm text-gray-500">{app.applicant_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.processing_status)}`}>
                            {t[app.processing_status as keyof typeof t] || app.processing_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(app.submission_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(app.last_updated).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/${locale}/history/${app.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            {t.view_details}
                          </Link>
                          {app.processing_status === 'completed' && app.completion_document_url && (
                            <button 
                              onClick={() => downloadDocument(app.completion_document_url!, app.tracking_id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              {t.download}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t.previous}
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t.next}
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        {t.page} <span className="font-medium">{currentPage}</span> {t.of}{' '}
                        <span className="font-medium">{pagination.pages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t.previous}
                        </button>
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let pageNum;
                          if (pagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t.next}
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
