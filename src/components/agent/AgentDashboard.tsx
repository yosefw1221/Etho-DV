'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { AgentStats, getNextTierProgress, AGENT_TIERS } from '@/types/agent';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AgentDashboardProps {
  stats: AgentStats;
  locale: string;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ stats, locale }) => {
  const t = useTranslations();
  
  const tierProgress = getNextTierProgress(stats.total_submissions);
  const createLocalizedPath = (path: string) => 
    locale === 'en' ? path : `/${locale}${path}`;

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  }> = ({ title, value, subtitle, icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      red: 'bg-red-50 border-red-200 text-red-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700'
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center border',
            colorClasses[color]
          )}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>
      </div>
    );
  };

  const TierBadge: React.FC<{ tier: string }> = ({ tier }) => {
    const tierColors = {
      bronze: 'bg-amber-100 text-amber-800 border-amber-200',
      silver: 'bg-gray-100 text-gray-800 border-gray-200',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    const tierIcons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇'
    };

    return (
      <span className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
        tierColors[tier as keyof typeof tierColors]
      )}>
        <span className="mr-1">{tierIcons[tier as keyof typeof tierIcons]}</span>
        {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Agent Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Here's your business overview and performance.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
            <Link href={createLocalizedPath('/agent/bulk-submit')}>
              <Button size="lg">
                📤 Bulk Submit
              </Button>
            </Link>
            <Link href={createLocalizedPath('/agent/forms')}>
              <Button variant="outline" size="lg">
                📋 View Forms
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tier Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Status</h2>
          <TierBadge tier={stats.current_tier} />
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Current Rate: {stats.discount_rate} ETB per form
              </span>
              {tierProgress.next && (
                <span className="text-sm text-gray-500">
                  {tierProgress.formsNeeded} forms to {tierProgress.next.name}
                </span>
              )}
            </div>
            
            {tierProgress.next && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${tierProgress.progress}%` }}
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {AGENT_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'p-4 border rounded-lg',
                  tier.name === stats.current_tier
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-gray-50'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <TierBadge tier={tier.name} />
                  <span className="text-lg font-bold text-gray-900">
                    {tier.rate_per_form} ETB
                  </span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-1">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Submissions"
          value={stats.total_submissions}
          subtitle="All time"
          icon="📊"
          color="blue"
        />
        <StatCard
          title="This Month"
          value={stats.this_month_submissions}
          subtitle="Current month"
          icon="📅"
          color="green"
        />
        <StatCard
          title="Success Rate"
          value={`${Math.round((stats.completed_submissions / Math.max(stats.total_submissions, 1)) * 100)}%`}
          subtitle={`${stats.completed_submissions} completed`}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.total_revenue, 'ETB')}
          subtitle="Earnings"
          icon="💰"
          color="purple"
        />
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Pending Review"
          value={stats.pending_submissions}
          subtitle="Being processed"
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Completed"
          value={stats.completed_submissions}
          subtitle="Successfully processed"
          icon="✅"
          color="green"
        />
        <StatCard
          title="Failed/Rejected"
          value={stats.failed_submissions}
          subtitle="Require attention"
          icon="❌"
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href={createLocalizedPath('/agent/bulk-submit')}>
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1">📤</span>
              <span className="text-sm font-medium">Bulk Submit</span>
            </Button>
          </Link>
          
          <Link href={createLocalizedPath('/apply')}>
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1">📝</span>
              <span className="text-sm font-medium">Single Form</span>
            </Button>
          </Link>
          
          <Link href={createLocalizedPath('/agent/forms')}>
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1">📋</span>
              <span className="text-sm font-medium">Manage Forms</span>
            </Button>
          </Link>
          
          <Link href={createLocalizedPath('/agent/analytics')}>
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1">📈</span>
              <span className="text-sm font-medium">Analytics</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Processing Time</h3>
            <p className="text-2xl font-bold text-primary-600 mb-1">
              {stats.avg_processing_time}h
            </p>
            <p className="text-sm text-gray-600">Average completion time</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Tier Benefits</h3>
            <div className="space-y-2">
              {AGENT_TIERS.find(t => t.name === stats.current_tier)?.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">
          📚 Getting Started Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-blue-900 mb-2">For New Agents</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Start with single form submissions</li>
              <li>• Use bulk upload for 10+ forms</li>
              <li>• Check form status regularly</li>
              <li>• Reach 11 forms for Silver tier</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Support</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>📧 agent-support@etho-dv.com</p>
              <p>📞 +251 911 234 567</p>
              <p>🕐 Mon-Fri: 9 AM - 6 PM (EAT)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;