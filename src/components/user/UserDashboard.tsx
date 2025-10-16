'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { cn, formatDate } from '@/lib/utils';

interface UserStats {
  total_submissions: number;
  completed_submissions: number;
  pending_submissions: number;
  failed_submissions: number;
  last_submission_date?: string;
}

interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  remaining_limit: number;
  referrals: Array<{
    id: string;
    referred_user: {
      name: string;
      email: string;
    };
    form_status: string;
    tracking_id: string;
    reward_amount: number;
    reward_status: string;
    created_at: string;
  }>;
}

interface UserDashboardProps {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  stats: UserStats;
  locale: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, stats, locale }) => {
  const t = useTranslations();
  const [referralStats, setReferralStats] = React.useState<ReferralStats | null>(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = React.useState(true);
  const [payoutLoading, setPayoutLoading] = React.useState(false);
  const [payoutMessage, setPayoutMessage] = React.useState<{type: 'success' | 'error', text: string} | null>(null);

  const createLocalizedPath = (path: string) => 
    locale === 'en' ? path : `/${locale}${path}`;

  // Fetch referral stats
  React.useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        const response = await fetch('/api/user/referrals', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setReferralStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch referral stats:', error);
      } finally {
        setIsLoadingReferrals(false);
      }
    };

    fetchReferralStats();
  }, []);

  const handleRequestPayout = async () => {
    if (!referralStats || referralStats.total_earnings <= 0) {
      setPayoutMessage({ type: 'error', text: 'No earnings available for payout' });
      return;
    }

    setPayoutLoading(true);
    setPayoutMessage(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const response = await fetch('/api/user/referrals/request-payout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setPayoutMessage({ 
          type: 'success', 
          text: `Payout request submitted! Amount: ${data.data.payout_amount} ETB` 
        });
        // Refresh referral stats
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setPayoutMessage({ type: 'error', text: data.error || 'Failed to request payout' });
      }
    } catch (error) {
      console.error('Payout request error:', error);
      setPayoutMessage({ type: 'error', text: 'Failed to request payout' });
    } finally {
      setPayoutLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.total_submissions,
      icon: '📋',
      color: 'border-blue-200 bg-blue-50',
      textColor: 'text-blue-800'
    },
    {
      title: 'Completed',
      value: stats.completed_submissions,
      icon: '✅',
      color: 'border-green-200 bg-green-50',
      textColor: 'text-green-800'
    },
    {
      title: 'In Progress',
      value: stats.pending_submissions,
      icon: '⏳',
      color: 'border-yellow-200 bg-yellow-50',
      textColor: 'text-yellow-800'
    },
    {
      title: 'Failed',
      value: stats.failed_submissions,
      icon: '❌',
      color: 'border-red-200 bg-red-50',
      textColor: 'text-red-800'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.first_name}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your DV lottery applications and track their progress
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-semibold mb-2">
                🎯 Ready for DV-2026?
              </h2>
              <p className="text-primary-100">
                Start your new DV lottery application now. Only $1 USD per application.
              </p>
            </div>
            <Link href={createLocalizedPath('/apply')}>
              <Button 
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold"
              >
                Start New Application
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div 
            key={index}
            className={cn('rounded-lg border p-6', card.color)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm font-medium', card.textColor)}>
                  {card.title}
                </p>
                <p className={cn('text-3xl font-bold', card.textColor)}>
                  {card.value}
                </p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                📝 Recent Applications
              </h3>
              <Link 
                href={createLocalizedPath('/history')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {stats.total_submissions === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No applications yet
                </h4>
                <p className="text-gray-600 mb-6">
                  Start your first DV lottery application to get closer to your American dream!
                </p>
                <Link href={createLocalizedPath('/apply')}>
                  <Button>
                    Create First Application
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        Latest Application
                      </p>
                      <p className="text-sm text-gray-600">
                        {stats.last_submission_date 
                          ? formatDate(new Date(stats.last_submission_date))
                          : 'No submissions yet'
                        }
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links & Info */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              👤 Account Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{user.first_name} {user.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since:</span>
                <span className="font-medium">2024</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href={createLocalizedPath('/profile')}>
                <Button variant="outline" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⚡ Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href={createLocalizedPath('/apply')}>
                <Button className="w-full" size="sm">
                  🎯 New Application
                </Button>
              </Link>
              <Link href={createLocalizedPath('/history')}>
                <Button variant="outline" className="w-full" size="sm">
                  📋 View History
                </Button>
              </Link>
              <Link href={createLocalizedPath('/help')}>
                <Button variant="outline" className="w-full" size="sm">
                  ❓ Get Help
                </Button>
              </Link>
            </div>
          </div>

          {/* Referral Stats */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              💰 Referral Earnings
            </h3>
            {isLoadingReferrals ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : referralStats ? (
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-gray-600 mb-1">Your Referral Code</div>
                  <div className="text-lg font-bold text-green-900 font-mono">
                    {referralStats.referral_code}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex justify-between">
                    <span>Total Referrals:</span>
                    <span className="font-medium">{referralStats.total_referrals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Earnings:</span>
                    <span className="font-medium">{referralStats.total_earnings} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="font-medium text-yellow-700">{referralStats.pending_earnings} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid:</span>
                    <span className="font-medium text-green-700">{referralStats.paid_earnings} ETB</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Limit Remaining:</span>
                    <span>{referralStats.remaining_limit} ETB / 10,000 ETB</span>
                  </div>
                </div>
                
                {payoutMessage && (
                  <div className={`p-3 rounded-lg ${
                    payoutMessage.type === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {payoutMessage.text}
                  </div>
                )}
                
                {referralStats.total_earnings > 0 && (
                  <button
                    onClick={handleRequestPayout}
                    disabled={payoutLoading}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {payoutLoading ? 'Processing...' : 'Request Payout'}
                  </button>
                )}
                
                {referralStats.referrals.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="text-xs font-medium text-green-900 mb-2">Recent Referrals</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {referralStats.referrals.slice(0, 5).map(ref => (
                        <div key={ref.id} className="text-xs bg-white rounded p-2 border border-green-100">
                          <div className="font-medium text-gray-900">{ref.referred_user.name}</div>
                          <div className="text-gray-600 flex justify-between">
                            <span>{ref.reward_amount} ETB</span>
                            <span className={cn(
                              'font-medium',
                              ref.reward_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                            )}>
                              {ref.reward_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-green-800">
                Failed to load referral stats
              </div>
            )}
          </div>

          {/* DV Program Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              📊 DV Program 2026
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Registration Period:</span>
                <span className="font-medium">Oct 2024 - Nov 2024</span>
              </div>
              <div className="flex justify-between">
                <span>Results Available:</span>
                <span className="font-medium">May 2025</span>
              </div>
              <div className="flex justify-between">
                <span>Application Fee:</span>
                <span className="font-medium">300 ETB</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-700">
                💡 Tip: Submit early to avoid last-minute rush!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;