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

// ------------------------------------------------------------------
// Payment verification modal (ADMIN) – API ভিত্তিক
// ------------------------------------------------------------------
const PaymentVerificationModal = ({
  isOpen,
  onClose,
  payment,
  onVerified,
  onRejected,
}) => {
  const [action, setAction] = useState(null); // 'verify' | 'reject'
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !payment) return null;

  const stop = (e) => e.stopPropagation();

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (action === "verify") {
        await PaymentsAPI.verifyPayment(payment.id, {});
        Swal.fire({
          icon: "success",
          title: "Payment verified",
          text: "Payment has been marked as VERIFIED.",
          confirmButtonColor: "#c20001",
        });
        onVerified(payment.id);
      } else if (action === "reject") {
        if (!reason.trim()) {
          Swal.fire({
            icon: "warning",
            title: "Rejection reason required",
            text: "Please provide a reason for rejecting this payment.",
            confirmButtonColor: "#c20001",
          });
          return;
        }
        await PaymentsAPI.rejectPayment(payment.id, { rejectedReason: reason });
        Swal.fire({
          icon: "info",
          title: "Payment rejected",
          text: "Technician will be asked to re-upload a clear proof.",
          confirmButtonColor: "#c20001",
        });
        onRejected(payment.id, reason);
      }

      handleClose();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Action failed",
        text:
          err?.response?.data?.message ||
          "Unable to update payment. Please try again.",
        confirmButtonColor: "#c20001",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAction(null);
    setReason("");
    onClose();
  };

  const status = payment.status; // PENDING_VERIFICATION | VERIFIED | REJECTED
  const wo = payment.workOrder;
  const tech = payment.technician;
  const customerName = wo?.customer?.name || "Unknown customer";

  const imageUrl = payment.proofUrl
    ? `${process.env.REACT_APP_API_BASE_URL || ""}${payment.proofUrl}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={stop}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Verification
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review payment proof for{" "}
            <span className="font-medium text-[#c20001]">
              {wo?.woNumber || `WO-${payment.woId}`}
            </span>
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          {/* Basic info */}
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-[#c20001]">
                  {wo?.woNumber || `WO-${payment.woId}`}
                </span>
                <p className="text-xs text-gray-500">
                  Payment ID: {payment.id}
                </p>
              </div>
              <Badge
                className={
                  status === "PENDING_VERIFICATION"
                    ? "bg-yellow-500 text-white"
                    : status === "VERIFIED"
                    ? "bg-green-500 text-white"
                    : status === "REJECTED"
                    ? "bg-red-500 text-white"
                    : "bg-gray-500 text-white"
                }
              >
                {status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-600">Customer</p>
                <p className="text-gray-900">{customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Technician</p>
                <p className="text-gray-900">{tech?.name || "Unknown"}</p>
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#c20001]">
              Payment Details
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <CircleDollarSign className="mt-0.5 h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Amount</p>
                  <p className="text-gray-900">
                    {payment.amount != null ? `${payment.amount} KES` : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CreditCard className="mt-0.5 h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Method</p>
                  <p className="text-gray-900">{payment.method || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="mt-0.5 h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Technician Phone</p>
                  <p className="text-gray-900">{tech?.phone || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Created At</p>
                  <p className="text-gray-900">
                    {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Proof image */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <ImageIcon className="h-4 w-4" />
                Payment Proof
              </label>
              {imageUrl ? (
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-white">
                    <img
                      src={imageUrl}
                      alt="Payment Proof"
                      className="max-h-full max-w-full rounded-lg object-contain"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No proof image uploaded.
                </p>
              )}
            </div>

            {/* Existing rejection info */}
            {status === "REJECTED" && payment.rejectedReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">
                      Previous Rejection Reason
                    </p>
                    <p className="mt-1 text-red-700">
                      {payment.rejectedReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verified info */}
            {status === "VERIFIED" && payment.verifiedBy && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">
                      Payment already verified
                    </p>
                    <p className="mt-1 text-green-700 text-xs">
                      Verified by {payment.verifiedBy.name} on{" "}
                      {payment.verifiedAt
                        ? new Date(payment.verifiedAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action section – only when pending verification */}
          {status === "PENDING_VERIFICATION" && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <label className="text-sm font-medium text-gray-700">
                Verification Action
              </label>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAction("verify")}
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition ${
                    action === "verify"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Verify Payment
                </button>
                <button
                  type="button"
                  onClick={() => setAction("reject")}
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition ${
                    action === "reject"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Reject Payment
                </button>
              </div>

              {action === "verify" && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <p>• Payment will be marked as VERIFIED.</p>
                  <p>• Technician commissions/bonuses will be handled by backend.</p>
                </div>
              )}

              {action === "reject" && (
                <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div>
                    <label
                      htmlFor="reason"
                      className="text-sm font-medium text-gray-700"
                    >
                      Rejection Reason *
                    </label>
                    <textarea
                      id="reason"
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain why you are rejecting this payment proof..."
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                    />
                  </div>
                  <div>
                    <p>• Technician must re-upload a clear receipt.</p>
                    <p>• Work order will remain pending payment.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-3">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Close
          </button>
          {status === "PENDING_VERIFICATION" && action && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
                action === "verify"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading
                ? "Please wait..."
                : action === "verify"
                ? "Confirm Verification"
                : "Confirm Rejection"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// MAIN: AdminPaymentsPage – API integrated
// ------------------------------------------------------------------
const AdminPaymentsPage = () => {
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

  // initial load
  useEffect(() => {
    fetchStats();
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
          Payment Management (Admin)
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
              Total Commissions (from backend)
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {stats.totalCommissions} KES
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
                All Payments ({pagination.total || filteredPayments.length})
              </option>
              <option value="PENDING_VERIFICATION">
                Awaiting Verification ({stats.awaitingVerification})
              </option>
              <option value="VERIFIED">Verified ({stats.verified})</option>
              <option value="REJECTED">Rejected ({stats.rejected})</option>
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
                    className={`rounded-lg border p-4 transition-all ${
                      needsAttention
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
                              {p.amount != null ? `${p.amount} KES` : "-"}
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
                          className={`rounded-[10px] px-4 py-2.5 text-sm font-medium shadow-sm ${
                            needsAttention
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
