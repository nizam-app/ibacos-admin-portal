// src/pages/administrator/AdminWorkOrders.jsx
import { useState } from "react";
import Swal from "sweetalert2";
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  RefreshCw,
  XCircle,
  Search,
  CircleDollarSign,
  FileText,
  ListOrdered,
  CheckCircle2,
  AlertCircle,
  CreditCard
} from "lucide-react";

// ------------------------------------------------------
// Simple Badge component ( Tailwind based )
// ------------------------------------------------------
const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

// ------------------------------------------------------
// Mock Data (Admin side)
// ------------------------------------------------------

// Technicians
const mockTechnicians = [
  {
    id: "TECH001",
    name: "Mike Johnson",
    type: "Freelancer",
    specialty: "Electrical",
    commissionRate: 10,
  },
  {
    id: "TECH002",
    name: "Sarah Davis",
    type: "Internal Employee",
    specialty: "Plumbing",
    commissionRate: 0,
  },
  {
    id: "TECH003",
    name: "Robert Chen",
    type: "Freelancer",
    specialty: "HVAC",
    commissionRate: 12,
  },
];

// Work orders + payment records
const mockWorkOrders = [
  {
    id: "WO0001",
    srId: "SR0009",
    customerName: "John Doe",
    category: "Electrical",
    status: "Pending",
    priority: "High",
    scheduledDate: "2024-12-05",
    scheduledTime: "10:30",
    estimatedDuration: "2",
    assignedTechnician: null,
    notes: "Customer prefers morning visit.",
    paymentRecord: null,
  },
  {
    id: "WO0002",
    srId: "SR0010",
    customerName: "Jane Smith",
    category: "Plumbing",
    status: "Assigned",
    priority: "Medium",
    scheduledDate: "2024-12-06",
    scheduledTime: "14:00",
    estimatedDuration: "3",
    assignedTechnician: "TECH002",
    notes: "",
    paymentRecord: null,
  },
  {
    id: "WO0003",
    srId: "SR0011",
    customerName: "Robert Lee",
    category: "HVAC",
    status: "Completed",
    priority: "High",
    scheduledDate: "2024-12-01",
    scheduledTime: "09:00",
    estimatedDuration: "4",
    assignedTechnician: "TECH001",
    notes: "Outdoor unit required cleaning.",
    paymentRecord: {
      paymentStatus: "Proof Uploaded",
      paymentProof: {
        uploadedBy: "Mike Johnson",
        uploadDate: "2024-12-01",
        paymentMethod: "Cash",
        amount: 150,
        proofImageUrl:
          "https://images.pexels.com/photos/4968381/pexels-photo-4968381.jpeg?auto=compress&cs=tinysrgb&w=800",
        notes: "Payment received in cash from customer.",
      },
      rejectionReason: "",
      commissionAmount: null,
      commissionBooked: false,
      commissionBookedDate: null,
      commissionPaid: false,
      verifiedBy: null,
      verifiedDate: null,
    },
  },
  {
    id: "WO0004",
    srId: "SR0012",
    customerName: "Emily Brown",
    category: "Electrical",
    status: "Completed",
    priority: "Low",
    scheduledDate: "2024-11-29",
    scheduledTime: "16:00",
    estimatedDuration: "1",
    assignedTechnician: "TECH003",
    notes: "",
    paymentRecord: {
      paymentStatus: "Verified",
      paymentProof: {
        uploadedBy: "Robert Chen",
        uploadDate: "2024-11-29",
        paymentMethod: "Mobile Money",
        amount: 200,
        proofImageUrl:
          "https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=800",
        notes: "Customer paid via mobile wallet.",
      },
      rejectionReason: "",
      commissionAmount: 24,
      commissionBooked: true,
      commissionBookedDate: "2024-11-30",
      commissionPaid: false,
      verifiedBy: "System Admin",
      verifiedDate: "2024-11-30",
    },
  },
  {
    id: "WO0005",
    srId: "SR0013",
    customerName: "Carlos Alvarez",
    category: "HVAC",
    status: "Completed",
    priority: "Medium",
    scheduledDate: "2024-11-28",
    scheduledTime: "11:00",
    estimatedDuration: "3",
    assignedTechnician: "TECH001",
    notes: "",
    paymentRecord: {
      paymentStatus: "Rejected",
      paymentProof: {
        uploadedBy: "Mike Johnson",
        uploadDate: "2024-11-28",
        paymentMethod: "Cash",
        amount: 180,
        proofImageUrl:
          "https://images.pexels.com/photos/4968390/pexels-photo-4968390.jpeg?auto=compress&cs=tinysrgb&w=800",
        notes: "Image was blurry.",
      },
      rejectionReason: "Receipt image not clear. Please upload a sharp photo.",
      commissionAmount: 0,
      commissionBooked: false,
      commissionBookedDate: null,
      commissionPaid: false,
      verifiedBy: "Admin User",
      verifiedDate: "2024-11-29",
    },
  },
];

