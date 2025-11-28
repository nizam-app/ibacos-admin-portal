// src/pages/dispatcher/PaymentsView.jsx
import { useState } from 'react';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  FileText,
  AlertCircle,
  TrendingUp,
  Calendar,
  Filter,
} from 'lucide-react';
import { PaymentVerificationModal } from './PaymentVerificationModal';

export function PaymentsView({ workOrders, technicians, onVerifyPayment, onRejectPayment }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const getTechnicianName = (techId) => {
    return technicians.find((t) => t.id === techId)?.name || techId;
  };

  const completedWorkOrders = workOrders.filter((wo) => wo.status === 'Completed');

  const filteredWorkOrders = completedWorkOrders.filter((wo) => {
    const matchesSearch =
      wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTechnicianName(wo.assignedTechnician).toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;

    const paymentStatus = wo.paymentRecord?.paymentStatus || 'Pending';
    if (filterStatus === 'pending') return paymentStatus === 'Pending';
    if (filterStatus === 'uploaded') return paymentStatus === 'Proof Uploaded';
    if (filterStatus === 'verified') return paymentStatus === 'Verified';
    if (filterStatus === 'rejected') return paymentStatus === 'Rejected';

    return true;
  });

  const stats = {
    pending: completedWorkOrders.filter(
      (wo) => !wo.paymentRecord || wo.paymentRecord.paymentStatus === 'Pending',
    ).length,
    uploaded: completedWorkOrders.filter(
      (wo) => wo.paymentRecord?.paymentStatus === 'Proof Uploaded',
    ).length,
    verified: completedWorkOrders.filter(
      (wo) => wo.paymentRecord?.paymentStatus === 'Verified',
    ).length,
    rejected: completedWorkOrders.filter(
      (wo) => wo.paymentRecord?.paymentStatus === 'Rejected',
    ).length,
  };

  const totalCommissions = completedWorkOrders
    .filter((wo) => wo.paymentRecord?.paymentStatus === 'Verified')
    .reduce((sum, wo) => sum + (wo.paymentRecord?.commissionAmount || 0), 0);

  const getStatusBadge = (status) => {
    const base =
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white';
    switch (status) {
      case 'Pending':
        return <span className={`${base} bg-gray-500`}>Pending Upload</span>;
      case 'Proof Uploaded':
        return <span className={`${base} bg-yellow-500`}>Awaiting Verification</span>;
      case 'Verified':
        return <span className={`${base} bg-green-500`}>Verified</span>;
      case 'Rejected':
        return <span className={`${base} bg-red-500`}>Rejected</span>;
      default:
        return <span className={`${base} bg-gray-500`}>Pending Upload</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Payment Management</h2>
        <p className="text-sm text-gray-600">
          Verify payment proofs and manage commissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Pending Upload */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Upload</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Awaiting Verification */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Awaiting Verification</p>
              <p className="mt-1 text-xl font-semibold text-yellow-600">
                {stats.uploaded}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Verified */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="mt-1 text-xl font-semibold text-green-600">{stats.verified}</p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="mt-1 text-xl font-semibold text-red-600">{stats.rejected}</p>
            </div>
            <div className="rounded-lg bg-red-100 p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Total Commissions */}
      <div className="rounded-xl bg-gradient-to-r from-[#c20001] to-[#ffb111] p-6 shadow-sm">
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-sm text-white/90">Total Commissions (Verified)</p>
            <p className="mt-1 text-2xl font-semibold">
              ${totalCommissions.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-white/20 p-3">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 bg-white px-10 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-[#c20001] focus:ring-1 focus:ring-[#c20001]"
            placeholder="Search by work order, customer, or technician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full md:w-64">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              className="w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 shadow-sm outline-none focus:border-[#c20001] focus:ring-1 focus:ring-[#c20001]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">
                All Payments ({completedWorkOrders.length})
              </option>
              <option value="pending">Pending Upload ({stats.pending})</option>
              <option value="uploaded">
                Awaiting Verification ({stats.uploaded})
              </option>
              <option value="verified">Verified ({stats.verified})</option>
              <option value="rejected">Rejected ({stats.rejected})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Completed Work Orders
          </h3>
        </div>
        <div className="px-6 py-5">
          {filteredWorkOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm font-medium">No completed work orders found</p>
              <p className="mt-1 text-xs">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Work orders will appear here once completed'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorkOrders.map((wo) => {
                const paymentStatus = wo.paymentRecord?.paymentStatus || 'Pending';
                const needsAttention = paymentStatus === 'Proof Uploaded';

                return (
                  <div
                    key={wo.id}
                    className={`rounded-lg border p-4 transition-all ${
                      needsAttention
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm font-semibold text-[#c20001]">
                            {wo.id}
                          </span>
                          {getStatusBadge(paymentStatus)}
                          {needsAttention && (
                            <span className="inline-flex items-center rounded-full bg-[#ffb111] px-2.5 py-0.5 text-xs font-medium text-gray-900">
                              Action Required
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <p className="text-xs text-gray-600">Customer</p>
                            <p className="text-sm text-gray-900">{wo.customerName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Technician</p>
                            <p className="text-sm text-gray-900">
                              {getTechnicianName(wo.assignedTechnician)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Category</p>
                            <p className="text-sm text-gray-900">{wo.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Completed</p>
                            <p className="flex items-center gap-1 text-sm text-gray-900">
                              <Calendar className="h-3 w-3" />
                              {wo.completionDate || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {wo.paymentRecord?.paymentProof && (
                          <div className="mt-2 flex flex-wrap items-center gap-4 border-t pt-2 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span className="text-xs text-gray-600">Amount:</span>
                              <span className="text-sm">
                                ${wo.paymentRecord.paymentProof.amount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Method:</span>
                              <span className="text-sm">
                                {wo.paymentRecord.paymentProof.paymentMethod}
                              </span>
                            </div>
                            {wo.paymentRecord.commissionAmount && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Commission:</span>
                                <span className="text-sm text-green-600">
                                  ${wo.paymentRecord.commissionAmount.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {wo.paymentRecord?.rejectionReason && (
                          <div className="mt-2 rounded-md border border-red-200 bg-red-100 p-2 text-xs text-red-700">
                            <span className="font-medium">Rejection: </span>
                            {wo.paymentRecord.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Right actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedWorkOrder(wo)}
                          className={`rounded-[10px] px-4 py-2.5 text-sm font-medium ${
                            needsAttention
                              ? 'bg-[#c20001] text-white hover:bg-[#c20001]/90'
                              : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                          }`}
                        >
                          {paymentStatus === 'Pending'
                            ? 'View Details'
                            : paymentStatus === 'Proof Uploaded'
                            ? 'Verify Now'
                            : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment Verification Modal */}
      {selectedWorkOrder &&
        selectedWorkOrder.paymentRecord &&
        (() => {
          const tech = technicians.find(
            (t) => t.id === selectedWorkOrder.assignedTechnician,
          );
          const techRate =
            tech?.employmentType === 'Freelancer'
              ? tech?.commissionRate
              : tech?.bonusRate;

          return (
            <PaymentVerificationModal
              isOpen={!!selectedWorkOrder}
              onClose={() => setSelectedWorkOrder(null)}
              workOrderId={selectedWorkOrder.id}
              customerName={selectedWorkOrder.customerName}
              technicianName={getTechnicianName(selectedWorkOrder.assignedTechnician)}
              technicianType={tech?.employmentType}
              technicianRate={techRate}
              paymentRecord={selectedWorkOrder.paymentRecord}
              onVerify={(commission) => {
                onVerifyPayment(selectedWorkOrder.id, commission);
                setSelectedWorkOrder(null);
              }}
              onReject={(reason) => {
                onRejectPayment(selectedWorkOrder.id, reason);
                setSelectedWorkOrder(null);
              }}
            />
          );
        })()}
    </div>
  );
}
