'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AgentStats, getNextTierProgress, AGENT_TIERS } from '@/types/agent';
import { cn } from '@/lib/utils';

type AnalyticsPageProps = {
  params: Promise<{ locale: string }>;
};

interface MonthlyData {
  month: string;
  submissions: number;
  completed: number;
  revenue: number;
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  useEffect(() => {
    const checkAuthAndFetchAnalytics = async () => {
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

        // Fetch agent statistics
        const statsResponse = await fetch('/api/agent/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const statsData = await statsResponse.json();
        setStats(statsData.stats);

        // Generate mock monthly data (in a real app, this would come from the API)
        const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        const mockMonthlyData: MonthlyData[] = months.map((month, index) => ({
          month,
          submissions: Math.floor(Math.random() * 20) + 5,
          completed: Math.floor(Math.random() * 15) + 3,
          revenue: (Math.floor(Math.random() * 5000) + 1000)
        }));
        setMonthlyData(mockMonthlyData);

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
        setIsLoading(false);
      }
    };

    if (locale) {
      checkAuthAndFetchAnalytics();
    }
  }, [locale, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load analytics data'}</p>
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

  const tierProgress = getNextTierProgress(stats.total_submissions);
  const successRate = stats.total_submissions > 0 
    ? Math.round((stats.completed_submissions / stats.total_submissions) * 100)
    : 0;
  
  const maxSubmissions = Math.max(...monthlyData.map(d => d.submissions), 1);
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

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
            <li className="text-gray-900 font-medium">Analytics</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="mt-2 text-gray-600">
            Track your performance and business insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Success Rate</span>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{successRate}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.completed_submissions} of {stats.total_submissions} completed
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Commission</span>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.commission_earned} ETB</p>
            <p className="text-xs text-gray-500 mt-1">
              20 ETB × {stats.completed_submissions} forms
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">This Month</span>
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.this_month_submissions}</p>
            <p className="text-xs text-gray-500 mt-1">Submissions</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Avg. Processing</span>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.avg_processing_time}h</p>
            <p className="text-xs text-gray-500 mt-1">Per application</p>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tier Progress</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Current Tier: {stats.current_tier.charAt(0).toUpperCase() + stats.current_tier.slice(1)}
                </span>
                {tierProgress.next && (
                  <p className="text-xs text-gray-500 mt-1">
                    {tierProgress.formsNeeded} more forms to reach {tierProgress.next.name}
                  </p>
                )}
              </div>
              <span className="text-2xl">
                {stats.current_tier === 'bronze' && '🥉'}
                {stats.current_tier === 'silver' && '🥈'}
                {stats.current_tier === 'gold' && '🥇'}
              </span>
            </div>
            
            {tierProgress.next && (
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${tierProgress.progress}%` }}
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-4">
              {AGENT_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    'p-4 border rounded-lg text-center',
                    tier.name === stats.current_tier
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  )}
                >
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {tier.name.charAt(0).toUpperCase() + tier.name.slice(1)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {tier.min_submissions}+ forms
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {tier.rate_per_form} ETB/form
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Submissions Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Submissions</h2>
            <div className="space-y-3">
              {monthlyData.map((data) => (
                <div key={data.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{data.month}</span>
                    <span className="text-sm font-semibold text-gray-900">{data.submissions}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(data.submissions / maxSubmissions) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Revenue</h2>
            <div className="space-y-3">
              {monthlyData.map((data) => (
                <div key={data.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{data.month}</span>
                    <span className="text-sm font-semibold text-gray-900">{data.revenue} ETB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Status Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {stats.completed_submissions}
              </div>
              <div className="text-sm font-medium text-green-700">Completed</div>
              <div className="text-xs text-green-600 mt-1">
                {stats.total_submissions > 0 ? Math.round((stats.completed_submissions / stats.total_submissions) * 100) : 0}% of total
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {stats.pending_submissions}
              </div>
              <div className="text-sm font-medium text-yellow-700">Pending</div>
              <div className="text-xs text-yellow-600 mt-1">
                {stats.total_submissions > 0 ? Math.round((stats.pending_submissions / stats.total_submissions) * 100) : 0}% of total
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {stats.failed_submissions}
              </div>
              <div className="text-sm font-medium text-red-700">Failed</div>
              <div className="text-xs text-red-600 mt-1">
                {stats.total_submissions > 0 ? Math.round((stats.failed_submissions / stats.total_submissions) * 100) : 0}% of total
              </div>
            </div>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Commission Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-700">Total Paid to Platform</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.total_submissions} forms × {stats.discount_rate} ETB
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.total_revenue.toLocaleString()} ETB
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-green-700">Total Commission Earned</div>
                <div className="text-xs text-green-600 mt-1">
                  {stats.completed_submissions} completed forms × 20 ETB
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.commission_earned.toLocaleString()} ETB
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-blue-700">Net Investment</div>
                <div className="text-xs text-blue-600 mt-1">
                  Platform fees minus commission
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {(stats.total_revenue - stats.commission_earned).toLocaleString()} ETB
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            💡 Performance Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white bg-opacity-60 p-4 rounded-lg">
              <div className="font-medium text-blue-900 mb-2">Best Month</div>
              <div className="text-blue-700">
                {monthlyData.reduce((prev, current) => 
                  current.submissions > prev.submissions ? current : prev
                ).month} ({
                  monthlyData.reduce((prev, current) => 
                    current.submissions > prev.submissions ? current : prev
                  ).submissions} submissions)
              </div>
            </div>
            <div className="bg-white bg-opacity-60 p-4 rounded-lg">
              <div className="font-medium text-blue-900 mb-2">Highest Revenue</div>
              <div className="text-blue-700">
                {monthlyData.reduce((prev, current) => 
                  current.revenue > prev.revenue ? current : prev
                ).month} ({
                  monthlyData.reduce((prev, current) => 
                    current.revenue > prev.revenue ? current : prev
                  ).revenue.toLocaleString()} ETB)
              </div>
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


