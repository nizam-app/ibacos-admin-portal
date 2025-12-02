import React, { useState } from "react";
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

/* ------------------------- Simple Badge component ------------------------- */
const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

/* ------------------------------ Mock Data -------------------------------- */

const mockTechnicians = [
  {
    id: "TECH001",
    name: "Mike Johnson",
    employmentType: "Freelancer",
    commissionRate: 10,
  },
  {
    id: "TECH002",
    name: "Sarah Davis",
    employmentType: "Internal Employee",
    bonusRate: 5,
  },
  {
    id: "TECH003",
    name: "Robert Chen",
    employmentType: "Freelancer",
    commissionRate: 12,
  },
];

const mockWorkOrdersData = [
  {
    id: "WO-1001",
    srId: "SR-9001",
    status: "Completed",
    customerName: "John Doe",
    assignedTechnician: "TECH001",
    category: "AC Installation",
    completionDate: "2024-11-28",
    paymentRecord: {
      paymentStatus: "Pending", // Pending upload
      paymentProof: null,
      commissionAmount: null,
      commissionBooked: false,
      commissionBookedDate: null,
      commissionPaid: false,
      verifiedBy: null,
      verifiedDate: null,
      rejectionReason: null,
    },
  },
  {
    id: "WO-1002",
    srId: "SR-9002",
    status: "Completed",
    customerName: "Maria Gomez",
    assignedTechnician: "TECH002",
    category: "Plumbing",
    completionDate: "2024-11-27",
    paymentRecord: {
      paymentStatus: "Proof Uploaded",
      paymentProof: {
        uploadedBy: "Sarah Davis",
        uploadDate: "2024-11-27",
        paymentMethod: "Cash",
        amount: 120,
        proofImageUrl:
          "https://via.placeholder.com/600x360.png?text=Payment+Proof+WO-1002",
        notes: "Paid in full at job site.",
      },
      commissionAmount: null,
      commissionBooked: false,
      commissionBookedDate: null,
      commissionPaid: false,
      verifiedBy: null,
      verifiedDate: null,
      rejectionReason: null,
    },
  },
  {
    id: "WO-1003",
    srId: "SR-9003",
    status: "Completed",
    customerName: "Alex Smith",
    assignedTechnician: "TECH001",
    category: "Electrical",
    completionDate: "2024-11-25",
    paymentRecord: {
      paymentStatus: "Verified",
      paymentProof: {
        uploadedBy: "Mike Johnson",
        uploadDate: "2024-11-25",
        paymentMethod: "Mobile Money",
        amount: 200,
        proofImageUrl:
          "https://via.placeholder.com/600x360.png?text=Payment+Proof+WO-1003",
        notes: "Customer sent via mobile app.",
      },
      commissionAmount: 20,
      commissionBooked: true,
      commissionBookedDate: "2024-11-26",
      commissionPaid: false,
      verifiedBy: "Admin User",
      verifiedDate: "2024-11-26",
      rejectionReason: null,
    },
  },
  {
    id: "WO-1004",
    srId: "SR-9004",
    status: "Completed",
    customerName: "Emma Wilson",
    assignedTechnician: "TECH003",
    category: "AC Maintenance",
    completionDate: "2024-11-23",
    paymentRecord: {
      paymentStatus: "Rejected",
      paymentProof: {
        uploadedBy: "Robert Chen",
        uploadDate: "2024-11-23",
        paymentMethod: "Cash",
        amount: 90,
        proofImageUrl:
          "https://via.placeholder.com/600x360.png?text=Payment+Proof+WO-1004",
        notes: "Low-light photo, hard to read.",
      },
      commissionAmount: null,
      commissionBooked: false,
      commissionBookedDate: null,
      commissionPaid: false,
      verifiedBy: "Admin User",
      verifiedDate: "2024-11-24",
      rejectionReason: "Receipt photo not clear. Please re-upload in better lighting.",
    },
  },
];

/* -------------------- Payment Verification Modal (Admin) ------------------- */

