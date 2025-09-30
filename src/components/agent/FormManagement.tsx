'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { FormSubmissionSummary } from '@/types/agent';
import { cn, formatDate } from '@/lib/utils';

interface FormManagementProps {
  forms: FormSubmissionSummary[];
  onFormAction: (formId: string, action: 'view' | 'download' | 'resend') => void;
}

const FormManagement: React.FC<FormManagementProps> = ({ forms, onFormAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submission_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
    { value: 'status', label: 'Status' },
    { value: 'cost', label: 'Cost' }
  ];

  const filteredAndSortedForms = forms
    .filter(form => {
      const matchesSearch = form.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           form.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof FormSubmissionSummary];
      let bValue: any = b[sortBy as keyof FormSubmissionSummary];

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
      draft: { color: 'bg-gray-100 text-gray-800', icon: '📝' },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: '📤' },
      processing: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      completed: { color: 'bg-green-100 text-green-800', icon: '✅' },
      failed: { color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.color)}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      paid: { color: 'bg-green-100 text-green-800', icon: '✅' },
      failed: { color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.color)}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusSummary = () => {
    const summary = forms.reduce((acc, form) => {
      acc[form.status] = (acc[form.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return summary;
  };

  const statusSummary = getStatusSummary();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or reference..."
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
              {sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending'}
            </Button>
          </div>
        </div>
      </div>

      {/* Forms Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Form Submissions ({filteredAndSortedForms.length})
          </h3>
        </div>

        {filteredAndSortedForms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'You haven\'t submitted any forms yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedForms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {form.applicant_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(form.submission_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(form.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(form.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {form.cost} ETB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {form.reference_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onFormAction(form.id, 'view')}
                        >
                          View
                        </Button>
                        
                        {form.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onFormAction(form.id, 'download')}
                          >
                            Download
                          </Button>
                        )}
                        
                        {(form.status === 'failed' || form.payment_status === 'failed') && (
                          <Button
                            size="sm"
                            onClick={() => onFormAction(form.id, 'resend')}
                          >
                            Retry
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

      {/* Bulk Actions */}
      {filteredAndSortedForms.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Bulk Actions</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              📧 Send Notifications
            </Button>
            <Button variant="outline" size="sm">
              📊 Export Data
            </Button>
            <Button variant="outline" size="sm">
              🔄 Retry Failed
            </Button>
            <Button variant="outline" size="sm">
              💳 Check Payments
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-4">📊 Quick Statistics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Success Rate:</span>
            <span className="font-bold text-blue-900 ml-2">
              {forms.length > 0 ? Math.round((statusSummary.completed || 0) / forms.length * 100) : 0}%
            </span>
          </div>
          <div>
            <span className="text-blue-700">Total Revenue:</span>
            <span className="font-bold text-blue-900 ml-2">
              {forms.reduce((sum, form) => sum + form.cost, 0)} ETB
            </span>
          </div>
          <div>
            <span className="text-blue-700">Avg Processing Time:</span>
            <span className="font-bold text-blue-900 ml-2">2.5 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormManagement;