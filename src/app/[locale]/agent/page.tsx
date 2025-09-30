'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type AgentDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

const content = {
  en: {
    title: 'Agent Dashboard',
    subtitle: 'Manage your client applications and earnings',
    welcome: 'Welcome, Agent',
    overview: 'Overview',
    clients: 'Client Management',
    applications: 'Application Management',
    earnings: 'Earnings & Reports',
    settings: 'Agent Settings',
    total_clients: 'Total Clients',
    active_applications: 'Active Applications',
    monthly_earnings: 'Monthly Earnings',
    commission_rate: 'Commission Rate',
    recent_applications: 'Recent Applications',
    client_name: 'Client Name',
    application_type: 'Type',
    status: 'Status',
    commission: 'Commission',
    date: 'Date',
    actions: 'Actions',
    view: 'View',
    download: 'Download',
    add_client: 'Add New Client',
    bulk_upload: 'Bulk Upload',
    export_data: 'Export Data',
    submitted: 'Submitted',
    processing: 'Processing',
    completed: 'Completed',
    rejected: 'Rejected',
    dv_lottery: 'DV Lottery',
    individual: 'Individual',
    family: 'Family',
    no_applications: 'No applications found',
    create_first: 'Add your first client application',
    agent_tier: 'Agent Tier',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',
    upgrade_tier: 'Upgrade Tier',
    tier_benefits: 'Tier Benefits',
    quick_actions: 'Quick Actions',
    new_application: 'New Application',
    client_portal: 'Client Portal',
    reports: 'Reports',
    support: 'Support'
  },
  am: {
    title: 'የወኪል ዳሽቦርድ',
    subtitle: 'የደንበኞች ማመልከቻዎችን እና ገቢዎችን ያስተዳድሩ',
    welcome: 'እንኳን ደህና መጡ ወኪል',
    overview: 'አጠቃላይ እይታ',
    clients: 'የደንበኞች አስተዳደር',
    applications: 'የማመልከቻ አስተዳደር',
    earnings: 'ገቢዎች እና ሪፖርቶች',
    settings: 'የወኪል ቅንብሮች',
    total_clients: 'ጠቅላላ ደንበኞች',
    active_applications: 'ንቁ ማመልከቻዎች',
    monthly_earnings: 'ወርሃዊ ገቢ',
    commission_rate: 'የኮሚሽን መጠን',
    recent_applications: 'የቅርብ ጊዜ ማመልከቻዎች',
    client_name: 'የደንበኛ ስም',
    application_type: 'አይነት',
    status: 'ሁኔታ',
    commission: 'ኮሚሽን',
    date: 'ቀን',
    actions: 'እርምጃዎች',
    view: 'ይመልከቱ',
    download: 'አውርድ',
    add_client: 'አዲስ ደንበኛ ጨምር',
    bulk_upload: 'በጅምላ ስቀል',
    export_data: 'መረጃ ወደ ውጭ ውጣ',
    submitted: 'ተልኳል',
    processing: 'በሂደት ላይ',
    completed: 'ተጠናቋል',
    rejected: 'ተከልክሏል',
    dv_lottery: 'ዲቪ ሎተሪ',
    individual: 'ግለሰብ',
    family: 'ቤተሰብ',
    no_applications: 'ማመልከቻዎች አልተገኙም',
    create_first: 'የመጀመሪያ የደንበኛ ማመልከቻ ጨምሩ',
    agent_tier: 'የወኪል ደረጃ',
    bronze: 'ነሐስ',
    silver: 'ብር',
    gold: 'ወርቅ',
    platinum: 'ፕላቲነም',
    upgrade_tier: 'ደረጃ ከፍ ያድርጉ',
    tier_benefits: 'የደረጃ ጥቅሞች',
    quick_actions: 'ፈጣን እርምጃዎች',
    new_application: 'አዲስ ማመልከቻ',
    client_portal: 'የደንበኛ መግቢያ',
    reports: 'ሪፖርቶች',
    support: 'ድጋፍ'
  },
  ti: {
    title: 'ናይ ወኪል ዳሽቦርድ',
    subtitle: 'ናይ ደንበኛታት ምዝገባታትን ኣትዋትን ዝቆጻጸር',
    welcome: 'እንኳን ደሓን መጸ ወኪል',
    overview: 'ሓፈሻዊ እይታ',
    clients: 'ናይ ደንበኛታት ኣመሓደራ',
    applications: 'ናይ ምዝገባ ኣመሓደራ',
    earnings: 'ኣትዋትን ሪፖርታትን',
    settings: 'ናይ ወኪል ምቁጻር',
    total_clients: 'ጠቅላላ ደንበኛታት',
    active_applications: 'ንቁሓት ምዝገባታት',
    monthly_earnings: 'ወርሓዊ ኣትዋት',
    commission_rate: 'ናይ ኮሚሽን መጠን',
    recent_applications: 'ናይ ቀረባ እዋን ምዝገባታት',
    client_name: 'ስም ደንበኛ',
    application_type: 'ዓይነት',
    status: 'ኩነታት',
    commission: 'ኮሚሽን',
    date: 'ዕለት',
    actions: 'ስጓማት',
    view: 'ርአ',
    download: 'ኣውርድ',
    add_client: 'ሓዲሽ ደንበኛ ወስኽ',
    bulk_upload: 'ብብዝሒ ኣወጽእ',
    export_data: 'መረዳእታ ወጻኢ',
    submitted: 'ተላኢኹ',
    processing: 'ኣብ መስርሕ',
    completed: 'ተወዲኡ',
    rejected: 'ተነጺሉ',
    dv_lottery: 'ዲቪ ሎተሪ',
    individual: 'ውልቀሰብ',
    family: 'ቤተሰብ',
    no_applications: 'ምዝገባታት ኣይተረኽቡን',
    create_first: 'ናይ መጀመርታ ደንበኛ ምዝገባ ወስኽ',
    agent_tier: 'ናይ ወኪል ደረጃ',
    bronze: 'ነሓስ',
    silver: 'ብሩር',
    gold: 'ወርቂ',
    platinum: 'ፕላቲነም',
    upgrade_tier: 'ደረጃ ኣብ ላዕሊ',
    tier_benefits: 'ናይ ደረጃ ረብሓታት',
    quick_actions: 'ቅልጡፍ ስጓማት',
    new_application: 'ሓዲሽ ምዝገባ',
    client_portal: 'ናይ ደንበኛ መኣተዊ',
    reports: 'ሪፖርታት',
    support: 'ደገፍ'
  },
  or: {
    title: 'Dashboordii Bakka Bu\'aa',
    subtitle: 'Iyyannoo maamilotaatii fi galii kee bulchi',
    welcome: 'Baga nagaan dhufteetta Bakka Bu\'aa',
    overview: 'Ilaalcha Waliigalaa',
    clients: 'Bulchiinsa Maamilotaa',
    applications: 'Bulchiinsa Iyyannoo',
    earnings: 'Galii fi Gabaasota',
    settings: 'Qindaʼina Bakka Bu\'aa',
    total_clients: 'Maamilota Walitti',
    active_applications: 'Iyyannoo Sochii',
    monthly_earnings: 'Galii Ji\'aa',
    commission_rate: 'Reetii Komiishinii',
    recent_applications: 'Iyyannoo Dhiheessaa',
    client_name: 'Maqaa Maamila',
    application_type: 'Gosa',
    status: 'Haala',
    commission: 'Komiishinii',
    date: 'Guyyaa',
    actions: 'Tarkaanfiilee',
    view: 'Ilaali',
    download: 'Buufadhu',
    add_client: 'Maamila Haaraa Dabali',
    bulk_upload: 'Baayʼinaan Ol Kaaʼi',
    export_data: 'Daataa Baasi',
    submitted: 'Ergamee',
    processing: 'Hojii keessa',
    completed: 'Xumurameera',
    rejected: 'Diidameera',
    dv_lottery: 'DV Looxtarii',
    individual: 'Dhuunfaa',
    family: 'Maatii',
    no_applications: 'Iyyannoon hin argamne',
    create_first: 'Iyyannoo maamila jalqabaa dabali',
    agent_tier: 'Sadarkaa Bakka Bu\'aa',
    bronze: 'Naasii',
    silver: 'Meetii',
    gold: 'Warqee',
    platinum: 'Plaatiinaam',
    upgrade_tier: 'Sadarkaa Ol Kaasi',
    tier_benefits: 'Faayidaa Sadarkaa',
    quick_actions: 'Tarkaanfiilee Saffisaa',
    new_application: 'Iyyannoo Haaraa',
    client_portal: 'Karra Maamila',
    reports: 'Gabaasota',
    support: 'Deeggarsaa'
  }
};

