// src/pages/admin/AdminPaymentsPage.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CircleDollarSign,
  Calendar,
  FileText,
  User,
  CreditCard,
  Image as ImageIcon,
} from "lucide-react";
import PaymentsAPI from "../../api/paymentsApi";

// ------------------------------------------------------------------
// Small badge component
// ------------------------------------------------------------------
const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

import PaymentVerificationModal from '../../components/PaymentVerificationModal'

// ------------------------------------------------------------------
// Payment verification modal (ADMIN) – API ভিত্তিক
// ------------------------------------------------------------------


// ------------------------------------------------------------------
// MAIN: AdminPaymentsPage – API integrated
// ------------------------------------------------------------------
const AdminPaymentsPage = () => {

  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    PENDING_VERIFICATION: 0,
    VERIFIED: 0,
    REJECTED: 0,
  });
  const [stats, setStats] = useState({
    pendingUpload: 0,
    awaitingVerification: 0,
    verified: 0,
    rejected: 0,
    totalCommissions: 0,
  });

  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [filterStatus, setFilterStatus] = useState("all"); // all | PENDING_VERIFICATION | VERIFIED | REJECTED
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);

  // ---- Load stats ----
  const fetchStats = async () => {
    try {
      const res = await PaymentsAPI.getPaymentStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  // ---- Load payments ----
  const fetchPayments = async (page = 1, currentStatus = filterStatus) => {
    try {
      setLoading(true);
      const params = { page, limit: pagination.limit };

      if (currentStatus !== "all") {
        params.status = currentStatus; // backend: PENDING_VERIFICATION / VERIFIED / REJECTED
      }

      const res = await PaymentsAPI.getPayments(params);
      setPayments(res.data.payments || []);
      setPagination(res.data.pagination || pagination);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed to load payments",
        text:
          err?.response?.data?.message ||
          "Please check your connection or try again.",
        confirmButtonColor: "#c20001",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const [allRes, pendingRes, verifiedRes, rejectedRes] = await Promise.all([
        PaymentsAPI.getPayments({ page: 1, limit: 1 }),
        PaymentsAPI.getPayments({ page: 1, limit: 1, status: "PENDING_VERIFICATION" }),
        PaymentsAPI.getPayments({ page: 1, limit: 1, status: "VERIFIED" }),
        PaymentsAPI.getPayments({ page: 1, limit: 1, status: "REJECTED" }),
      ]);

      setStatusCounts({
        all: allRes.data?.pagination?.total ?? 0,
        PENDING_VERIFICATION: pendingRes.data?.pagination?.total ?? 0,
        VERIFIED: verifiedRes.data?.pagination?.total ?? 0,
        REJECTED: rejectedRes.data?.pagination?.total ?? 0,
      });
    } catch (err) {
      console.error("Failed to load status counts", err);
    }
  };


  const handlePageChange = (newPage) => {
    fetchPayments(newPage, filterStatus);
  };


  // initial load
  useEffect(() => {
    fetchStats();
    fetchStatusCounts();
    fetchPayments(1, filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when filter changes
  useEffect(() => {
    fetchPayments(1, filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  // local update after verify
  const handleLocalVerified = (paymentId) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
            ...p,
            status: "VERIFIED",
            rejectedReason: null,
          }
          : p
      )
    );
    fetchStats();
    fetchStatusCounts();
  };

  // local update after reject
  const handleLocalRejected = (paymentId, reason) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
            ...p,
            status: "REJECTED",
            rejectedReason: reason,
          }
          : p
      )
    );
    fetchStats();
    fetchStatusCounts();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING_VERIFICATION":
        return (
          <Badge className="bg-yellow-500 text-white">
            Awaiting Verification
          </Badge>
        );
      case "VERIFIED":
        return <Badge className="bg-green-500 text-white">Verified</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  // simple client-side search over woNumber / customer / technician
  const filteredPayments = payments.filter((p) => {
    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase();
    const woNumber = p.workOrder?.woNumber?.toLowerCase() || "";
    const customerName = p.workOrder?.customer?.name?.toLowerCase() || "";
    const techName = p.technician?.name?.toLowerCase() || "";

    return (
      woNumber.includes(q) ||
      customerName.includes(q) ||
      techName.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Payment Management
        </h2>
        <p className="text-sm text-gray-600">
          View all technician payments, verify proofs and manage payouts.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Pending upload (stats only) */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Pending Upload</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {stats.pendingUpload}
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Awaiting verification */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Awaiting Verification</p>
              <p className="mt-1 text-lg font-semibold text-yellow-600">
                {stats.awaitingVerification}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Verified */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Verified</p>
              <p className="mt-1 text-lg font-semibold text-green-600">
                {stats.verified}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Rejected</p>
              <p className="mt-1 text-lg font-semibold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <div className="rounded-lg bg-red-100 p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Total commissions card */}
      <div className="rounded-xl bg-gradient-to-r from-[#c20001] to-[#ffb111] p-4 shadow-sm">
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-xs text-white/90">
              Total Commissions
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {stats.totalCommissions} MRU 
            </p>
          </div>
          <div className="rounded-lg bg-white/20 p-3">
            <CircleDollarSign className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by WO number, customer, or technician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
          />
        </div>

        <div className="w-full md:w-64">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
            >
              <option value="all">
                All Payments ({statusCounts.all})
              </option>
              <option value="PENDING_VERIFICATION">
                Awaiting Verification ({statusCounts.PENDING_VERIFICATION})
              </option>
              <option value="VERIFIED">
                Verified ({statusCounts.VERIFIED})
              </option>
              <option value="REJECTED">
                Rejected ({statusCounts.REJECTED})
              </option>

            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Payments</h3>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Loading payments...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p>No payments found</p>
              <p className="mt-1 text-sm">
                {searchTerm
                  ? "Try changing your search or filter."
                  : "Payments will appear here after technicians upload proof."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((p) => {
                const wo = p.workOrder;
                const tech = p.technician;
                const needsAttention = p.status === "PENDING_VERIFICATION";

                return (
                  <div
                    key={p.id}
                    className={`rounded-lg border p-4 transition-all ${needsAttention
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[#c20001]">
                            {wo?.woNumber || `WO-${p.woId}`}
                          </span>
                          {getStatusBadge(p.status)}
                          {needsAttention && (
                            <Badge className="bg-[#ffb111] text-gray-900">
                              Action Required
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <p className="text-xs text-gray-600">Customer</p>
                            <p className="text-gray-900">
                              {wo?.customer?.name || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Technician</p>
                            <p className="text-gray-900">
                              {tech?.name || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Amount</p>
                            <p className="text-gray-900">
                              {p.amount != null ? `${p.amount} MRU ` : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Created</p>
                            <p className="flex items-center gap-1 text-gray-900">
                              <Calendar className="h-3 w-3" />
                              {new Date(p.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {p.rejectedReason && (
                          <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                            <span className="font-medium">Rejection:</span>{" "}
                            {p.rejectedReason}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPayment(p)}
                          className={`rounded-[10px] px-4 py-2.5 text-sm font-medium shadow-sm ${needsAttention
                            ? "bg-[#c20001] text-white hover:bg-[#c20001]/90"
                            : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                            }`}
                        >
                          {p.status === "PENDING_VERIFICATION"
                            ? "Verify Now"
                            : "View Details"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Pagination Footer */}
        <div className="flex items-center justify-end gap-5 border-t border-gray-100 px-4 py-3 text-xs text-gray-600">
          <div>
            Page <span className="font-medium">{pagination.page}</span> of{" "}
            <span className="font-medium">{pagination.totalPages}</span> •{" "}
            <span className="font-medium">{pagination.total}</span> results
          </div>

          <div className="inline-flex items-center gap-2">
            <button
              className="rounded-md border border-gray-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page <= 1 || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Prev
            </button>

            <button
              className="rounded-md border border-gray-200 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Modal */}
      {selectedPayment && (
        <PaymentVerificationModal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          payment={selectedPayment}
          onVerified={handleLocalVerified}
          onRejected={handleLocalRejected}
        />
      )}
    </div>
  );
};

export default AdminPaymentsPage;
