'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface ReferralPayoutRequest {
  referrer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    referral_code: string;
    total_earnings: number;
  };
  payout_amount: number;
  referral_count: number;
  payout_status: string;
  requested_at: string;
  processed_at?: string;
  notes?: string;
  referrals: Array<{
    id: string;
    referred_user: {
      name: string;
      email: string;
    };
    form_tracking_id: string;
    reward_amount: number;
    reward_status: string;
  }>;
}

interface ReferralPayoutManagerProps {
  locale: string;
}

const ReferralPayoutManager: React.FC<ReferralPayoutManagerProps> = ({ locale }) => {
  const [requests, setRequests] = useState<ReferralPayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('requested');
  const [selectedRequest, setSelectedRequest] = useState<ReferralPayoutRequest | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchPayoutRequests();
  }, [statusFilter]);

  const fetchPayoutRequests = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/referrals?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.data.payout_requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch payout requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayout = async (referrerId: string, action: 'approve' | 'reject') => {
    if (!referrerId) return;

    setProcessingId(referrerId);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/referrals/payout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          referrer_id: referrerId,
          action,
          notes
        })
      });

      if (response.ok) {
        await fetchPayoutRequests();
        setSelectedRequest(null);
        setNotes('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to process payout');
      }
    } catch (error) {
      console.error('Payout processing error:', error);
      alert('Failed to process payout');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-green-600" />
              Referral Payout Management
            </h2>
            <p className="text-gray-600 mt-1">Review and process referral payout requests</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="requested">Pending Requests</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Payout Requests List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No payout requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payout Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.referrer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.referrer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.referrer.email}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {request.referrer.referral_code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        {request.payout_amount} ETB
                      </div>
                      <div className="text-xs text-gray-500">
                        Total: {request.referrer.total_earnings} ETB
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.referral_count} referrals
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.payout_status)}`}>
                        {request.payout_status === 'requested' && <Clock className="w-3 h-3 mr-1" />}
                        {request.payout_status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {request.payout_status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                        {request.payout_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.payout_status === 'requested' ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Review
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            View
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payout Request Details
            </h3>

            {/* Referrer Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium">{selectedRequest.referrer.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{selectedRequest.referrer.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Referral Code</p>
                  <p className="font-mono font-medium">{selectedRequest.referrer.referral_code}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Earnings</p>
                  <p className="font-medium text-green-600">{selectedRequest.referrer.total_earnings} ETB</p>
                </div>
              </div>
            </div>

            {/* Payout Details */}
            <div className="mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Payout Amount</p>
                    <p className="text-2xl font-bold text-green-600">{selectedRequest.payout_amount} ETB</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Referrals</p>
                    <p className="text-xl font-bold text-gray-900">{selectedRequest.referral_count}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral List */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Referred Users</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedRequest.referrals.map((ref) => (
                  <div key={ref.id} className="bg-gray-50 rounded p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{ref.referred_user.name}</p>
                        <p className="text-gray-600">{ref.referred_user.email}</p>
                        <p className="text-xs text-gray-500 font-mono">{ref.form_tracking_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{ref.reward_amount} ETB</p>
                        <p className="text-xs text-gray-500">{ref.reward_status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedRequest.payout_status === 'requested' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this payout..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                />
              </div>
            )}

            {selectedRequest.notes && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 mb-1">Processing Notes</p>
                <p className="text-sm text-blue-800">{selectedRequest.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setNotes('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              {selectedRequest.payout_status === 'requested' && (
                <>
                  <button
                    onClick={() => handleProcessPayout(selectedRequest.referrer.id, 'reject')}
                    disabled={processingId === selectedRequest.referrer.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleProcessPayout(selectedRequest.referrer.id, 'approve')}
                    disabled={processingId === selectedRequest.referrer.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === selectedRequest.referrer.id ? 'Processing...' : 'Approve & Pay'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralPayoutManager;

