import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  RefreshCw,
  XCircle,
  Search,
  DollarSign,
  MapPin,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

/* ------------------------------------------------------------------
   MOCK DATA
-------------------------------------------------------------------*/

const MOCK_TECHNICIANS = [
  {
    id: "TECH001",
    name: "Mike Johnson",
    specialty: "Electrical",
    type: "Freelancer",
    commissionRate: 10,
    distance: 2.3,
    status: "Available",
    openJobs: [],
  },
  {
    id: "TECH002",
    name: "Sarah Davis",
    specialty: "Plumbing",
    type: "Internal Employee",
    bonusRate: 5,
    distance: 4.7,
    status: "Busy",
    openJobs: [
      {
        woId: "WO0008",
        status: "In Progress",
        scheduledDate: "2024-12-01",
        scheduledTime: "11:00",
      },
      {
        woId: "WO0012",
        status: "Assigned",
        scheduledDate: "2024-12-01",
        scheduledTime: "15:30",
      },
    ],
  },
  {
    id: "TECH003",
    name: "Robert Chen",
    specialty: "HVAC",
    type: "Freelancer",
    commissionRate: 12,
    distance: 6.1,
    status: "Busy",
    openJobs: [
      {
        woId: "WO0010",
        status: "In Progress",
        scheduledDate: "2024-12-01",
        scheduledTime: "10:00",
      },
    ],
  },
  {
    id: "TECH004",
    name: "Lisa Martinez",
    specialty: "General",
    type: "Internal Employee",
    bonusRate: 6,
    distance: 8.2,
    status: "Available",
    openJobs: [],
  },
];

const MOCK_WORK_ORDERS = [
  {
    id: "WO0007",
    srId: "SR-1021",
    customerName: "Abdi Hassan",
    category: "Electrical – Lighting",
    status: "Pending",
    scheduledDate: "2024-12-01",
    scheduledTime: "10:30",
    assignedTechnician: null,
    estimatedDuration: "2",
    priority: "High",
    notes: "Customer prefers morning visit.",
    paymentRecord: null,
  },
  {
    id: "WO0008",
    srId: "SR-1022",
    customerName: "Maria Gomez",
    category: "Plumbing – Leak repair",
    status: "Assigned",
    scheduledDate: "2024-12-01",
    scheduledTime: "14:00",
    assignedTechnician: "TECH002",
    estimatedDuration: "3",
    priority: "Medium",
    notes: "",
    paymentRecord: null,
  },
  {
    id: "WO0009",
    srId: "SR-1023",
    customerName: "John Smith",
    category: "HVAC – AC service",
    status: "In Progress",
    scheduledDate: "2024-11-30",
    scheduledTime: "16:30",
    assignedTechnician: "TECH003",
    estimatedDuration: "4",
    priority: "High",
    notes: "Urgent – AC not cooling.",
    paymentRecord: null,
  },
  {
    id: "WO0010",
    srId: "SR-1024",
    customerName: "Amina Ali",
    category: "General – Inspection",
    status: "Completed",
    scheduledDate: "2024-11-29",
    scheduledTime: "09:30",
    assignedTechnician: "TECH001",
    estimatedDuration: "1",
    priority: "Low",
    notes: "",
    paymentRecord: {
      paymentStatus: "Proof Uploaded",
      paymentProof: {
        uploadedBy: "Mike Johnson",
        uploadDate: "2024-11-29",
        paymentMethod: "Cash",
        amount: 120,
        proofImageUrl:
          "https://via.placeholder.com/600x400.png?text=Payment+Receipt",
        notes: "Customer paid full amount in cash.",
      },
      commissionAmount: null,
      commissionBooked: false,
      commissionPaid: false,
      commissionBookedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      rejectionReason: null,
    },
  },
  {
    id: "WO0011",
    srId: "SR-1025",
    customerName: "Karim Hussein",
    category: "Electrical – Socket",
    status: "Completed",
    scheduledDate: "2024-11-28",
    scheduledTime: "13:00",
    assignedTechnician: "TECH004",
    estimatedDuration: "2",
    priority: "Medium",
    notes: "",
    paymentRecord: {
      paymentStatus: "Verified",
      paymentProof: {
        uploadedBy: "Lisa Martinez",
        uploadDate: "2024-11-28",
        paymentMethod: "Mobile Money",
        amount: 80,
        proofImageUrl:
          "https://via.placeholder.com/600x400.png?text=MoMo+Screenshot",
        notes: "",
      },
      commissionAmount: 8,
      commissionBooked: true,
      commissionPaid: false,
      commissionBookedDate: "2024-11-28",
      verifiedBy: "Finance Admin",
      verifiedDate: "2024-11-28",
      rejectionReason: null,
    },
  },
];