const PaymentVerificationModal = ({
  isOpen,
  onClose,
  workOrder,
  technician,
  onVerify,
  onReject,
  onMarkPaid,
}) => {
  const [action, setAction] = useState(null); // 'verify' | 'reject'
  const [rejectionReason, setRejectionReason] = useState("");
  const [markPaid, setMarkPaid] = useState(false);

  if (!isOpen || !workOrder || !workOrder.paymentRecord) return null;

  const { paymentRecord } = workOrder;

  const paymentLabel =
    technician?.employmentType === "Freelancer" ? "Commission" : "Bonus";

  const technicianRate =
    technician?.employmentType === "Freelancer"
      ? technician?.commissionRate || 0
      : technician?.bonusRate || 0;

  const calculateAmount = () => {
    if (!paymentRecord.paymentProof) return 0;
    return paymentRecord.paymentProof.amount * (technicianRate / 100);
  };

  const calculatedAmount = calculateAmount();

  const handleSubmit = () => {
    if (action === "verify") {
      onVerify(calculatedAmount, markPaid);
      Swal.fire({
        icon: "success",
        title: "Payment Verified",
        text: `${paymentLabel} booked successfully.`,
        confirmButtonColor: "#c20001",
      });
    } else if (action === "reject") {
      if (!rejectionReason.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Rejection reason required",
          text: "Please provide a reason for rejecting the payment proof.",
          confirmButtonColor: "#c20001",
        });
        return;
      }
      onReject(rejectionReason);
      Swal.fire({
        icon: "info",
        title: "Payment Rejected",
        text: "Technician will be asked to re-upload a valid proof.",
        confirmButtonColor: "#c20001",
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setAction(null);
    setRejectionReason("");
    setMarkPaid(false);
    onClose();
  };

  const stop = (e) => e.stopPropagation();

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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Verification
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review payment proof and verify or reject the payment for{" "}
                <span className="font-medium text-[#c20001]">
                  {workOrder.id}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          {/* WO info */}
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-[#c20001]">
                  {workOrder.id}
                </span>
                <p className="text-xs text-gray-500">SR: {workOrder.srId}</p>
              </div>
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
                {paymentRecord.paymentStatus}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-600">Customer</p>
                <p className="text-gray-900">{workOrder.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Technician</p>
                <p className="text-gray-900">{technician?.name}</p>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          {paymentRecord.paymentProof && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#c20001]">
                Payment Proof Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Uploaded By</p>
                    <p className="text-sm text-gray-900">
                      {paymentRecord.paymentProof.uploadedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Upload Date</p>
                    <p className="text-sm text-gray-900">
                      {paymentRecord.paymentProof.uploadDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Payment Method</p>
                    <p className="text-sm text-gray-900">
                      {paymentRecord.paymentProof.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CircleDollarSign className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="text-sm text-gray-900">
                      ${paymentRecord.paymentProof.amount.toFixed(2)}
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

              {/* Technician notes */}
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

          {/* Rejection info */}
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
                    {paymentRecord.verifiedBy && paymentRecord.verifiedDate && (
                      <p className="mt-2 text-xs text-red-600">
                        Rejected by {paymentRecord.verifiedBy} on{" "}
                        {paymentRecord.verifiedDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Verified summary */}
          {paymentRecord.paymentStatus === "Verified" && (
            <div className="space-y-3">
              <Badge className="bg-green-600 text-white">
                Payment Verified
              </Badge>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-green-900">
                      Payment Verified
                    </p>
                    {paymentRecord.commissionAmount && (
                      <p className="text-sm text-green-700">
                        {paymentLabel}: $
                        {paymentRecord.commissionAmount.toFixed(2)}
                      </p>
                    )}
                    {paymentRecord.commissionBooked && (
                      <p className="text-xs text-green-700">
                        {paymentLabel} booked on{" "}
                        {paymentRecord.commissionBookedDate}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-700">Payout Status:</span>
                      <Badge
                        className={
                          paymentRecord.commissionPaid
                            ? "bg-green-600 text-white"
                            : "bg-yellow-500 text-white"
                        }
                      >
                        {paymentRecord.commissionPaid ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-calculated commission / bonus */}
          {paymentRecord.paymentStatus === "Proof Uploaded" &&
            paymentRecord.paymentProof && (
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    {paymentLabel} Calculation
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Configured rate:</span>
                      <span className="text-gray-900">
                        {technicianRate}%
                      </span>
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
                        ${paymentRecord.paymentProof.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <label className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={markPaid}
                      onChange={(e) => setMarkPaid(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#c20001] focus:ring-[#c20001]"
                    />
                    Mark {paymentLabel.toLowerCase()} as paid immediately
                  </label>
                </div>
              </div>
            )}

          {/* Action section (admin) */}
          {paymentRecord.paymentStatus === "Proof Uploaded" && (
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
                  Verify & Book {paymentLabel}
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
                <div className="space-y-1 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <p>• Payment will be marked as Verified</p>
                  <p>
                    • {paymentLabel} of ${calculatedAmount.toFixed(2)} will be
                    booked
                  </p>
                  <p>• Technician will be notified</p>
                  {markPaid && (
                    <p>• Payout status will be marked as Paid</p>
                  )}
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
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Close
          </button>

          {paymentRecord.paymentStatus === "Proof Uploaded" && action && (
            <button
              type="button"
              onClick={handleSubmit}
              className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
                action === "verify"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {action === "verify" ? "Confirm Verification" : "Confirm Rejection"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------- Admin Payments Page ---------------------------- */

const AdminPaymentsPage = () => {
  const [workOrders, setWorkOrders] = useState(mockWorkOrdersData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | pending | uploaded | verified | rejected
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const completedWorkOrders = workOrders.filter(
    (wo) => wo.status === "Completed"
  );

  const getTechnician = (techId) =>
    mockTechnicians.find((t) => t.id === techId) || null;

  const getTechnicianName = (techId) => getTechnician(techId)?.name || techId;

  const filteredWorkOrders = completedWorkOrders.filter((wo) => {
    const paymentStatus = wo.paymentRecord?.paymentStatus || "Pending";

    const matchesSearch =
      wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTechnicianName(wo.assignedTechnician)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return paymentStatus === "Pending";
    if (filterStatus === "uploaded") return paymentStatus === "Proof Uploaded";
    if (filterStatus === "verified") return paymentStatus === "Verified";
    if (filterStatus === "rejected") return paymentStatus === "Rejected";

    return true;
  });

  const stats = {
    pending: completedWorkOrders.filter(
      (wo) =>
        !wo.paymentRecord || wo.paymentRecord.paymentStatus === "Pending"
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
        return (
          <Badge className="bg-green-500 text-white">Verified</Badge>
        );
      case "Rejected":
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Pending Upload</Badge>;
    }
  };

  const handleVerifyPayment = (workOrderId, commissionAmount, markPaid) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;
        const now = new Date().toISOString().split("T")[0];
        return {
          ...wo,
          paymentRecord: {
            ...wo.paymentRecord,
            paymentStatus: "Verified",
            commissionAmount,
            commissionBooked: true,
            commissionBookedDate: now,
            commissionPaid: markPaid ? true : wo.paymentRecord.commissionPaid,
            verifiedBy: "Admin User",
            verifiedDate: now,
            rejectionReason: null,
          },
        };
      })
    );
  };

  const handleRejectPayment = (workOrderId, reason) => {
    const now = new Date().toISOString().split("T")[0];
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;
        return {
          ...wo,
          paymentRecord: {
            ...wo.paymentRecord,
            paymentStatus: "Rejected",
            rejectionReason: reason,
            verifiedBy: "Admin User",
            verifiedDate: now,
            commissionAmount: null,
            commissionBooked: false,
            commissionBookedDate: null,
          },
        };
      })
    );
  };

  const handleMarkCommissionPaid = (workOrderId) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;
        return {
          ...wo,
          paymentRecord: {
            ...wo.paymentRecord,
            commissionPaid: true,
          },
        };
      })
    );
    Swal.fire({
      icon: "success",
      title: "Payout Marked as Paid",
      text: "Commission/bonus has been marked as paid.",
      confirmButtonColor: "#c20001",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Payment Management (Admin)
        </h2>
        <p className="text-sm text-gray-600">
          Verify payment proofs, manage commissions and payouts.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Pending */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Pending Upload</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Awaiting Verification */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Awaiting Verification</p>
              <p className="mt-1 text-lg font-semibold text-yellow-600">
                {stats.uploaded}
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
              Total Commissions/Bonuses (Verified)
            </p>
            <p className="mt-1 text-2xl font-semibold">
              ${totalCommissions.toFixed(2)}
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
            placeholder="Search by work order, customer, or technician..."
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
              <option value="all">All Payments ({completedWorkOrders.length})</option>
              <option value="pending">Pending Upload ({stats.pending})</option>
              <option value="uploaded">
                Awaiting Verification ({stats.uploaded})
              </option>
              <option value="verified">Verified ({stats.verified})</option>
              <option value="rejected">Rejected ({stats.rejected})</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Completed Work Orders List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Completed Work Orders
          </h3>
        </div>
        <div className="p-4">
          {filteredWorkOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p>No completed work orders found</p>
              <p className="mt-1 text-sm">
                {searchTerm
                  ? "Try adjusting your search or filters."
                  : "Work orders will appear here once completed."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorkOrders.map((wo) => {
                const paymentStatus = wo.paymentRecord?.paymentStatus || "Pending";
                const needsAttention = paymentStatus === "Proof Uploaded";
                const technician = getTechnician(wo.assignedTechnician);

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
                        <div className="flex flex-wrap items-center gap-2">
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

                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
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
                          <div className="mt-1 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CircleDollarSign className="h-4 w-4 text-gray-500" />
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
                            {wo.paymentRecord.commissionAmount && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">
                                  {technician?.employmentType === "Freelancer"
                                    ? "Commission:"
                                    : "Bonus:"}
                                </span>
                                <span className="font-medium text-green-600">
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
                          <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                            <span className="font-medium">Rejection:</span>{" "}
                            {wo.paymentRecord.rejectionReason}
                          </div>
                        )}

                        {wo.paymentRecord?.paymentStatus === "Verified" && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className="text-gray-600">Payout:</span>
                            <Badge
                              className={
                                wo.paymentRecord.commissionPaid
                                  ? "bg-green-600 text-white"
                                  : "bg-yellow-500 text-white"
                              }
                            >
                              {wo.paymentRecord.commissionPaid
                                ? "Paid"
                                : "Pending"}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedWorkOrder(wo)}
                          className={`rounded-[10px] px-4 py-2.5 text-sm font-medium shadow-sm ${
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

                        {wo.paymentRecord?.paymentStatus === "Verified" &&
                          !wo.paymentRecord.commissionPaid && (
                            <button
                              type="button"
                              onClick={() => handleMarkCommissionPaid(wo.id)}
                              className="rounded-[10px] border border-green-600 px-4 py-2.5 text-xs font-medium text-green-700 hover:bg-green-50"
                            >
                              Mark as Paid
                            </button>
                          )}
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
      {selectedWorkOrder && selectedWorkOrder.paymentRecord && (
        <PaymentVerificationModal
          isOpen={!!selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
          workOrder={selectedWorkOrder}
          technician={getTechnician(selectedWorkOrder.assignedTechnician)}
          onVerify={(commissionAmount, markPaid) =>
            handleVerifyPayment(
              selectedWorkOrder.id,
              commissionAmount,
              markPaid
            )
          }
          onReject={(reason) =>
            handleRejectPayment(selectedWorkOrder.id, reason)
          }
          onMarkPaid={() => handleMarkCommissionPaid(selectedWorkOrder.id)}
        />
      )}
    </div>
  );
};

export default AdminPaymentsPage;
