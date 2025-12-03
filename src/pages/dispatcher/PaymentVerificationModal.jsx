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

/* Small helper */
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
  workOrderId,
  customerName,
  technicianName,
  technicianType = "Freelancer",
  technicianRate = 10,
  paymentRecord,
  onVerify,
  onReject,
}) {
  const [action, setAction] = useState(null); // 'verify' | 'reject'
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionCompleted, setActionCompleted] = useState(null);

  if (!isOpen || !paymentRecord) return null;

  const stop = (e) => e.stopPropagation();

  const paymentLabel = technicianType === "Freelancer" ? "Commission" : "Bonus";

  const calculateAmount = () => {
    if (!paymentRecord.paymentProof) return 0;
    return paymentRecord.paymentProof.amount * (technicianRate / 100);
  };

  const calculatedAmount = calculateAmount();

  const handleSubmit = () => {
    if (action === "verify") {
      onVerify(calculatedAmount);
      setActionCompleted("verified");
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
      setActionCompleted("rejected");
    }
  };

  const handleClose = () => {
    setAction(null);
    setRejectionReason("");
    setActionCompleted(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
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
            Review payment proof and verify or reject the payment for{" "}
            <span className="font-medium text-[#c20001]">{workOrderId}</span>
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          {/* Work order info */}
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#c20001]">
                {workOrderId}
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
                {paymentRecord.paymentStatus}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-600">Customer</p>
                <p className="text-gray-900">{customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Technician</p>
                <p className="text-gray-900">{technicianName}</p>
              </div>
            </div>
          </div>

          {/* Proof details */}
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
                  <CircleDollarSign className="mt-0.5 h-4 w-4 text-gray-500" />
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

          {/* Rejected info (view only) */}
          {paymentRecord.paymentStatus === "Rejected" &&
            paymentRecord.rejectionReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">
                      Rejection Reason
                    </p>
                    <p className="mt-1 text-red-700">
                      {paymentRecord.rejectionReason}
                    </p>
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
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">
                      Payment Verified
                    </p>
                    {paymentRecord.commissionAmount && (
                      <p className="mt-1 text-green-700">
                        {paymentLabel}: $
                        {paymentRecord.commissionAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-calculated summary */}
          {paymentRecord.paymentStatus === "Proof Uploaded" &&
            paymentRecord.paymentProof && (
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                  <h3 className="font-medium text-gray-900">
                    {paymentLabel} Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Configured rate:</span>
                      <span className="text-gray-900">{technicianRate}%</span>
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
                  <p className="text-xs italic text-gray-600">
                    Rates are preconfigured and cannot be changed here.
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
                  disabled={!!actionCompleted}
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
                  disabled={!!actionCompleted}
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition ${
                    action === "reject"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Reject Payment
                </button>
              </div>

              {action === "verify" && !actionCompleted && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <p>• Payment will be marked as Verified.</p>
                  <p>
                    • {paymentLabel} of ${calculatedAmount.toFixed(2)} will be
                    booked.
                  </p>
                  <p>• Technician will be notified.</p>
                </div>
              )}

              {actionCompleted === "verified" && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  ✓ Payment verified • {paymentLabel} booked
                </div>
              )}

              {action === "reject" && !actionCompleted && (
                <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
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
                  <div className="text-red-700">
                    <p>• Technician must reupload clear payment proof.</p>
                    <p>• Work order will remain in Completed status.</p>
                    <p>• No commission will be booked until verified.</p>
                  </div>
                </div>
              )}

              {actionCompleted === "rejected" && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  ✓ Payment rejected • Awaiting new proof
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
            {actionCompleted
              ? "Close"
              : paymentRecord.paymentStatus === "Proof Uploaded"
              ? "Cancel"
              : "Close"}
          </button>
          {paymentRecord.paymentStatus === "Proof Uploaded" &&
            action &&
            !actionCompleted && (
              <button
                type="button"
                onClick={handleSubmit}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
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

export default PaymentVerificationModal;