/* ------------------------------------------------------------------
   SMALL UI HELPERS
-------------------------------------------------------------------*/

const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

/* ------------------------------------------------------------------
   ACTION MODAL (Assign / Reassign / Reschedule / Cancel)
-------------------------------------------------------------------*/

function WorkOrderActionsModal({
  workOrder,
  action,
  technicians,
  blockedTechnicians,
  onClose,
  onConfirm,
}) {
  const [selectedTechnician, setSelectedTechnician] = useState(
    workOrder.assignedTechnician || ""
  );
  const [scheduledDate, setScheduledDate] = useState(workOrder.scheduledDate);
  const [scheduledTime, setScheduledTime] = useState(workOrder.scheduledTime);
  const [estimatedDuration, setEstimatedDuration] = useState(
    workOrder.estimatedDuration || "2"
  );
  const [notes, setNotes] = useState(workOrder.notes || "");
  const [cancellationReason, setCancellationReason] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const filteredTechs = technicians
    .filter((t) => !blockedTechnicians.includes(t.id))
    .sort((a, b) => a.distance - b.distance);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (action === "cancel") {
      onConfirm(workOrder.id, action, { reason: cancellationReason });
      return;
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

  const descriptionMap = {
    assign: "Assign a technician to this work order.",
    reassign: "Change the assigned technician or schedule.",
    reschedule: "Change the scheduled date and time.",
    cancel:
      "Cancel this work order. The customer and technician will be notified.",
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={stop}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#c20001]">
              {titleMap[action]}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {descriptionMap[action]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Work order summary */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Work Order ID</p>
              <p className="font-medium text-[#c20001]">{workOrder.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Service Request</p>
              <p>{workOrder.srId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p>{workOrder.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p>{workOrder.category}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
        >
          {action === "cancel" ? (
            <>
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">
                    Warning: This action cannot be undone
                  </p>
                  <p className="mt-1 text-red-700">
                    Cancelling this work order will notify the assigned
                    technician and the customer.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cancel-reason"
                  className="text-sm font-medium text-gray-700"
                >
                  Cancellation Reason *
                </label>
                <textarea
                  id="cancel-reason"
                  required
                  rows={4}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  placeholder="Explain why this work order is being cancelled..."
                />
              </div>
            </>
          ) : (
            <>
              {/* Technician list (assign / reassign) */}
              {action !== "reschedule" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {action === "reassign"
                        ? "Reassign to Technician *"
                        : "Assign Technician *"}
                    </label>
                    <p className="text-xs text-gray-500">
                      Sorted by distance (nearest first)
                    </p>
                  </div>

                  {filteredTechs.length === 0 ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      No technicians available. All are blocked.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto rounded-lg border">
                      {filteredTechs.map((tech) => (
                        <button
                          key={tech.id}
                          type="button"
                          onClick={() => setSelectedTechnician(tech.id)}
                          className={`flex w-full items-center justify-between border-b px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${
                            selectedTechnician === tech.id
                              ? "bg-blue-50 border-l-4 border-l-[#c20001]"
                              : ""
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-gray-900">
                              {tech.name} – {tech.specialty}
                            </p>
                            <p className="text-xs text-gray-500">
                              <MapPin className="mr-1 inline-block h-3 w-3" />
                              {tech.distance} km • {tech.type}
                            </p>
                          </div>
                          <Badge
                            className={`${
                              tech.status === "Available"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {tech.status}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Date / time */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="scheduledDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    Scheduled Date *
                  </label>
                  <input
                    id="scheduledDate"
                    type="date"
                    min={today}
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="scheduledTime"
                    className="text-sm font-medium text-gray-700"
                  >
                    Scheduled Time *
                  </label>
                  <input
                    id="scheduledTime"
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1">
                <label
                  htmlFor="duration"
                  className="text-sm font-medium text-gray-700"
                >
                  Estimated Duration (hours) *
                </label>
                <select
                  id="duration"
                  required
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                >
                  {["1", "2", "3", "4", "6", "8"].map((h) => (
                    <option key={h} value={h}>
                      {h} hour{h !== "1" ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or special instructions for the technician..."
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                />
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
              action === "cancel"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#c20001] hover:bg-[#a00001]"
            }`}
          >
            {action === "cancel"
              ? "Confirm Cancellation"
              : action === "reschedule"
              ? "Save Schedule"
              : action === "reassign"
              ? "Update Work Order"
              : "Assign Work Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   PAYMENT VERIFICATION MODAL (Dispatcher side)
-------------------------------------------------------------------*/

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

/* ------------------------------------------------------------------
   MAIN PAGE – DISPATCHER WORK ORDERS
-------------------------------------------------------------------*/

export default function DispatcherWorkOrders() {
  const [workOrders, setWorkOrders] = useState(MOCK_WORK_ORDERS);
  const [technicians] = useState(MOCK_TECHNICIANS);
  const [blockedTechnicians] = useState(["TECH005"]); // example

  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [currentAction, setCurrentAction] = useState(null); // 'assign' | 'reassign' | 'reschedule' | 'cancel' | 'verifyPayment'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const technicianNameMap = technicians.reduce((acc, t) => {
    acc[t.id] = t.name;
    return acc;
  }, {});

  const getTechnicianName = (id) => {
    if (!id) return "";
    return technicianNameMap[id] || id;
  };

  /* ------------ Helpers ------------- */

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

  const filterWorkOrders = (status) => {
    let list = [...workOrders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (wo) =>
          wo.id.toLowerCase().includes(q) ||
          wo.customerName.toLowerCase().includes(q)
      );
    }

    if (status && status !== "all") {
      list = list.filter(
        (wo) => wo.status.toLowerCase() === status.toLowerCase()
      );
    }

    return list;
  };

  const getPaymentStatusLabel = (wo) => {
    if (wo.status !== "Completed") return null;
    if (!wo.paymentRecord) return "Pending Payment";

    switch (wo.paymentRecord.paymentStatus) {
      case "Verified":
        return "Paid Verified";
      case "Rejected":
        return "Rejected";
      case "Proof Uploaded":
      case "Pending":
      default:
        return "Pending Payment";
    }
  };

  /* ------------ Action handlers ------------- */

  const openAction = (wo, action) => {
    setSelectedWorkOrder(wo);
    setCurrentAction(action);
  };

  const closeModals = () => {
    setSelectedWorkOrder(null);
    setCurrentAction(null);
  };

  const handleWorkOrderAction = (workOrderId, action, data) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;

        if (action === "cancel") {
          return { ...wo, status: "Cancelled", notes: data.reason };
        }

        const updated = {
          ...wo,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          estimatedDuration: data.estimatedDuration,
          notes: data.notes,
        };

        if (action === "assign") {
          updated.assignedTechnician = data.assignedTechnician;
          updated.status = "Assigned";
        }
        if (action === "reassign") {
          updated.assignedTechnician = data.assignedTechnician;
        }
        if (action === "reschedule") {
          // keep current status
        }

        return updated;
      })
    );

    Swal.fire({
      icon: "success",
      title:
        action === "cancel"
          ? "Work order cancelled"
          : action === "reschedule"
          ? "Schedule updated"
          : "Work order updated",
      confirmButtonColor: "#c20001",
    });

    closeModals();
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
            commissionBookedDate: new Date().toISOString().split("T")[0],
          },
        };
      })
    );

    Swal.fire({
      icon: "success",
      title: "Payment verified",
      text: "Commission has been booked.",
      confirmButtonColor: "#c20001",
    });

    closeModals();
  };

  const handleRejectPayment = (reason) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== selectedWorkOrder.id) return wo;
        if (!wo.paymentRecord) return wo;

        return {
          ...wo,
          paymentRecord: {
            ...wo.paymentRecord,
            paymentStatus: "Rejected",
            rejectionReason: reason,
          },
        };
      })
    );

    Swal.fire({
      icon: "info",
      title: "Payment rejected",
      confirmButtonColor: "#c20001",
    });

    closeModals();
  };

  /* ------------ Render ------------- */

  const renderWorkOrders = (list) => {
    if (!list.length) {
      return (
        <div className="py-12 text-center text-gray-500">
          No work orders found
          {searchQuery ? " matching your search." : " in this category."}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((wo) => (
          <div
            key={wo.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50"
          >
            {/* Top row */}
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-[#c20001]">
                  {wo.id}
                </h3>
                <p className="text-xs text-gray-600">SR: {wo.srId}</p>
              </div>
              <Badge className={getPriorityColor(wo.priority)}>
                {wo.priority} Priority
              </Badge>
            </div>

            {/* Customer / category */}
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

            {/* Footer */}
            {wo.status !== "Cancelled" && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Left: payment status + action icons */}
                  <div className="flex items-center gap-2">
                    {/* Payment badge for completed */}
                    {wo.status === "Completed" && (() => {
                      const label = getPaymentStatusLabel(wo);
                      if (label === "Paid Verified") {
                        return (
                          <Badge className="bg-green-100 text-green-800">
                            <DollarSign className="mr-1 h-3 w-3" />
                            Paid Verified
                          </Badge>
                        );
                      }
                      if (wo.paymentRecord?.paymentStatus === "Rejected") {
                        return (
                          <div className="group relative inline-flex">
                            <Badge className="cursor-help bg-red-100 text-red-800">
                              <DollarSign className="mr-1 h-3 w-3" />
                              Payment Rejected
                            </Badge>
                            {wo.paymentRecord.rejectionReason && (
                              <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden max-w-xs whitespace-nowrap rounded bg-gray-900 px-3 py-2 text-xs text-white group-hover:block">
                                {wo.paymentRecord.rejectionReason}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <DollarSign className="mr-1 h-3 w-3" />
                          Pending Payment
                        </Badge>
                      );
                    })()}

                    {/* Dispatcher actions (non-completed) */}
                    {wo.status !== "Completed" && (
                      <div className="flex gap-1">
                        {(wo.status === "Pending" ||
                          wo.status === "Assigned") && (
                          <div className="group relative">
                            <button
                              type="button"
                              onClick={() =>
                                openAction(
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
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                              {wo.status === "Pending"
                                ? "Assign Technician"
                                : "Reassign"}
                            </div>
                          </div>
                        )}

                        {(wo.status === "Pending" ||
                          wo.status === "Assigned" ||
                          wo.status === "In Progress") && (
                          <div className="group relative">
                            <button
                              type="button"
                              onClick={() => openAction(wo, "reschedule")}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-xs text-gray-700 transition hover:bg-gray-100"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                              Reschedule
                            </div>
                          </div>
                        )}

                        {(wo.status === "Pending" ||
                          wo.status === "Assigned") && (
                          <div className="group relative">
                            <button
                              type="button"
                              onClick={() => openAction(wo, "cancel")}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-600 bg-white text-xs text-red-600 transition hover:bg-red-600 hover:text-white"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                              Cancel
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: payment call-to-action */}
                  {wo.status === "Completed" && (() => {
                    const status = wo.paymentRecord?.paymentStatus;

                    if (status === "Proof Uploaded") {
                      return (
                        <button
                          type="button"
                          onClick={() => openAction(wo, "verifyPayment")}
                          className="rounded-[10px] bg-[#c20001] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#c20001]/90"
                        >
                          Verify Payment
                        </button>
                      );
                    }

                    if (status === "Verified") {
                      return (
                        <span className="text-sm text-gray-500">
                          Paid Verified
                        </span>
                      );
                    }

                    if (status === "Rejected") {
                      return (
                        <button
                          type="button"
                          onClick={() => openAction(wo, "verifyPayment")}
                          className="rounded-[10px] border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                        >
                          View Details
                        </button>
                      );
                    }

                    return (
                      <button
                        type="button"
                        className="text-sm font-medium text-[#c20001] hover:underline"
                        onClick={() => {
                          Swal.fire({
                            icon: "success",
                            title: "Request sent",
                            text: "Request sent to technician to upload payment proof.",
                            confirmButtonColor: "#c20001",
                          });
                        }}
                      >
                        Request Proof
                      </button>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const listForActiveTab =
    activeTab === "all"
      ? filterWorkOrders("all")
      : filterWorkOrders(activeTab);

  return (
    <div className="p-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 pb-6 pt-6">
          {workOrders.length === 0 ? (
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
                  {[
                    { key: "all", label: "All", count: workOrders.length },
                    {
                      key: "pending",
                      label: "Pending",
                      count: filterWorkOrders("pending").length,
                    },
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
                  ].map((tab) => (
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

                <div className="mt-6">{renderWorkOrders(listForActiveTab)}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedWorkOrder &&
        currentAction &&
        ["assign", "reassign", "reschedule", "cancel"].includes(
          currentAction
        ) && (
          <WorkOrderActionsModal
            workOrder={selectedWorkOrder}
            action={currentAction}
            technicians={technicians}
            blockedTechnicians={blockedTechnicians}
            onClose={closeModals}
            onConfirm={handleWorkOrderAction}
          />
        )}

      {selectedWorkOrder &&
        currentAction === "verifyPayment" &&
        selectedWorkOrder.paymentRecord && (
          <PaymentVerificationModal
            isOpen={true}
            onClose={closeModals}
            workOrderId={selectedWorkOrder.id}
            customerName={selectedWorkOrder.customerName}
            technicianName={getTechnicianName(
              selectedWorkOrder.assignedTechnician
            )}
            technicianType={
              technicians.find(
                (t) => t.id === selectedWorkOrder.assignedTechnician
              )?.type
            }
            technicianRate={
              technicians.find(
                (t) => t.id === selectedWorkOrder.assignedTechnician
              )?.commissionRate || 10
            }
            paymentRecord={selectedWorkOrder.paymentRecord}
            onVerify={(amount) =>
              handleVerifyPayment(selectedWorkOrder.id, amount)
            }
            onReject={handleRejectPayment}
          />
        )}
    </div>
  );
}