export default function AgentDashboardPage({ params }: AgentDashboardPageProps) {
  const [locale, setLocale] = useState<string>('en');
  const [activeTab, setActiveTab] = useState('overview');

  const [agentData] = useState({
    name: 'Agent Smith',
    tier: 'silver',
    commissionRate: 15,
    totalClients: 45,
    activeApplications: 12,
    monthlyEarnings: 2850,
    currency: 'ETB'
  });

  const [recentApplications] = useState([
    {
      id: 1,
      clientName: 'John Doe',
      type: 'individual',
      status: 'completed',
      commission: 85,
      date: '2024-01-20',
      confirmationNumber: 'DV2025-001234'
    },
    {
      id: 2,
      clientName: 'Jane Smith',
      type: 'family',
      status: 'processing',
      commission: 125,
      date: '2024-01-18',
      confirmationNumber: 'DV2025-001235'
    },
    {
      id: 3,
      clientName: 'Bob Johnson',
      type: 'individual',
      status: 'submitted',
      commission: 85,
      date: '2024-01-15',
      confirmationNumber: 'DV2025-001236'
    },
    {
      id: 4,
      clientName: 'Alice Brown',
      type: 'family',
      status: 'rejected',
      commission: 0,
      date: '2024-01-10',
      confirmationNumber: 'DV2025-001237'
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '🏅';
    }
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
                {t.settings}
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

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm p-6 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t.welcome}</h2>
              <p className="text-blue-100">{agentData.name}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getTierIcon(agentData.tier)}</span>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTierColor(agentData.tier)}`}>
                  {t[agentData.tier as keyof typeof t] || agentData.tier}
                </span>
              </div>
              <button className="text-blue-100 hover:text-white text-sm mt-2">
                {t.upgrade_tier} →
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.total_clients}</p>
                <p className="text-2xl font-bold text-gray-900">{agentData.totalClients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.active_applications}</p>
                <p className="text-2xl font-bold text-gray-900">{agentData.activeApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.monthly_earnings}</p>
                <p className="text-2xl font-bold text-gray-900">{agentData.monthlyEarnings} {agentData.currency}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.commission_rate}</p>
                <p className="text-2xl font-bold text-gray-900">{agentData.commissionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            href={`/${locale}/apply`}
            className="bg-white hover:bg-gray-50 rounded-lg shadow-sm p-6 text-center transition-colors border border-gray-200"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">{t.new_application}</h3>
          </Link>

          <button className="bg-white hover:bg-gray-50 rounded-lg shadow-sm p-6 text-center transition-colors border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">{t.bulk_upload}</h3>
          </button>

          <button className="bg-white hover:bg-gray-50 rounded-lg shadow-sm p-6 text-center transition-colors border border-gray-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">{t.reports}</h3>
          </button>

          <button className="bg-white hover:bg-gray-50 rounded-lg shadow-sm p-6 text-center transition-colors border border-gray-200">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">{t.support}</h3>
          </button>
        </div>

        {/* Recent Applications Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">{t.recent_applications}</h3>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:text-blue-700 text-sm">
                {t.export_data}
              </button>
              <Link
                href={`/${locale}/history`}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All →
              </Link>
            </div>
          </div>

          {recentApplications.length === 0 ? (
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
                      {t.client_name}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.application_type}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.status}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.commission}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.date}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app.clientName}</div>
                          <div className="text-sm text-gray-500">{app.confirmationNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {t[app.type as keyof typeof t] || app.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {t[app.status as keyof typeof t] || app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.commission} {agentData.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(app.date).toLocaleDateString()}
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
      </div>
    </div>
  );
}