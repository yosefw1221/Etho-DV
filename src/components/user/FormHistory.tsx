'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { cn, formatDate } from '@/lib/utils';

interface FormSubmission {
  id: string;
  reference_number?: string;
  applicant_name: string;
  submission_date: string;
  processing_status: 'draft' | 'submitted' | 'processing' | 'completed' | 'failed';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_amount: number;
  payment_currency: string;
  estimated_completion?: string;
  result_available?: boolean;
  dv_confirmation_number?: string;
}

interface FormHistoryProps {
  forms: FormSubmission[];
  onFormAction: (formId: string, action: 'view' | 'download' | 'retry' | 'pay') => void;
  locale: string;
}

const FormHistory: React.FC<FormHistoryProps> = ({ forms, onFormAction, locale }) => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submission_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const createLocalizedPath = (path: string) => 
    locale === 'en' ? path : `/${locale}${path}`;

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];

  const sortOptions = [
    { value: 'submission_date', label: 'Submission Date' },
    { value: 'applicant_name', label: 'Applicant Name' },
    { value: 'processing_status', label: 'Status' }
  ];

  const filteredAndSortedForms = forms
    .filter(form => {
      const matchesSearch = form.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           form.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           form.dv_confirmation_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || form.processing_status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof FormSubmission];
      let bValue: any = b[sortBy as keyof FormSubmission];

      if (sortBy === 'submission_date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: '📝', label: 'Draft' },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: '📤', label: 'Submitted' },
      processing: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', icon: '❌', label: 'Failed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.color)}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Pending' },
      paid: { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', icon: '❌', label: 'Failed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.color)}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getStatusSummary = () => {
    const summary = forms.reduce((acc, form) => {
      acc[form.processing_status] = (acc[form.processing_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return summary;
  };

  const statusSummary = getStatusSummary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application History</h1>
            <p className="mt-2 text-gray-600">
              Track the status of your DV lottery applications
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href={createLocalizedPath('/apply')}>
              <Button>
                🎯 New Application
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { key: 'draft', label: 'Draft', icon: '📝', color: 'border-gray-200' },
          { key: 'submitted', label: 'Submitted', icon: '📤', color: 'border-blue-200' },
          { key: 'processing', label: 'Processing', icon: '⏳', color: 'border-yellow-200' },
          { key: 'completed', label: 'Completed', icon: '✅', color: 'border-green-200' },
          { key: 'failed', label: 'Failed', icon: '❌', color: 'border-red-200' }
        ].map((item) => (
          <div key={item.key} className={cn('bg-white border rounded-lg p-4', item.color)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">{statusSummary[item.key] || 0}</p>
              </div>
              <span className="text-2xl">{item.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, reference, or confirmation..."
          />
          
          <Select
            label="Status Filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          
          <Select
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={sortOptions}
          />
          
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full"
            >
              {sortOrder === 'desc' ? '↓ Newest First' : '↑ Oldest First'}
            </Button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredAndSortedForms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {forms.length === 0 ? 'No applications yet' : 'No applications found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {forms.length === 0 
                ? 'Start your DV lottery journey by creating your first application!'
                : 'Try adjusting your search or filters'
              }
            </p>
            {forms.length === 0 && (
              <Link href={createLocalizedPath('/apply')}>
                <Button>
                  Create First Application
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference Numbers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedForms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {form.applicant_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Submitted: {formatDate(form.submission_date)}
                        </div>
                        {form.estimated_completion && (
                          <div className="text-sm text-blue-600">
                            Est. completion: {formatDate(form.estimated_completion)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getStatusBadge(form.processing_status)}
                        {form.result_available && (
                          <div className="text-xs text-green-600 font-medium">
                            🎉 Results Available!
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getPaymentStatusBadge(form.payment_status)}
                        <div className="text-xs text-gray-500">
                          {form.payment_amount} {form.payment_currency}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        {form.reference_number && (
                          <div>
                            <span className="text-gray-500">Ref:</span>
                            <span className="font-mono ml-1">{form.reference_number}</span>
                          </div>
                        )}
                        {form.dv_confirmation_number && (
                          <div>
                            <span className="text-gray-500">DV:</span>
                            <span className="font-mono ml-1 text-green-600">{form.dv_confirmation_number}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onFormAction(form.id, 'view')}
                          className="text-xs"
                        >
                          View Details
                        </Button>
                        
                        {form.processing_status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onFormAction(form.id, 'download')}
                            className="text-xs"
                          >
                            📄 Download
                          </Button>
                        )}
                        
                        {form.payment_status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => onFormAction(form.id, 'pay')}
                            className="text-xs"
                          >
                            💳 Pay Now
                          </Button>
                        )}
                        
                        {(form.processing_status === 'failed' || form.payment_status === 'failed') && (
                          <Button
                            size="sm"
                            onClick={() => onFormAction(form.id, 'retry')}
                            className="text-xs"
                          >
                            🔄 Retry
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DV Program Timeline */}
      {forms.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📅 DV Program 2026 Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div>
                <p className="font-medium text-blue-900">Registration Period</p>
                <p className="text-blue-700">October 4 - November 7, 2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium text-blue-900">Results Available</p>
                <p className="text-blue-700">May 6, 2025</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-blue-900">Visa Processing</p>
                <p className="text-blue-700">October 2025 - September 2026</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormHistory;