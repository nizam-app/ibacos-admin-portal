// src/components/PaymentVerificationModal.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  Calendar,
  User,
  CreditCard,
  CircleDollarSign,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import PaymentsAPI from "../api/paymentsApi"; // <- adjust path if needed

/* Small helper for status badges */
const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

function PaymentVerificationModal({
  isOpen,
  onClose,
  payment, // full object from GET /api/payments
  onVerified,
  onRejected,
}) {
  const [action, setAction] = useState(null); // 'verify' | 'reject'
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !payment) return null;

  const stop = (e) => e.stopPropagation();

  const handleClose = () => {
    setAction(null);
    setReason("");
    onClose?.();
  };

  // ---------------- API CALL (APPROVE / REJECT) ----------------
  const handleSubmit = async () => {
    if (!action) return;

    try {
      setLoading(true);

      if (action === "verify") {
        // APPROVE
        await PaymentsAPI.verifyPayment(payment.id, "APPROVE");

        Swal.fire({
          icon: "success",
          title: "Payment verified",
          text: "Payment has been marked as VERIFIED.",
          confirmButtonColor: "#c20001",
        });

        onVerified?.(payment.id);
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

        // REJECT with reason
        await PaymentsAPI.verifyPayment(payment.id, "REJECT", reason);

        Swal.fire({
          icon: "info",
          title: "Payment rejected",
          text: "Technician will be asked to re-upload a clear proof.",
          confirmButtonColor: "#c20001",
        });

        onRejected?.(payment.id, reason);
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

  // ---------------- Derived data for UI ----------------
  const status = payment.status; // PENDING_VERIFICATION | VERIFIED | REJECTED
  const wo = payment.workOrder;
  const tech = payment.technician;
  const customerName = wo?.customer?.name || "Unknown customer";

  // Vite env (no `process`!)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

  let imageUrl = null;
  if (payment.proofUrl) {
    imageUrl = payment.proofUrl.startsWith("http")
      ? payment.proofUrl
      : `${API_BASE}${payment.proofUrl}`;
  }

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
}

export default PaymentVerificationModal;