// Audit Events
const mockAuditEvents = [
  {
    id: 1,
    workOrderId: "WO0003",
    timestamp: "2024-12-01 08:40",
    actorRole: "Dispatcher",
    actorName: "Michael Adams",
    action: "Converted SR0011 into work order WO0003",
  },
  {
    id: 2,
    workOrderId: "WO0003",
    timestamp: "2024-12-01 08:45",
    actorRole: "Dispatcher",
    actorName: "Michael Adams",
    action: "Assigned technician Mike Johnson (TECH001)",
  },
  {
    id: 3,
    workOrderId: "WO0003",
    timestamp: "2024-12-01 11:20",
    actorRole: "Technician",
    actorName: "Mike Johnson",
    action: "Marked work order as Completed and uploaded payment proof.",
  },
  {
    id: 4,
    workOrderId: "WO0004",
    timestamp: "2024-11-29 09:30",
    actorRole: "Dispatcher",
    actorName: "Anna Smith",
    action: "Assigned technician Robert Chen (TECH003)",
  },
  {
    id: 5,
    workOrderId: "WO0004",
    timestamp: "2024-11-30 10:05",
    actorRole: "Admin",
    actorName: "System Admin",
    action: "Verified payment and booked commission.",
  },
  {
    id: 6,
    workOrderId: "WO0005",
    timestamp: "2024-11-29 09:15",
    actorRole: "Admin",
    actorName: "Admin User",
    action: "Rejected payment proof – reason: image not clear.",
  },
];

// ------------------------------------------------------
// Small inline components: Audit Trail + Modals
// ------------------------------------------------------

