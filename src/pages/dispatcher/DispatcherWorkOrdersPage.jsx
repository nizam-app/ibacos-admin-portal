// DispatcherWorkOrdersPage.jsx
import React, { useState } from "react";
import {
  Search,
  Calendar,
  Clock,
  User,
  UserCheck,
  RefreshCw,
  XCircle,
  X,
  DollarSign,
  CreditCard,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Technician id -> name map
const technicianNameMap = {
  TECH001: "Mike Johnson",
  TECH002: "Sarah Davis",
  TECH003: "Robert Chen",
  TECH004: "Lisa Martinez",
  TECH005: "James Wilson",
  TECH006: "Emily Brown",
};

// --- Mock Work Orders (same vibe as Figma) ---
const initialWorkOrders = [
  {
    id: "WO0001",
    srId: "SR-2024-0995",
    customerName: "Ahmed Al-Mansoori",
    category: "Electrical",
    priority: "High",
    status: "Pending",
    scheduledDate: "2024-11-05",
    scheduledTime: "10:00 AM",
    assignedTechnician: "TECH001",
    estimatedDuration: 2,
    notes: "Fixed electrical panel issue",
    paymentRecord: null,
  },
  {
    id: "WO0002",
    srId: "SR-2024-0996",
    customerName: "Fatima Hassan",
    category: "Plumbing",
    priority: "Medium",
    status: "Completed",
    scheduledDate: "2024-11-06",
    scheduledTime: "02:00 PM",
    assignedTechnician: "TECH002",
    estimatedDuration: 1.5,
    notes: "Repaired kitchen sink leak",
    technicianType: "Internal Employee",
    technicianRate: 6,
    paymentRecord: {
      paymentStatus: "Verified",
      paymentProof: {
        uploadedBy: "TECH002",
        uploadDate: "2024-11-06 16:45",
        paymentMethod: "Mobile Money",
        amount: 420,
        proofImageUrl: "/payment-proof-example.jpg", // নিজের ইমেজ path ব্যবহার করো
        notes: "Payment received on site after service completion.",
      },
      commissionAmount: 25.2,
      commissionBooked: true,
      commissionBookedDate: "2024-11-07",
      commissionPaid: false,
      verifiedBy: "Dispatcher DS",
      verifiedDate: "2024-11-07",
    },
  },
  {
    id: "WO0003",
    srId: "SR-2024-0997",
    customerName: "Mohammed Khalil",
    category: "HVAC",
    priority: "High",
    status: "In Progress",
    scheduledDate: "2024-11-07",
    scheduledTime: "09:30 AM",
    assignedTechnician: "TECH003",
    estimatedDuration: 3,
    notes: "AC maintenance and gas refill",
    paymentRecord: null,
  },
  {
    id: "WO0004",
    srId: "SR-2024-0998",
    customerName: "Sara Abdullah",
    category: "General",
    priority: "Low",
    status: "Completed",
    scheduledDate: "2024-11-07",
    scheduledTime: "01:00 PM",
    assignedTechnician: "TECH004",
    estimatedDuration: 1,
    notes: "Door lock replacement",
    technicianType: "Freelancer",
    technicianRate: 12,
    paymentRecord: {
      paymentStatus: "Proof Uploaded",
      paymentProof: {
        uploadedBy: "TECH004",
        uploadDate: "2024-11-07 15:10",
        paymentMethod: "Mobile Money",
        amount: 620,
        proofImageUrl: "/payment-proof-example.jpg",
        notes: "Payment received via mobile money after service completion.",
      },
    },
  },
  {
    id: "WO0005",
    srId: "SR-2024-0999",
    customerName: "Ali Ahmed",
    category: "Electrical",
    priority: "High",
    status: "Completed",
    scheduledDate: "2024-11-08",
    scheduledTime: "11:30 AM",
    assignedTechnician: "TECH001",
    estimatedDuration: 2,
    notes: "Circuit breaker replacement",
    technicianType: "Freelancer",
    technicianRate: 10,
    paymentRecord: {
      paymentStatus: "Rejected",
      paymentProof: {
        uploadedBy: "TECH001",
        uploadDate: "2024-11-08 13:05",
        paymentMethod: "Cash",
        amount: 300,
        proofImageUrl: "/payment-proof-example.jpg",
        notes: "Customer paid in cash.",
      },
      rejectionReason: "Screenshot is blurry, unable to read transaction details.",
      verifiedBy: "Dispatcher DS",
      verifiedDate: "2024-11-08",
    },
  },
  {
    id: "WO0006",
    srId: "SR-2024-1000",
    customerName: "Mariam Ali",
    category: "Electrical",
    priority: "Medium",
    status: "Assigned",
    scheduledDate: "2024-11-09",
    scheduledTime: "03:00 PM",
    assignedTechnician: "TECH005",
    estimatedDuration: 1,
    notes: "Light fixture installation",
    paymentRecord: null,
  },
  {
    id: "WO0007",
    srId: "SR-2024-1001",
    customerName: "Omar Saeed",
    category: "HVAC",
    priority: "Low",
    status: "Cancelled",
    scheduledDate: "2024-11-03",
    scheduledTime: "12:00 PM",
    assignedTechnician: "TECH003",
    estimatedDuration: 2,
    notes: "Job cancelled by customer.",
    paymentRecord: null,
  },
  {
    id: "WO0008",
    srId: "SR-2024-1002",
    customerName: "Layla Mohammed",
    category: "General",
    priority: "Low",
    status: "Assigned",
    scheduledDate: "2024-11-10",
    scheduledTime: "10:30 AM",
    assignedTechnician: "TECH004",
    estimatedDuration: 1,
    notes: "Window repair.",
    paymentRecord: null,
  },
];

// ---------------- ROOT PAGE -----------------

function DispatcherWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);

  // commission verify
  const handleVerifyPayment = (workOrderId, commissionAmount) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === workOrderId
          ? {
              ...wo,
              paymentRecord: {
                ...wo.paymentRecord,
                paymentStatus: "Verified",
                commissionAmount,
                verifiedBy: "Dispatcher DS",
                verifiedDate: new Date().toISOString().slice(0, 10),
                commissionBooked: true,
                commissionBookedDate: new Date().toISOString().slice(0, 10),
                commissionPaid: false,
              },
            }
          : wo
      )
    );
  };

  // payment reject
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
                verifiedBy: "Dispatcher DS",
                verifiedDate: new Date().toISOString().slice(0, 10),
              },
            }
          : wo
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Work Orders Management
        </h1>
        <p className="text-sm text-gray-500">
          Assign, reassign, and manage work orders
        </p>
      </div>

      {/* List + filters */}
      <WorkOrdersList
        workOrders={workOrders}
        onVerifyPayment={handleVerifyPayment}
        onRejectPayment={handleRejectPayment}
      />
    </div>
  );
}

