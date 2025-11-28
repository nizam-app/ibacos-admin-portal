// src/pages/dispatcher/PaymentVerificationModal.jsx
import { useState } from "react";
import {
  User,
  Calendar,
  CreditCard,
  DollarSign,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

// small pill badge helper
function Pill({ className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function PaymentVerificationModal({
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
  const [actionCompleted, setActionCompleted] = useState(null); // 'verified' | 'rejected'

  if (!isOpen || !paymentRecord) return null;

  const paymentLabel = technicianType === "Freelancer" ? "Commission" : "Bonus";

  const calculatedAmount =
    paymentRecord.paymentProof?.amount && technicianRate
      ? paymentRecord.paymentProof.amount * (technicianRate / 100)
      : 0;

  const handleSubmit = () => {
    if (action === "verify") {
      onVerify(calculatedAmount);
      setActionCompleted("verified");
    } else if (action === "reject") {
      if (!rejectionReason.trim()) {
        alert("Please provide a rejection reason");
        return;
      }
      onReject(rejectionReason.trim());
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Verification
            </h2>
            <p className="text-sm text-gray-500">
              Review payment proof and verify or reject the payment for{" "}
              {workOrderId}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Work Order Info */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#c20001] font-medium">{workOrderId}</span>
              <Pill
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
              </Pill>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Customer</p>
                <p>{customerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Technician</p>
                <p>{technicianName}</p>
              </div>
            </div>
          </div>

          {/* Payment Proof Details */}
          {paymentRecord.paymentProof && (
            <div className="space-y-4">
              <h3 className="text-[#c20001] font-semibold">
                Payment Proof Details
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Uploaded By</p>
                    <p>{paymentRecord.paymentProof.uploadedBy}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Upload Date</p>
                    <p>{paymentRecord.paymentProof.uploadDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p>{paymentRecord.paymentProof.paymentMethod}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p>${paymentRecord.paymentProof.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Proof Image */}
              <div>
                <p className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <ImageIcon className="w-4 h-4" />
                  Payment Proof
                </p>
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="aspect-video bg-white rounded-lg flex items-center justify-center">
                    <img
                      src={paymentRecord.paymentProof.proofImageUrl}
                      alt="Payment Proof"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Technician Notes */}
              {paymentRecord.paymentProof.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Technician Notes
                  </p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    {paymentRecord.paymentProof.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rejection Info (if rejected) */}
          {paymentRecord.paymentStatus === "Rejected" &&
            paymentRecord.rejectionReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-900 font-medium">
                      Rejection Reason
                    </p>
                    <p className="text-red-700 text-sm mt-1">
                      {paymentRecord.rejectionReason}
                    </p>
                    {paymentRecord.verifiedBy && (
                      <p className="text-red-600 text-xs mt-2">
                        Rejected by {paymentRecord.verifiedBy} on{" "}
                        {paymentRecord.verifiedDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Verification Info (if verified) */}
          {paymentRecord.paymentStatus === "Verified" && (
            <div className="space-y-3">
              <Pill className="bg-green-600 text-white">
                Verified on {paymentRecord.verifiedDate} by{" "}
                {paymentRecord.verifiedBy}
              </Pill>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="text-green-900 font-medium">
                      Payment Verified
                    </p>
                    {paymentRecord.commissionBooked && (
                      <p className="text-green-600 mt-1">
                        ✓{" "}
                        {technicianType === "Freelancer"
                          ? "Commission"
                          : "Bonus"}{" "}
                        booked on {paymentRecord.commissionBookedDate}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-green-600">
                          {technicianType === "Freelancer"
                            ? "Commission"
                            : "Bonus"}
                        </p>
                        <p className="text-green-700">
                          $
                          {paymentRecord.commissionAmount
                            ? paymentRecord.commissionAmount.toFixed(2)
                            : "0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-green-600">Payment Status</p>
                        <Pill
                          className={
                            paymentRecord.commissionPaid
                              ? "bg-green-600 text-white"
                              : "bg-yellow-600 text-white"
                          }
                        >
                          {paymentRecord.commissionPaid ? "Paid" : "Pending"}
                        </Pill>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-calculated Commission/Bonus Summary */}
          {paymentRecord.paymentStatus === "Proof Uploaded" &&
            paymentRecord.paymentProof && (
              <div className="pt-4 border-t border-gray-200">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3 text-sm">
                  <h3 className="text-gray-900 font-semibold">
                    {paymentLabel}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Configured rate:</span>
                      <span className="text-gray-900">{technicianRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Calculated amount:
                      </span>
                      <span className="text-gray-900">
                        ${calculatedAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-blue-300">
                      <span className="text-gray-600">Payment amount:</span>
                      <span className="text-gray-900">
                        ${paymentRecord.paymentProof.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 italic">
                    Rates are preconfigured and cannot be changed here.
                  </p>
                </div>
              </div>
            )}

          {/* Action Section */}
          {paymentRecord.paymentStatus === "Proof Uploaded" && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                Verification Action
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAction("verify")}
                  disabled={!!actionCompleted}
                  className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium border transition ${
                    action === "verify"
                      ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                  } ${actionCompleted ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  Verify Payment
                </button>
                <button
                  type="button"
                  onClick={() => setAction("reject")}
                  disabled={!!actionCompleted}
                  className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium border transition ${
                    action === "reject"
                      ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                  } ${actionCompleted ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  Reject Payment
                </button>
              </div>

              {action === "verify" && !actionCompleted && (
                <div className="space-y-2 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  <p>• Payment will be marked as Verified</p>
                  <p>
                    • {paymentLabel} of ${calculatedAmount.toFixed(2)} will be
                    automatically booked
                  </p>
                  <p>• Technician will be notified</p>
                </div>
              )}

              {actionCompleted === "verified" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  ✓ Payment verified • {paymentLabel} booked
                </div>
              )}

              {action === "reject" && !actionCompleted && (
                <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Rejection Reason *
                    </label>
                    <textarea
                      id="reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      placeholder="Explain why the payment proof is being rejected..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                    />
                  </div>
                  <div className="text-sm text-red-700">
                    <p>• Technician must reupload clear payment proof</p>
                    <p>• Work order will remain in Completed status</p>
                    <p>• No commission will be booked until verified</p>
                  </div>
                </div>
              )}

              {actionCompleted === "rejected" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  ✓ Payment rejected • Awaiting new proof
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
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
                className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white ${
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
