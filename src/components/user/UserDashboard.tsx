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

  const createLocalizedPath = (path: string) => 
    locale === 'en' ? path : `/${locale}${path}`;

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
                <span className="font-medium">$1 USD</span>
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