// Audit Trail (Admin only)
const WorkOrderAuditTrail = ({ events = [], onViewFullLog }) => {
  if (!events.length) return null;

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-800">
            Audit Trail (last {events.length} events)
          </h4>
        </div>
        <button
          type="button"
          onClick={onViewFullLog}
          className="text-xs font-medium text-[#c20001] hover:underline"
        >
          View full audit log
        </button>
      </div>
      <ul className="space-y-2 text-xs">
        {events.map((ev) => (
          <li key={ev.id} className="flex gap-2">
            <span className="mt-0.5 h-5 w-5 flex-none rounded-full bg-[#c20001]/5 text-center text-[10px] font-semibold text-[#c20001] leading-5">
              ●
            </span>
            <div>
              <p className="font-medium text-gray-800">{ev.action}</p>
              <p className="text-[11px] text-gray-500">
                {ev.timestamp} • {ev.actorRole} – {ev.actorName}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Work Order Actions Modal (Assign / Reassign / Reschedule / Cancel)
const WorkOrderActionsModal = ({
  workOrder,
  action,
  technicians,
  onClose,
  onConfirm,
}) => {
  const [selectedTechnician, setSelectedTechnician] = useState(
    workOrder.assignedTechnician || ""
  );
  const [scheduledDate, setScheduledDate] = useState(workOrder.scheduledDate);
  const [scheduledTime, setScheduledTime] = useState(workOrder.scheduledTime);
  const [estimatedDuration, setEstimatedDuration] = useState(
    workOrder.estimatedDuration || "2"
  );
  const [notes, setNotes] = useState(workOrder.notes || "");
  const [cancelReason, setCancelReason] = useState("");

  if (!action) return null;

  const stop = (e) => e.stopPropagation();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (action === "cancel") {
      if (!cancelReason.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Reason required",
          text: "Please provide a cancellation reason.",
          confirmButtonColor: "#c20001",
        });
        return;
      }

      onConfirm(workOrder.id, "cancel", { reason: cancelReason });
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      Swal.fire({
        icon: "warning",
        title: "Schedule required",
        text: "Please select scheduled date and time.",
        confirmButtonColor: "#c20001",
      });
      return;
    }

    if (action === "assign" || action === "reassign") {
      if (!selectedTechnician) {
        Swal.fire({
          icon: "warning",
          title: "Technician required",
          text: "Please select a technician.",
          confirmButtonColor: "#c20001",
        });
        return;
      }
    }

    onConfirm(workOrder.id, action, {
      assignedTechnician: selectedTechnician,
      scheduledDate,
      scheduledTime,
      estimatedDuration,
      notes,
    });
  };

  const titleMap = {
    assign: "Assign Work Order",
    reassign: "Reassign Work Order",
    reschedule: "Reschedule Work Order",
    cancel: "Cancel Work Order",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={stop}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {titleMap[action]}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              WO ID: <span className="font-medium text-[#c20001]">{workOrder.id}</span>{" "}
              • SR: {workOrder.srId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4">
          {action === "cancel" ? (
            <>
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">
                    Warning: This action cannot be undone.
                  </p>
                  <p className="text-red-700">
                    Cancelling this work order will notify the technician and
                    customer.
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Cancellation Reason *
                </label>
                <textarea
                  rows={4}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  placeholder="Please provide a reason for cancelling this work order..."
                />
              </div>
            </>
          ) : (
            <>
              {/* Technician select for assign / reassign */}
              {(action === "assign" || action === "reassign") && (
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {action === "assign"
                        ? "Assign Technician *"
                        : "Reassign to Technician *"}
                    </label>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <User className="h-3 w-3" /> Sorted by ID
                    </span>
                  </div>
                  <div className="grid gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                    {technicians.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setSelectedTechnician(t.id)}
                        className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                          selectedTechnician === t.id
                            ? "border-[#c20001] bg-white"
                            : "border-transparent bg-transparent hover:border-gray-200 hover:bg-white"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {t.name} – {t.specialty}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t.type === "Freelancer" ? "Freelancer" : "Employee"}
                            {t.commissionRate
                              ? ` • Rate: ${t.commissionRate}%`
                              : ""}
                          </p>
                        </div>
                        {selectedTechnician === t.id && (
                          <CheckCircle2 className="h-4 w-4 text-[#c20001]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Scheduled Time *
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Estimated Duration (hrs) *
                  </label>
                  <select
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                    <option value="4">4 hours</option>
                    <option value="6">6 hours</option>
                    <option value="8">8 hours</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  placeholder="Add any special instructions or notes for the technician..."
                />
              </div>
            </>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm ${
                action === "cancel"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#c20001] hover:bg-[#a00001]"
              }`}
            >
              {action === "cancel"
                ? "Confirm Cancellation"
                : action === "reschedule"
                ? "Update Schedule"
                : action === "reassign"
                ? "Update Assignment"
                : "Assign Work Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Payment Verification Modal (Admin – with commission details)
const PaymentVerificationModal = ({
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
}) => {
  const [action, setAction] = useState(null); // 'verify' | 'reject'
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionCompleted, setActionCompleted] = useState(null); // 'verified' | 'rejected'

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

      Swal.fire({
        icon: "success",
        title: "Payment verified",
        text: `${paymentLabel} of $${calculatedAmount.toFixed(
          2
        )} has been booked.`,
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
      setActionCompleted("rejected");

      Swal.fire({
        icon: "info",
        title: "Payment rejected",
        text: "Technician will be asked to upload a new payment proof.",
        confirmButtonColor: "#c20001",
      });
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Verification
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                WO:{" "}
                <span className="font-medium text-[#c20001]">{workOrderId}</span>{" "}
                • {customerName}
              </p>
            </div>
            <CircleDollarSign className="h-6 w-6 text-[#c20001]" />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          {/* Status badge */}
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="h-4 w-4 text-gray-500" />
                <span>Technician: {technicianName}</span>
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
          </div>

          {/* Payment proof details */}
          {paymentRecord.paymentProof && (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#c20001]">
                <FileText className="h-4 w-4" />
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
                  <CircleDollarSign className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="text-gray-900">
                      ${paymentRecord.paymentProof.amount.toFixed(2)}
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
              </div>

              {/* Proof Image */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  Payment Proof Image
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

          {/* Rejection Info (view mode) */}
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

          {/* Auto calculated commission summary */}
          {paymentRecord.paymentStatus === "Proof Uploaded" &&
            paymentRecord.paymentProof && (
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                  <h3 className="font-medium text-gray-900">
                    {paymentLabel} Summary
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Configured rate:</span>
                    <span className="text-gray-900">{technicianRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calculated amount:</span>
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
                  <p className="pt-1 text-xs italic text-gray-600">
                    Rates are preconfigured and cannot be changed here.
                  </p>
                </div>
              </div>
            )}

          {/* Action Section */}
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
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm ${
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
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm ${
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

              {action === "reject" && !actionCompleted && (
                <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Rejection Reason *
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                      placeholder="Explain why the payment proof is being rejected..."
                    />
                  </div>
                  <div className="text-sm text-red-700">
                    <p>• Technician must upload a new payment proof.</p>
                    <p>• Work order will remain Completed.</p>
                    <p>• No {paymentLabel.toLowerCase()} will be booked yet.</p>
                  </div>
                </div>
              )}

              {actionCompleted === "verified" && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  ✓ Payment verified • {paymentLabel} booked
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

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-3">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            {actionCompleted ||
            paymentRecord.paymentStatus !== "Proof Uploaded"
              ? "Close"
              : "Cancel"}
          </button>
          {paymentRecord.paymentStatus === "Proof Uploaded" &&
            action &&
            !actionCompleted && (
              <button
                type="button"
                onClick={handleSubmit}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm ${
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
};

// ------------------------------------------------------
// MAIN COMPONENT: AdminWorkOrders
// ------------------------------------------------------
export default function AdminWorkOrders() {
  const [workOrders, setWorkOrders] = useState(mockWorkOrders);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [currentAction, setCurrentAction] = useState(null); // 'assign' | 'reassign' | 'reschedule' | 'cancel' | 'verifyPayment'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const technicianNameMap = mockTechnicians.reduce((acc, t) => {
    acc[t.id] = t.name;
    return acc;
  }, {});

  const getTechnicianName = (techId) => {
    if (!techId) return "";
    return technicianNameMap[techId] || techId;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleActionClick = (wo, action) => {
    setSelectedWorkOrder(wo);
    setCurrentAction(action);
  };

  const handleConfirmAction = (workOrderId, action, data) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;

        if (action === "cancel") {
          return { ...wo, status: "Cancelled", notes: data.reason };
        }

        const newStatus =
          action === "assign" || action === "reassign"
            ? "Assigned"
            : action === "reschedule"
            ? wo.status
            : wo.status;

        return {
          ...wo,
          status: newStatus,
          assignedTechnician:
            action === "assign" || action === "reassign"
              ? data.assignedTechnician
              : wo.assignedTechnician,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          estimatedDuration: data.estimatedDuration,
          notes: data.notes,
        };
      })
    );

    setSelectedWorkOrder(null);
    setCurrentAction(null);

    Swal.fire({
      icon: "success",
      title: "Work order updated",
      text:
        action === "cancel"
          ? "Work order has been cancelled."
          : "Work order has been updated successfully.",
      confirmButtonColor: "#c20001",
    });
  };

  const handleVerifyPayment = (workOrderId, commissionAmount) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;
        if (!wo.paymentRecord) return wo;

        return {
          ...wo,
          paymentRecord: {
            ...wo.paymentRecord,
            paymentStatus: "Verified",
            commissionAmount,
            commissionBooked: true,
            commissionBookedDate: "2024-12-02",
            verifiedBy: "Admin User",
            verifiedDate: "2024-12-02",
          },
        };
      })
    );
    setSelectedWorkOrder(null);
    setCurrentAction(null);
  };

  const handleRejectPayment = (workOrderId, reason) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;
        if (!wo.paymentRecord) return wo;

        return {
          ...wo,
          paymentRecord: {
            ...wo.paymentRecord,
            paymentStatus: "Rejected",
            rejectionReason: reason,
            verifiedBy: "Admin User",
            verifiedDate: "2024-12-02",
          },
        };
      })
    );
    setSelectedWorkOrder(null);
    setCurrentAction(null);
  };

  const filterWorkOrders = (status) => {
    let filtered = workOrders;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (wo) =>
          wo.id.toLowerCase().includes(q) ||
          wo.customerName.toLowerCase().includes(q)
      );
    }

    if (status && status !== "all") {
      filtered = filtered.filter(
        (wo) => wo.status.toLowerCase() === status.toLowerCase()
      );
    }

    return filtered;
  };

  const getPaymentStatus = (wo) => {
    if (wo.status !== "Completed") return null;
    if (!wo.paymentRecord) return "Pending Payment";

    switch (wo.paymentRecord.paymentStatus) {
      case "Verified":
        return "Paid Verified";
      case "Rejected":
        return "Payment Rejected";
      case "Proof Uploaded":
      case "Pending":
      default:
        return "Pending Payment";
    }
  };

  const renderWorkOrders = (filtered) => {
    if (!filtered.length) {
      return (
        <div className="py-12 text-center text-gray-500">
          <p>
            No work orders found
            {searchQuery ? " matching your search" : " in this category"}.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filtered.map((wo) => {
          const paymentStatus = getPaymentStatus(wo);
          const woAuditEvents = mockAuditEvents.filter(
            (ev) => ev.workOrderId === wo.id
          );

          return (
            <div
              key={wo.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-gray-50"
            >
              {/* Top row */}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-[#c20001]">
                    {wo.id}
                  </h3>
                  <p className="text-xs text-gray-600">SR: {wo.srId}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={getPriorityColor(wo.priority)}>
                    {wo.priority} Priority
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-700">
                    Status: {wo.status}
                  </Badge>
                </div>
              </div>

              {/* Customer & Category */}
              <div className="mb-3 grid grid-cols-1 gap-3 text-sm text-gray-900 md:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-600">Customer</p>
                  <p>{wo.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Category</p>
                  <p>{wo.category}</p>
                </div>
              </div>

              {/* Meta line */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{wo.scheduledDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{wo.scheduledTime}</span>
                </div>
                {wo.assignedTechnician ? (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{getTechnicianName(wo.assignedTechnician)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600">
                    <User className="h-4 w-4" />
                    <span>Unassigned</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{wo.estimatedDuration}h duration</span>
                </div>
              </div>

              {/* Notes */}
              {wo.notes && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-600">Notes</p>
                  <p className="text-sm text-gray-700">{wo.notes}</p>
                </div>
              )}

              {/* Footer: payment + actions */}
              {wo.status !== "Cancelled" && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Left: payment badge + dispatcher style actions */}
                    <div className="flex items-center gap-2">
                      {/* Payment status */}
                      {wo.status === "Completed" && paymentStatus && (
                        <>
                          {paymentStatus === "Paid Verified" && (
                            <Badge className="bg-green-100 text-green-800">
                              <CircleDollarSign className="mr-1 h-3 w-3" />
                              Paid Verified
                            </Badge>
                          )}
                          {paymentStatus === "Pending Payment" && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <CircleDollarSign className="mr-1 h-3 w-3" />
                              Pending Payment
                            </Badge>
                          )}
                          {paymentStatus === "Payment Rejected" && (
                            <Badge className="bg-red-100 text-red-800">
                              <CircleDollarSign className="mr-1 h-3 w-3" />
                              Payment Rejected
                            </Badge>
                          )}
                        </>
                      )}

                      {/* Assignment / schedule actions */}
                      {wo.status !== "Completed" && (
                        <div className="flex gap-1">
                          {/* Assign / Reassign */}
                          {(wo.status === "Pending" ||
                            wo.status === "Assigned") && (
                            <div className="group relative">
                              <button
                                type="button"
                                onClick={() =>
                                  handleActionClick(
                                    wo,
                                    wo.status === "Pending"
                                      ? "assign"
                                      : "reassign"
                                  )
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-xs text-gray-700 transition hover:bg-gray-100"
                              >
                                {wo.status === "Pending" ? (
                                  <UserCheck className="h-4 w-4" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                              </button>
                              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                                {wo.status === "Pending"
                                  ? "Assign Technician"
                                  : "Reassign"}
                              </div>
                            </div>
                          )}

                          {/* Reschedule */}
                          {(wo.status === "Pending" ||
                            wo.status === "Assigned" ||
                            wo.status === "In Progress") && (
                            <div className="group relative">
                              <button
                                type="button"
                                onClick={() =>
                                  handleActionClick(wo, "reschedule")
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-xs text-gray-700 transition hover:bg-gray-100"
                              >
                                <Calendar className="h-4 w-4" />
                              </button>
                              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                                Reschedule
                              </div>
                            </div>
                          )}

                          {/* Cancel */}
                          {(wo.status === "Pending" ||
                            wo.status === "Assigned") && (
                            <div className="group relative">
                              <button
                                type="button"
                                onClick={() => handleActionClick(wo, "cancel")}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-600 bg-white text-xs text-red-600 transition hover:bg-red-600 hover:text-white"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                                Cancel
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Admin payment actions */}
                    {wo.status === "Completed" && (
                      <div>
                        {wo.paymentRecord && (
                          <>
                            {wo.paymentRecord.paymentStatus ===
                              "Proof Uploaded" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleActionClick(wo, "verifyPayment")
                                }
                                className="rounded-[10px] bg-[#c20001] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#c20001]/90"
                              >
                                Verify Payment
                              </button>
                            )}
                            {wo.paymentRecord.paymentStatus === "Verified" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleActionClick(wo, "verifyPayment")
                                }
                                className="rounded-[10px] border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                              >
                                View Verification
                              </button>
                            )}
                            {wo.paymentRecord.paymentStatus === "Rejected" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleActionClick(wo, "verifyPayment")
                                }
                                className="rounded-[10px] border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                              >
                                View / Update Decision
                              </button>
                            )}
                          </>
                        )}

                        {!wo.paymentRecord && (
                          <button
                            type="button"
                            className="text-sm font-medium text-[#c20001] hover:underline"
                            onClick={() => {
                              Swal.fire({
                                icon: "info",
                                title: "No payment proof yet",
                                text: "You can only verify payment after proof has been uploaded by technician.",
                                confirmButtonColor: "#c20001",
                              });
                            }}
                          >
                            Awaiting payment proof
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audit Trail (Admin only) */}
              {woAuditEvents.length > 0 && (
                <WorkOrderAuditTrail
                  events={woAuditEvents}
                  onViewFullLog={() => {
                    Swal.fire({
                      icon: "info",
                      title: "Audit log",
                      text: "Full audit log view will be implemented here (admin-only feature).",
                      confirmButtonColor: "#c20001",
                    });
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------
  const tabs = [
    { key: "all", label: "All", count: workOrders.length },
    { key: "pending", label: "Pending", count: filterWorkOrders("pending").length },
    {
      key: "assigned",
      label: "Assigned",
      count: filterWorkOrders("assigned").length,
    },
    {
      key: "in progress",
      label: "In Progress",
      count: filterWorkOrders("in progress").length,
    },
    {
      key: "completed",
      label: "Completed",
      count: filterWorkOrders("completed").length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: filterWorkOrders("cancelled").length,
    },
  ];

  const currentList =
    activeTab === "all"
      ? workOrders
      : filterWorkOrders(activeTab);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="pt-6">
        <div className="flex items-center justify-between px-6 pb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Work Orders (Admin)
            </h1>
            <p className="text-sm text-gray-500">
              Full control over assignments, schedules, payments & audit trail.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              Swal.fire({
                icon: "info",
                title: "Export coming soon",
                text: "CSV / Excel export of work orders will be added here.",
                confirmButtonColor: "#c20001",
              })
            }
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="px-6 pb-6">
          {!workOrders.length ? (
            <div className="py-12 text-center text-gray-500">
              <p>No work orders have been created yet.</p>
              <p className="mt-2 text-sm">
                Convert a service request to create your first work order.
              </p>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    placeholder="Search by WO ID or Customer…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="w-full">
                <div className="grid w-full grid-cols-6 rounded-lg bg-gray-100 p-1 text-xs font-medium text-gray-700">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs transition ${
                        activeTab === tab.key
                          ? "bg-white text-[#c20001] shadow-sm"
                          : "bg-transparent text-gray-700 hover:bg-white"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                <div className="mt-6">{renderWorkOrders(currentList)}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions Modal */}
      {selectedWorkOrder &&
        currentAction &&
        currentAction !== "verifyPayment" && (
          <WorkOrderActionsModal
            workOrder={selectedWorkOrder}
            action={currentAction}
            technicians={mockTechnicians}
            onClose={() => {
              setSelectedWorkOrder(null);
              setCurrentAction(null);
            }}
            onConfirm={handleConfirmAction}
          />
        )}

      {/* Payment Verification Modal */}
      {selectedWorkOrder &&
        currentAction === "verifyPayment" &&
        selectedWorkOrder.paymentRecord && (
          <PaymentVerificationModal
            isOpen={true}
            onClose={() => {
              setSelectedWorkOrder(null);
              setCurrentAction(null);
            }}
            workOrderId={selectedWorkOrder.id}
            customerName={selectedWorkOrder.customerName}
            technicianName={getTechnicianName(
              selectedWorkOrder.assignedTechnician
            )}
            technicianType={
              mockTechnicians.find(
                (t) => t.id === selectedWorkOrder.assignedTechnician
              )?.type
            }
            technicianRate={
              mockTechnicians.find(
                (t) => t.id === selectedWorkOrder.assignedTechnician
              )?.commissionRate || 10
            }
            paymentRecord={selectedWorkOrder.paymentRecord}
            onVerify={(amount) =>
              handleVerifyPayment(selectedWorkOrder.id, amount)
            }
            onReject={(reason) =>
              handleRejectPayment(selectedWorkOrder.id, reason)
            }
          />
        )}
    </div>
  );
}
