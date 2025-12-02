// src/pages/dispatcher/DispatcherPayments.jsx
import { useState } from "react";
import Swal from "sweetalert2";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  AlertCircle,
  TrendingUp,
  Calendar,
  Filter,
  CreditCard,
  User,
  Image as ImageIcon,
} from "lucide-react";

// -------------------------------
// Mock JSON data (DISPATCHER VIEW)
// -------------------------------
const DISPATCHER_TECHNICIANS = [
  {
    id: "TECH001",
    name: "Mike Johnson",
    employmentType: "Freelancer",
    commissionRate: 10,
  },
  {
    id: "TECH002",
    name: "Sarah Davis",
    employmentType: "Freelancer",
    commissionRate: 12,
  },
  {
    id: "TECH003",
    name: "Robert Chen",
    employmentType: "Internal Employee",
    bonusRate: 5,
  },
];

const DISPATCHER_WORK_ORDERS = [
  {
    id: "WO-2024-001",
    srId: "SR-1001",
    customerName: "John Smith",
    category: "AC Service",
    status: "Completed",
    assignedTechnician: "TECH001",
    completionDate: "2024-11-30",
    paymentRecord: {
      paymentStatus: "Proof Uploaded", // Pending | Proof Uploaded | Verified | Rejected
      paymentProof: {
        amount: 320.5,
        paymentMethod: "Bank Transfer",
        uploadedBy: "Mike Johnson",
        uploadDate: "2024-11-30 17:45",
        proofImageUrl:
          "https://via.placeholder.com/600x350.png?text=Payment+Proof+Screenshot",
        notes: "Payment received from customer, attached bank transfer receipt.",
      },
      commissionAmount: null,
      rejectionReason: null,
    },
  },
  {
    id: "WO-2024-002",
    srId: "SR-1002",
    customerName: "Emily Clark",
    category: "Electrical Repair",
    status: "Completed",
    assignedTechnician: "TECH002",
    completionDate: "2024-11-29",
    paymentRecord: {
      paymentStatus: "Verified",
      paymentProof: {
        amount: 180.0,
        paymentMethod: "Cash",
        uploadedBy: "Sarah Davis",
        uploadDate: "2024-11-29 15:20",
        proofImageUrl:
          "https://via.placeholder.com/600x350.png?text=Cash+Receipt",
        notes: "Customer paid in cash, photo of signed receipt attached.",
      },
      commissionAmount: 21.6,
      rejectionReason: null,
    },
  },
  {
    id: "WO-2024-003",
    srId: "SR-1003",
    customerName: "Daniel Green",
    category: "Plumbing",
    status: "Completed",
    assignedTechnician: "TECH003",
    completionDate: "2024-11-28",
    paymentRecord: {
      paymentStatus: "Rejected",
      paymentProof: {
        amount: 150.0,
        paymentMethod: "Card",
        uploadedBy: "Robert Chen",
        uploadDate: "2024-11-28 19:10",
        proofImageUrl:
          "https://via.placeholder.com/600x350.png?text=Blurry+Receipt",
        notes: "Receipt is a bit blurry but readable.",
      },
      commissionAmount: null,
      rejectionReason: "Uploaded image is too blurry, please upload a clear copy.",
    },
  },
  {
    id: "WO-2024-004",
    srId: "SR-1004",
    customerName: "Sophia Lee",
    category: "AC Service",
    status: "Completed",
    assignedTechnician: "TECH001",
    completionDate: "2024-11-27",
    paymentRecord: null, // No payment proof yet
  },
];

// -------------------------------
// Small helper components
// -------------------------------
const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