export default DispatcherWorkOrdersPage;

// --------------- LIST COMPONENT ----------------

function WorkOrdersList({ workOrders, onVerifyPayment, onRejectPayment }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

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

  const getPaymentStatusLabel = (wo) => {
    if (wo.status !== "Completed") return null;
    const record = wo.paymentRecord;
    if (!record) return "Pending Payment";

    switch (record.paymentStatus) {
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

  const getTechnicianName = (id) => technicianNameMap[id] || id;

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

  const countByStatus = (status) =>
    status === "all" ? workOrders.length : filterWorkOrders(status).length;

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "assigned", label: "Assigned" },
    { id: "in progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const openPaymentModal = (wo) => {
    if (!wo.paymentRecord) return;
    setSelectedWorkOrder(wo);
  };

  const closePaymentModal = () => setSelectedWorkOrder(null);

  const renderWorkOrders = (items) => {
    if (!items.length) {
      return (
        <div className="py-12 text-center text-gray-500 text-sm">
          No work orders
          {searchQuery ? " match your search." : " in this category."}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((wo) => {
          const paymentLabel = getPaymentStatusLabel(wo);
          const paymentStatus = wo.paymentRecord?.paymentStatus;

          return (
            <div
              key={wo.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              {/* Top row: id + priority */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-[#c20001] font-medium mb-1">{wo.id}</h3>
                  <p className="text-xs text-gray-500">SR: {wo.srId}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${getPriorityColor(
                    wo.priority
                  )}`}
                >
                  {wo.priority} Priority
                </span>
              </div>

              {/* Main info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="text-gray-900">{wo.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="text-gray-900">{wo.category}</p>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{wo.scheduledDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{wo.scheduledTime}</span>
                </div>
                {wo.assignedTechnician ? (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{getTechnicianName(wo.assignedTechnician)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600">
                    <User className="w-4 h-4" />
                    <span>Unassigned</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{wo.estimatedDuration}h duration</span>
                </div>
              </div>

              {/* Notes */}
              {wo.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                  <p className="text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700">{wo.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Left side: payment status or status */}
                <div className="flex items-center gap-2">
                  {wo.status === "Completed" && paymentLabel && (
                    <>
                      {paymentLabel === "Paid Verified" && (
                        <span className="inline-flex items-center rounded-full px-3 py-1 bg-green-100 text-green-800 text-xs font-medium">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {paymentLabel}
                        </span>
                      )}

                      {paymentLabel === "Pending Payment" && (
                        <span className="inline-flex items-center rounded-full px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {paymentLabel}
                        </span>
                      )}

                      {paymentLabel === "Payment Rejected" && (
                        <span className="inline-flex items-center rounded-full px-3 py-1 bg-red-100 text-red-800 text-xs font-medium">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {paymentLabel}
                        </span>
                      )}
                    </>
                  )}

                  {wo.status !== "Completed" && (
                    <span className="inline-flex items-center rounded-full px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium">
                      {wo.status}
                    </span>
                  )}
                </div>

                {/* Right side: actions */}
                {wo.status === "Completed" ? (
                  (() => {
                    const record = wo.paymentRecord;
                    const status = record?.paymentStatus;

                    if (status === "Proof Uploaded") {
                      return (
                        <button
                          onClick={() => openPaymentModal(wo)}
                          className="inline-flex items-center rounded-[10px] bg-[#c20001] px-4 py-2 text-xs font-medium text-white hover:bg-[#a00001]"
                        >
                          Verify Payment
                        </button>
                      );
                    }

                    if (status === "Verified") {
                      return (
                        <span className="text-xs text-gray-500">
                          Paid Verified
                        </span>
                      );
                    }

                    if (status === "Rejected") {
                      return (
                        <button
                          onClick={() => openPaymentModal(wo)}
                          className="inline-flex items-center rounded-[10px] border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View Details
                        </button>
                      );
                    }

                    // pending upload
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            "Request sent to technician to upload payment proof."
                          )
                        }
                        className="text-xs font-medium text-[#c20001] hover:underline"
                      >
                        Request Proof
                      </button>
                    );
                  })()
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Assign / Reassign */}
                    {(wo.status === "Pending" || wo.status === "Assigned") && (
                      <button
                        type="button"
                        title={
                          wo.status === "Pending"
                            ? "Assign Technician"
                            : "Reassign Technician"
                        }
                        onClick={() =>
                          alert(
                            `${
                              wo.status === "Pending" ? "Assign" : "Reassign"
                            } clicked for ${wo.id}`
                          )
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                      >
                        {wo.status === "Pending" ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Reschedule */}
                    {(wo.status === "Pending" ||
                      wo.status === "Assigned" ||
                      wo.status === "In Progress") && (
                      <button
                        type="button"
                        title="Reschedule"
                        onClick={() =>
                          alert(`Reschedule clicked for ${wo.id}`)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    )}

                    {/* Cancel */}
                    {(wo.status === "Pending" || wo.status === "Assigned") && (
                      <button
                        type="button"
                        title="Cancel work order"
                        onClick={() =>
                          alert(`Cancel clicked for ${wo.id}`)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-500 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const visibleList = filterWorkOrders(activeTab);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Search */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by WO ID or Customer…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#c20001] focus:ring-2 focus:ring-[#c20001]/20"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-2 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-3 py-1 font-medium ${
                activeTab === tab.id
                  ? "bg-[#c20001] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label} ({countByStatus(tab.id)})
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-6 pb-6 pt-4">{renderWorkOrders(visibleList)}</div>

      {/* Payment verification modal */}
      {selectedWorkOrder && selectedWorkOrder.paymentRecord && (
        <PaymentVerificationModal
          workOrderId={selectedWorkOrder.id}
          customerName={selectedWorkOrder.customerName}
          technicianName={getTechnicianName(
            selectedWorkOrder.assignedTechnician
          )}
          technicianType={selectedWorkOrder.technicianType || "Freelancer"}
          technicianRate={selectedWorkOrder.technicianRate || 10}
          paymentRecord={selectedWorkOrder.paymentRecord}
          onClose={closePaymentModal}
          onVerify={(commissionAmount) => {
            onVerifyPayment &&
              onVerifyPayment(selectedWorkOrder.id, commissionAmount);
            closePaymentModal();
          }}
          onReject={(reason) => {
            onRejectPayment &&
              onRejectPayment(selectedWorkOrder.id, reason);
            closePaymentModal();
          }}
        />
      )}
    </div>
  );
}

// --------------- PAYMENT VERIFICATION MODAL ---------------

function PaymentVerificationModal({
  workOrderId,
  customerName,
  technicianName,
  technicianType = "Freelancer",
  technicianRate = 10,
  paymentRecord,
  onClose,
  onVerify,
  onReject,
}) {
  const [action, setAction] = useState(null); // 'verify' | 'reject'
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionCompleted, setActionCompleted] = useState(null); // 'verified' | 'rejected'

  const paymentLabel =
    technicianType === "Freelancer" ? "Commission" : "Bonus";

  const hasProof = !!paymentRecord?.paymentProof;

  const calculatedAmount =
    hasProof && paymentRecord.paymentProof
      ? paymentRecord.paymentProof.amount * (technicianRate / 100)
      : 0;

  const handleSubmit = () => {
    if (action === "verify") {
      onVerify && onVerify(calculatedAmount);
      setActionCompleted("verified");
    } else if (action === "reject") {
      if (!rejectionReason.trim()) {
        alert("Please provide a rejection reason");
        return;
      }
      onReject && onReject(rejectionReason.trim());
      setActionCompleted("rejected");
    }
  };

  const handleClose = () => {
    setAction(null);
    setRejectionReason("");
    setActionCompleted(null);
    onClose && onClose();
  };

  const status = paymentRecord.paymentStatus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Payment Verification
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Review payment proof and verify or reject the payment for{" "}
              {workOrderId}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Basic info */}
          <div className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#c20001] font-medium">{workOrderId}</span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${
                  status === "Proof Uploaded"
                    ? "bg-yellow-500 text-white"
                    : status === "Verified"
                    ? "bg-green-500 text-white"
                    : status === "Rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="text-gray-900">{customerName}</p>
              </div>
              <div>
                <p className="text-gray-500">Technician</p>
                <p className="text-gray-900">{technicianName}</p>
              </div>
            </div>
          </div>

          {/* Payment proof details */}
          {hasProof && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#c20001]">
                Payment Proof Details
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Uploaded By</p>
                    <p className="text-gray-900">
                      {paymentRecord.paymentProof.uploadedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Upload Date</p>
                    <p className="text-gray-900">
                      {paymentRecord.paymentProof.uploadDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Payment Method</p>
                    <p className="text-gray-900">
                      {paymentRecord.paymentProof.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="text-gray-900">
                      $
                      {paymentRecord.paymentProof.amount
                        .toFixed(2)
                        .toString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Proof image */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-700">
                  <ImageIcon className="h-4 w-4" />
                  Payment Proof
                </p>
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-white">
                    <img
                      src={paymentRecord.paymentProof.proofImageUrl}
                      alt="Payment proof"
                      className="max-h-full max-w-full rounded-lg object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Technician notes */}
              {paymentRecord.paymentProof.notes && (
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-700">
                    Technician Notes
                  </p>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                    {paymentRecord.paymentProof.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rejection info */}
          {status === "Rejected" && paymentRecord.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Rejection Reason</p>
                  <p className="mt-1 text-red-700">
                    {paymentRecord.rejectionReason}
                  </p>
                  {paymentRecord.verifiedBy && (
                    <p className="mt-2 text-xs text-red-600">
                      Rejected by {paymentRecord.verifiedBy} on{" "}
                      {paymentRecord.verifiedDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Verified info */}
          {status === "Verified" && (
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
                Verified on {paymentRecord.verifiedDate} by{" "}
                {paymentRecord.verifiedBy}
              </span>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                  <div className="space-y-2">
                    <p className="font-medium text-green-900">
                      Payment Verified
                    </p>
                    {paymentRecord.commissionBooked && (
                      <p className="text-green-700">
                        ✓ {paymentLabel} booked on{" "}
                        {paymentRecord.commissionBookedDate}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-green-700">{paymentLabel}</p>
                        <p className="text-green-800">
                          $
                          {paymentRecord.commissionAmount
                            ?.toFixed(2)
                            .toString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-green-700">Payment Status</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            paymentRecord.commissionPaid
                              ? "bg-green-600 text-white"
                              : "bg-yellow-600 text-white"
                          }`}
                        >
                          {paymentRecord.commissionPaid ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto calculated commission/bonus (when proof uploaded) */}
          {status === "Proof Uploaded" && hasProof && (
            <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs sm:text-sm">
              <h3 className="font-medium text-gray-900">{paymentLabel}</h3>
              <div className="space-y-1">
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
              </div>
              <p className="mt-1 text-[11px] text-gray-600 italic">
                Rates are preconfigured and cannot be changed here.
              </p>
            </div>
          )}

          {/* Action section (only when proof uploaded) */}
          {status === "Proof Uploaded" && (
            <div className="space-y-4 border-t border-gray-200 pt-4 text-xs sm:text-sm">
              <p className="font-medium text-gray-700">Verification Action</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAction("verify")}
                  disabled={!!actionCompleted}
                  className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium ${
                    action === "verify"
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Verify Payment
                </button>
                <button
                  type="button"
                  onClick={() => setAction("reject")}
                  disabled={!!actionCompleted}
                  className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium ${
                    action === "reject"
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Reject Payment
                </button>
              </div>

              {action === "verify" && !actionCompleted && (
                <div className="space-y-1 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800">
                  <p>• Payment will be marked as Verified.</p>
                  <p>
                    • {paymentLabel} of ${calculatedAmount.toFixed(2)} will be
                    automatically booked.
                  </p>
                  <p>• Technician will be notified.</p>
                </div>
              )}

              {actionCompleted === "verified" && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800">
                  ✓ Payment verified • {paymentLabel} booked.
                </div>
              )}

              {action === "reject" && !actionCompleted && (
                <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <div>
                    <label
                      htmlFor="rejectionReason"
                      className="mb-1 block text-xs font-medium"
                    >
                      Rejection Reason *
                    </label>
                    <textarea
                      id="rejectionReason"
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why the payment proof is being rejected..."
                      className="w-full rounded-md border border-red-200 bg-white p-2 text-xs outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
                    />
                  </div>
                  <div>
                    <p>• Technician must reupload clear payment proof.</p>
                    <p>• Work order will remain in Completed status.</p>
                    <p>• No commission will be booked until verified.</p>
                  </div>
                </div>
              )}

              {actionCompleted === "rejected" && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  ✓ Payment rejected • Awaiting new proof.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {actionCompleted || status !== "Proof Uploaded" ? "Close" : "Cancel"}
          </button>

          {status === "Proof Uploaded" && action && !actionCompleted && (
            <button
              type="button"
              onClick={handleSubmit}
              className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white ${
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