// -------------------------------
// Payment Verification Modal (DISPATCHER)
// -------------------------------
function DispatcherPaymentVerificationModal({
  isOpen,
  onClose,
  workOrder,
  technician,
  onVerify,
  onReject,
}) {
  const [action, setAction] = useState(null); // 'verify' | 'reject'
  const [rejectionReason, setRejectionReason] = useState("");
  const paymentRecord = workOrder?.paymentRecord;

  if (!isOpen || !workOrder || !paymentRecord) return null;

  const technicianType =
    technician?.employmentType === "Freelancer"
      ? "Freelancer"
      : "Internal Employee";
  const rate =
    technician?.employmentType === "Freelancer"
      ? technician?.commissionRate || 0
      : technician?.bonusRate || 0;

  const paymentLabel = technicianType === "Freelancer" ? "Commission" : "Bonus";

  const amount = paymentRecord.paymentProof?.amount || 0;
  const calculatedAmount = (amount * rate) / 100;

  const handleSubmit = () => {
    if (action === "verify") {
      onVerify(calculatedAmount);
      Swal.fire({
        icon: "success",
        title: "Payment verified",
        text: `${paymentLabel} of $${calculatedAmount.toFixed(
          2
        )} has been booked for ${technician?.name || "technician"}.`,
        confirmButtonColor: "#c20001",
      });
      onClose();
    } else if (action === "reject") {
      if (!rejectionReason.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Rejection reason required",
          text: "Please explain why you are rejecting this payment proof.",
          confirmButtonColor: "#c20001",
        });
        return;
      }
      onReject(rejectionReason);
      Swal.fire({
        icon: "success",
        title: "Payment rejected",
        text: "Technician will be asked to upload a new payment proof.",
        confirmButtonColor: "#c20001",
      });
      onClose();
    }
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={stop}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Verification
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review payment proof and verify or reject payment for{" "}
            <span className="font-medium text-[#c20001]">{workOrder.id}</span>
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          {/* WO & status */}
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#c20001]">
                {workOrder.id}
              </span>
              <Badge
                className={
                  paymentRecord.paymentStatus === "Proof Uploaded"
                    ? "bg-yellow-500 text-white"
                    : paymentRecord.paymentStatus === "Verified"
                    ? "bg-green-500 text-white"
                    : paymentRecord.paymentStatus === "Rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-500 text-white"
                }
              >
                {paymentRecord.paymentStatus || "Pending"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-600">Customer</p>
                <p className="text-gray-900">{workOrder.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Technician</p>
                <p className="text-gray-900">
                  {technician?.name || workOrder.assignedTechnician}
                </p>
              </div>
            </div>
          </div>

          {/* Payment proof details */}
          {paymentRecord.paymentProof && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#c20001]">
                Payment Proof Details
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Uploaded By</p>
                    <p className="text-gray-900">
                      {paymentRecord.paymentProof.uploadedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Upload Date</p>
                    <p className="text-gray-900">
                      {paymentRecord.paymentProof.uploadDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Payment Method</p>
                    <p className="text-gray-900">
                      {paymentRecord.paymentProof.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="text-gray-900">
                      ${paymentRecord.paymentProof.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ImageIcon className="h-4 w-4" />
                  Payment Proof
                </label>
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-white">
                    <img
                      src={paymentRecord.paymentProof.proofImageUrl}
                      alt="Payment Proof"
                      className="max-h-full max-w-full rounded-lg object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              {paymentRecord.paymentProof.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Technician Notes
                  </label>
                  <div className="mt-1 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                    {paymentRecord.paymentProof.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* If rejected previously */}
          {paymentRecord.paymentStatus === "Rejected" &&
            paymentRecord.rejectionReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      Rejection Reason
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                      {paymentRecord.rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Auto-calculated commission summary */}
          {paymentRecord.paymentStatus === "Proof Uploaded" &&
            paymentRecord.paymentProof && (
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    {paymentLabel} Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Configured rate:</span>
                      <span className="text-gray-900">{rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Calculated {paymentLabel.toLowerCase()}:
                      </span>
                      <span className="text-gray-900">
                        ${calculatedAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-blue-300 pt-2 text-xs">
                      <span className="text-gray-600">Payment amount:</span>
                      <span className="text-gray-900">
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs italic text-gray-600">
                    Rates are preconfigured from technician settings and cannot
                    be changed here.
                  </p>
                </div>
              </div>
            )}

          {/* Action section */}
          {paymentRecord.paymentStatus === "Proof Uploaded" && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <label className="text-sm font-medium text-gray-700">
                Verification Action
              </label>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAction("verify")}
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition
                    ${
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
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition
                    ${
                      action === "reject"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                    }`}
                >
                  Reject Payment
                </button>
              </div>

              {action === "verify" && (
                <div className="space-y-1 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <p>• Payment will be marked as Verified</p>
                  <p>
                    • {paymentLabel} of ${calculatedAmount.toFixed(2)} will be
                    automatically booked
                  </p>
                  <p>• Technician will be notified</p>
                </div>
              )}

              {action === "reject" && (
                <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
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
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why the payment proof is being rejected..."
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                    />
                  </div>
                  <div className="text-sm text-red-700">
                    <p>• Technician must reupload clear payment proof</p>
                    <p>• Work order will remain in Completed status</p>
                    <p>• No commission will be booked until verified</p>
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
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Close
          </button>
          {paymentRecord.paymentStatus === "Proof Uploaded" && action && (
            <button
              type="button"
              onClick={handleSubmit}
              className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition
                ${
                  action === "verify"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
            >
              {action === "verify"
                ? technicianType === "Freelancer"
                  ? "Verify & Book Commission"
                  : "Verify & Book Bonus"
                : "Reject Payment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------
// MAIN PAGE – DISPATCHER PAYMENTS
// -------------------------------
export default function DispatcherPayments() {
  const [workOrders, setWorkOrders] = useState(DISPATCHER_WORK_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | pending | uploaded | verified | rejected
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const technicians = DISPATCHER_TECHNICIANS;

  const getTechnicianName = (techId) => {
    return technicians.find((t) => t.id === techId)?.name || techId;
  };

  const completedWorkOrders = workOrders.filter(
    (wo) => wo.status === "Completed"
  );

  const filteredWorkOrders = completedWorkOrders.filter((wo) => {
    const techName = getTechnicianName(wo.assignedTechnician);
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      wo.id.toLowerCase().includes(q) ||
      wo.customerName.toLowerCase().includes(q) ||
      techName.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    const paymentStatus = wo.paymentRecord?.paymentStatus || "Pending";

    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return paymentStatus === "Pending";
    if (filterStatus === "uploaded") return paymentStatus === "Proof Uploaded";
    if (filterStatus === "verified") return paymentStatus === "Verified";
    if (filterStatus === "rejected") return paymentStatus === "Rejected";

    return true;
  });

  const stats = {
    pending: completedWorkOrders.filter(
      (wo) => !wo.paymentRecord || wo.paymentRecord.paymentStatus === "Pending"
    ).length,
    uploaded: completedWorkOrders.filter(
      (wo) => wo.paymentRecord?.paymentStatus === "Proof Uploaded"
    ).length,
    verified: completedWorkOrders.filter(
      (wo) => wo.paymentRecord?.paymentStatus === "Verified"
    ).length,
    rejected: completedWorkOrders.filter(
      (wo) => wo.paymentRecord?.paymentStatus === "Rejected"
    ).length,
  };

  const totalCommissions = completedWorkOrders
    .filter((wo) => wo.paymentRecord?.paymentStatus === "Verified")
    .reduce(
      (sum, wo) => sum + (wo.paymentRecord?.commissionAmount || 0),
      0
    );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-gray-500 text-white">Pending Upload</Badge>;
      case "Proof Uploaded":
        return (
          <Badge className="bg-yellow-500 text-white">
            Awaiting Verification
          </Badge>
        );
      case "Verified":
        return <Badge className="bg-green-500 text-white">Verified</Badge>;
      case "Rejected":
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Pending Upload</Badge>;
    }
  };

  const handleVerifyPayment = (workOrderId, commissionAmount) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === workOrderId
          ? {
              ...wo,
              paymentRecord: {
                ...(wo.paymentRecord || {}),
                paymentStatus: "Verified",
                commissionAmount,
                rejectionReason: null,
              },
            }
          : wo
      )
    );
  };

  const handleRejectPayment = (workOrderId, reason) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === workOrderId
          ? {
              ...wo,
              paymentRecord: {
                ...(wo.paymentRecord || {}),
                paymentStatus: "Rejected",
                rejectionReason: reason,
              },
            }
          : wo
      )
    );
  };

  const openModal = (wo) => setSelectedWorkOrder(wo);
  const closeModal = () => setSelectedWorkOrder(null);

  const selectedTechnician =
    selectedWorkOrder &&
    technicians.find((t) => t.id === selectedWorkOrder.assignedTechnician);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Payment Management
        </h2>
        <p className="text-sm text-gray-600">
          Verify payment proofs and manage technician commissions.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">
                Pending Upload
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">
                Awaiting Verification
              </p>
              <p className="mt-2 text-2xl font-semibold text-yellow-600">
                {stats.uploaded}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Verified</p>
              <p className="mt-2 text-2xl font-semibold text-green-600">
                {stats.verified}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Rejected</p>
              <p className="mt-2 text-2xl font-semibold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <div className="rounded-lg bg-red-100 p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Total commissions banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#c20001] to-[#ffb111] p-4 shadow-sm">
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-medium text-white/90">
              Total Commissions (Verified)
            </p>
            <p className="mt-2 text-2xl font-semibold">
              ${totalCommissions.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-white/20 p-3">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by work order, customer, or technician…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
          />
        </div>

        <div className="flex w-full items-center gap-2 md:w-64">
          <div className="flex items-center justify-center rounded-lg bg-gray-100 p-2">
            <Filter className="h-4 w-4 text-gray-600" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
          >
            <option value="all">All Payments ({completedWorkOrders.length})</option>
            <option value="pending">
              Pending Upload ({stats.pending})
            </option>
            <option value="uploaded">
              Awaiting Verification ({stats.uploaded})
            </option>
            <option value="verified">Verified ({stats.verified})</option>
            <option value="rejected">Rejected ({stats.rejected})</option>
          </select>
        </div>
      </div>

      {/* Work orders list */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Completed Work Orders
          </h3>
        </div>
        <div className="px-4 py-4">
          {filteredWorkOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p>No completed work orders found</p>
              <p className="mt-1 text-sm">
                {searchTerm
                  ? "Try adjusting your search or filters."
                  : "Work orders will appear here once they are completed."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorkOrders.map((wo) => {
                const paymentStatus =
                  wo.paymentRecord?.paymentStatus || "Pending";
                const needsAttention = paymentStatus === "Proof Uploaded";

                return (
                  <div
                    key={wo.id}
                    className={`rounded-lg border p-4 transition-all ${
                      needsAttention
                        ? "border-yellow-300 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm font-semibold text-[#c20001]">
                            {wo.id}
                          </span>
                          {getStatusBadge(paymentStatus)}
                          {needsAttention && (
                            <Badge className="bg-[#ffb111] text-gray-900">
                              Action Required
                            </Badge>
                          )}
                        </div>

                        <div className="grid gap-4 text-sm md:grid-cols-4">
                          <div>
                            <p className="text-xs text-gray-600">Customer</p>
                            <p className="text-gray-900">{wo.customerName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Technician</p>
                            <p className="text-gray-900">
                              {getTechnicianName(wo.assignedTechnician)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Category</p>
                            <p className="text-gray-900">{wo.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Completed</p>
                            <p className="flex items-center gap-1 text-gray-900">
                              <Calendar className="h-3 w-3" />
                              {wo.completionDate || "N/A"}
                            </p>
                          </div>
                        </div>

                        {wo.paymentRecord?.paymentProof && (
                          <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-2 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Amount:</span>
                              <span className="text-gray-900">
                                $
                                {wo.paymentRecord.paymentProof.amount.toFixed(
                                  2
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Method:</span>
                              <span className="text-gray-900">
                                {wo.paymentRecord.paymentProof.paymentMethod}
                              </span>
                            </div>
                            {wo.paymentRecord.commissionAmount != null && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">
                                  Commission:
                                </span>
                                <span className="text-green-600">
                                  $
                                  {wo.paymentRecord.commissionAmount.toFixed(
                                    2
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {wo.paymentRecord?.rejectionReason && (
                          <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                            <span className="font-medium">Rejection: </span>
                            {wo.paymentRecord.rejectionReason}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => openModal(wo)}
                          className={`rounded-[10px] px-4 py-2.5 text-sm font-medium shadow-sm transition
                            ${
                              needsAttention
                                ? "bg-[#c20001] text-white hover:bg-[#c20001]/90"
                                : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                            }`}
                        >
                          {paymentStatus === "Pending"
                            ? "View Details"
                            : paymentStatus === "Proof Uploaded"
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
      {selectedWorkOrder && (
        <DispatcherPaymentVerificationModal
          isOpen={!!selectedWorkOrder}
          onClose={closeModal}
          workOrder={selectedWorkOrder}
          technician={selectedTechnician}
          onVerify={(commission) =>
            handleVerifyPayment(selectedWorkOrder.id, commission)
          }
          onReject={(reason) =>
            handleRejectPayment(selectedWorkOrder.id, reason)
          }
        />
      )}
    </div>
  );
}
