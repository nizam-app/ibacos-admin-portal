// src/pages/administrator/AdminWorkOrders.jsx
import { useEffect, useState } from "react";
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
  CheckCircle2,
} from "lucide-react";
import AdminWorkOrdersAPI from "../../api/adminWorkOrdersApi";

// ---------- Badge ----------
const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

// ------------------------------------------------------
// Payment Verification Modal (simple version)
// ------------------------------------------------------
const PaymentVerificationModal = ({
  isOpen,
  onClose,
  workOrderId,
  technicianName,
  technicianRate = 0,
  payment,
  onVerify,
  onReject,
}) => {
  const [action, setAction] = useState(null); // "verify" | "reject"
  const [reason, setReason] = useState("");

  if (!isOpen || !payment) return null;

  const stop = (e) => e.stopPropagation();

  const amount = payment.amount || payment.paymentAmount || 0;
  const commissionAmount = (amount * (technicianRate || 0)) / 100;

  const handleSubmit = () => {
    if (action === "verify") {
      onVerify(commissionAmount);
      Swal.fire("Success", "Payment verified", "success");
      onClose();
      return;
    }

    if (action === "reject") {
      if (!reason.trim()) {
        Swal.fire(
          "Missing reason",
          "Please provide a rejection reason",
          "warning"
        );
        return;
      }
      onReject(reason);
      Swal.fire("Updated", "Payment proof rejected", "info");
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        onClick={stop}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl"
      >
        {/* HEADER */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Verification
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              WO:{" "}
              <span className="font-medium text-[#c20001]">{workOrderId}</span>
            </p>
          </div>
          <CircleDollarSign className="h-6 w-6 text-[#c20001]" />
        </div>

        {/* BODY */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Technician</span>
            <span className="font-medium text-gray-900">
              {technicianName || "Unknown"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Payment Status</span>
            <Badge className="bg-gray-100 text-gray-800">
              {payment.paymentStatus}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Amount</span>
            <span className="font-medium text-gray-900">
              {amount
                ? `$${amount.toFixed ? amount.toFixed(2) : amount}`
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Configured Rate</span>
            <span className="font-medium text-gray-900">{technicianRate}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Calculated Commission</span>
            <span className="font-medium text-gray-900">
              ${commissionAmount.toFixed(2)}
            </span>
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Action</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction("verify")}
                className={`flex items-center justify-center rounded px-3 py-2 text-sm font-medium shadow-sm ${
                  action === "verify"
                    ? "bg-green-600 text-white"
                    : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                Verify
              </button>
              <button
                type="button"
                onClick={() => setAction("reject")}
                className={`flex items-center justify-center rounded px-3 py-2 text-sm font-medium shadow-sm ${
                  action === "reject"
                    ? "bg-red-600 text-white"
                    : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                Reject
              </button>
            </div>

            {action === "reject" && (
              <textarea
                rows={3}
                className="w-full rounded border p-2 text-sm"
                placeholder="Reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border text-sm"
          >
            Cancel
          </button>
          {action && (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-[#c20001] text-white text-sm"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------
export default function AdminWorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // ------------------------------
  // LOAD WORK ORDERS
  // ------------------------------
  const loadWorkOrders = async () => {
    try {
      const res = await AdminWorkOrdersAPI.getWorkOrders({
        limit: 200, // all statuses
      });

      const list = res.data.workOrders || res.data || [];
      setWorkOrders(list);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load work orders", "error");
    }
  };

  // ------------------------------
  // LOAD TECHNICIANS
  // ------------------------------
  const loadTechnicians = async () => {
    try {
      const res = await AdminWorkOrdersAPI.getNearbyTechnicians({
        latitude: -1.286389,
        longitude: 36.817223,
        maxDistance: 500,
        status: "ONLINE",
      });

      setTechnicians(res.data.technicians || []);
    } catch (err) {
      console.error(err);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    loadWorkOrders();
    loadTechnicians();
  }, []);

  // ------------------------------
  // Helpers
  // ------------------------------

  const normalizeStatusKey = (value) =>
    (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_"); // "IN PROGRESS" -> "in_progress"

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
      case "High":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "LOW":
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatus = (wo) => {
    if (wo.status !== "COMPLETED") return null;
    if (!wo.payment) return "Pending Payment";

    switch (wo.payment.paymentStatus) {
      case "VERIFIED":
        return "Paid Verified";
      case "REJECTED":
        return "Payment Rejected";
      case "UPLOADED":
      default:
        return "Pending Payment";
    }
  };

  const handleActionClick = (wo, action) => {
    setSelectedWorkOrder(wo);
    setCurrentAction(action);
  };

  // ------------------------------------------------------
  // Handle Confirm Action (Assign / Reassign / Reschedule / Cancel)
  // ------------------------------------------------------
  const handleConfirmAction = async (workOrderId, action, data) => {
    try {
      if (action === "assign" || action === "reassign") {
        await AdminWorkOrdersAPI.reassignWorkOrder(workOrderId, {
          technicianId: data.assignedTechnician,
          reason: data.notes || "",
        });
      }

      if (action === "reschedule") {
        await AdminWorkOrdersAPI.rescheduleWorkOrder(workOrderId, {
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          estimatedDuration: Number(data.estimatedDuration),
          notes: data.notes,
        });
      }

      if (action === "cancel") {
        await AdminWorkOrdersAPI.cancelWorkOrder(workOrderId, {
          reason: data.reason,
        });
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Work order updated successfully.",
        confirmButtonColor: "#c20001",
      });

      setCurrentAction(null);
      setSelectedWorkOrder(null);
      loadWorkOrders();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update work order", "error");
    }
  };

  // ------------------------------------------------------
  // Payment Verification
  // ------------------------------------------------------
  const handleVerifyPayment = async (paymentId, commissionAmount) => {
    try {
      await AdminWorkOrdersAPI.verifyPayment(paymentId, {
        commissionAmount,
      });

      Swal.fire("Success", "Payment verified", "success");
      setSelectedWorkOrder(null);
      setCurrentAction(null);
      loadWorkOrders();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to verify payment", "error");
    }
  };

  const handleRejectPayment = async (paymentId, reason) => {
    try {
      await AdminWorkOrdersAPI.rejectPayment(paymentId, { reason });

      Swal.fire("Rejected", "Payment proof rejected", "info");
      setSelectedWorkOrder(null);
      setCurrentAction(null);
      loadWorkOrders();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to reject payment", "error");
    }
  };

  // ------------------------------------------------------
  // Filter Work Orders (search + tabs)
  // ------------------------------------------------------
  const filterWorkOrders = (statusKey = "all") => {
    let filtered = [...workOrders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (wo) =>
          wo.woNumber?.toLowerCase().includes(q) ||
          wo.customer?.name?.toLowerCase().includes(q)
      );
    }

    if (statusKey !== "all") {
      const target = normalizeStatusKey(statusKey);
      filtered = filtered.filter(
        (wo) => normalizeStatusKey(wo.status) === target
      );
    }

    return filtered;
  };

  // ------------------------------------------------------
  // MODAL: Work Order Actions (Assign/Reassign/Reschedule/Cancel)
  // ------------------------------------------------------
  const WorkOrderActionsModal = ({
    workOrder,
    action,
    technicians,
    onClose,
    onConfirm,
  }) => {
    const [selectedTechnician, setSelectedTechnician] = useState(
      workOrder.assignedTechnicianId || ""
    );
    const [scheduledDate, setScheduledDate] = useState(
      workOrder.scheduledDate?.split("T")[0] || ""
    );
    const [scheduledTime, setScheduledTime] = useState(
      workOrder.scheduledTime || ""
    );
    const [estimatedDuration, setEstimatedDuration] = useState(
      workOrder.estimatedDuration || 2
    );
    const [notes, setNotes] = useState(workOrder.notes || "");
    const [cancelReason, setCancelReason] = useState("");

    if (!action) return null;

    const stop = (e) => e.stopPropagation();

    const handleSubmit = (e) => {
      e.preventDefault();

      if (action === "cancel") {
        if (!cancelReason.trim()) {
          Swal.fire("Missing Reason", "Provide a cancellation reason", "warning");
          return;
        }

        onConfirm(workOrder.id, "cancel", { reason: cancelReason });
        return;
      }

      if (!scheduledDate || !scheduledTime) {
        Swal.fire("Missing Schedule", "Select date & time", "warning");
        return;
      }

      if (action === "assign" || action === "reassign") {
        if (!selectedTechnician) {
          Swal.fire("Technician Required", "Choose a technician", "warning");
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

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div
          onClick={stop}
          className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {action === "assign"
                  ? "Assign Technician"
                  : action === "reassign"
                  ? "Reassign Technician"
                  : action === "reschedule"
                  ? "Reschedule Work Order"
                  : "Cancel Work Order"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                WO:{" "}
                <span className="font-medium text-[#c20001]">
                  {workOrder.woNumber}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          {/* BODY */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* CANCEL MODE */}
            {action === "cancel" ? (
              <>
                <textarea
                  rows={3}
                  placeholder="Reason for cancellation..."
                  className="w-full rounded border p-2"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </>
            ) : (
              <>
                {/* Technicians */}
                {(action === "assign" || action === "reassign") && (
                  <div className="space-y-2">
                    {technicians.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setSelectedTechnician(t.id)}
                        className={`w-full flex justify-between items-center rounded px-3 py-2 border ${
                          selectedTechnician === t.id
                            ? "border-[#c20001] bg-gray-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div>
                          <p className="font-medium">{t.name}</p>
                          <p className="text-xs text-gray-500">
                            {t.type} • {t.specialization}
                          </p>
                        </div>
                        {selectedTechnician === t.id && (
                          <CheckCircle2 className="h-4 w-4 text-[#c20001]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Schedule */}
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="date"
                    className="border rounded p-2"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                  <input
                    type="time"
                    className="border rounded p-2"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                  <select
                    className="border rounded p-2"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                  >
                    <option value="1">1h</option>
                    <option value="2">2h</option>
                    <option value="3">3h</option>
                    <option value="4">4h</option>
                    <option value="6">6h</option>
                    <option value="8">8h</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  placeholder="Notes..."
                  className="w-full rounded border p-2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </>
            )}

            {/* FOOTER */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded text-white bg-[#c20001]"
              >
                {action === "cancel" ? "Confirm Cancel" : "Confirm Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ------------------------------------------------------
  // RENDER WORK ORDER CARDS
  // ------------------------------------------------------
  const renderWorkOrders = (filteredList) => {
    if (!filteredList.length) {
      return (
        <div className="py-12 text-center text-gray-500">
          <p>No work orders found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredList.map((wo) => {
          const paymentStatus = getPaymentStatus(wo);
          const technician = technicians.find((t) => t.id === wo.technicianId);

          return (
            <div
              key={wo.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#c20001]">
                    {wo.woNumber}
                  </h3>
                  <p className="text-xs text-gray-600">SR: {wo.srNumber}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge className="bg-gray-100 text-gray-800">
                    {wo.status}
                  </Badge>

                  <Badge className={getPriorityColor(wo.priority)}>
                    Priority: {wo.priority}
                  </Badge>
                </div>
              </div>

              {/* Customer + Category */}
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-900">
                <div>
                  <p className="text-xs text-gray-600">Customer</p>
                  <p>{wo.customer?.name}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600">Category</p>
                  <p>{wo.category?.name}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{wo.scheduledDate}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{wo.scheduledTime}</span>
                </div>

                {technician ? (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{technician.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600">
                    <User className="h-4 w-4" />
                    <span>Unassigned</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{wo.estimatedDuration}h</span>
                </div>
              </div>

              {/* Notes */}
              {wo.notes && (
                <div className="mt-3 border-t pt-3 text-sm text-gray-700">
                  <p className="text-xs text-gray-600">Notes</p>
                  <p>{wo.notes}</p>
                </div>
              )}

              {/* Footer actions */}
              <div className="mt-4 flex flex-wrap justify-between items-center gap-3 border-t pt-4">
                {/* Left: Payment badge */}
                {wo.status === "COMPLETED" && (
                  <div>
                    {paymentStatus === "Paid Verified" && (
                      <Badge className="bg-green-100 text-green-700">
                        <CircleDollarSign className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}

                    {paymentStatus === "Pending Payment" && (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        <CircleDollarSign className="h-3 w-3 mr-1" />
                        Pending Payment
                      </Badge>
                    )}

                    {paymentStatus === "Payment Rejected" && (
                      <Badge className="bg-red-100 text-red-700">
                        <CircleDollarSign className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </div>
                )}

                {/* Right: Action buttons */}
                <div className="flex gap-2">
                  {/* Assign / Reassign */}
                  {wo.status !== "COMPLETED" &&
                    (wo.status === "PENDING" || wo.status === "ASSIGNED") && (
                      <button
                        onClick={() =>
                          handleActionClick(
                            wo,
                            wo.status === "PENDING" ? "assign" : "reassign"
                          )
                        }
                        className="h-8 w-8 flex items-center justify-center rounded border bg-white hover:bg-gray-100"
                      >
                        {wo.status === "PENDING" ? (
                          <UserCheck className="h-4 w-4" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </button>
                    )}

                  {/* Reschedule */}
                  {["PENDING", "ASSIGNED", "IN_PROGRESS"].includes(
                    wo.status
                  ) && (
                    <button
                      onClick={() => handleActionClick(wo, "reschedule")}
                      className="h-8 w-8 flex items-center justify-center rounded border bg-white hover:bg-gray-100"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                  )}

                  {/* Cancel */}
                  {["PENDING", "ASSIGNED"].includes(wo.status) && (
                    <button
                      onClick={() => handleActionClick(wo, "cancel")}
                      className="h-8 w-8 flex items-center justify-center rounded border border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}

                  {/* Payment Verification */}
                  {wo.status === "COMPLETED" && (
                    <>
                      {wo.payment?.paymentStatus === "UPLOADED" && (
                        <button
                          onClick={() =>
                            handleActionClick(wo, "verifyPayment")
                          }
                          className="px-4 py-2 rounded bg-[#c20001] text-white text-sm"
                        >
                          Verify Payment
                        </button>
                      )}

                      {wo.payment?.paymentStatus === "VERIFIED" && (
                        <button
                          onClick={() =>
                            handleActionClick(wo, "verifyPayment")
                          }
                          className="px-4 py-2 rounded border text-sm"
                        >
                          View Verification
                        </button>
                      )}

                      {wo.payment?.paymentStatus === "REJECTED" && (
                        <button
                          onClick={() =>
                            handleActionClick(wo, "verifyPayment")
                          }
                          className="px-4 py-2 rounded border text-sm"
                        >
                          Update Decision
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ------------------------------------------------------
  // MAIN RENDER SECTION
  // ------------------------------------------------------
  const tabs = [
    { key: "all", label: "All", count: filterWorkOrders("all").length },
    { key: "pending", label: "Pending", count: filterWorkOrders("pending").length },
    { key: "assigned", label: "Assigned", count: filterWorkOrders("assigned").length },
    {
      key: "in_progress",
      label: "In Progress",
      count: filterWorkOrders("in_progress").length,
    },-
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

  const currentList = filterWorkOrders(activeTab);

  return (
    <div className="rounded-lg bg-white shadow-sm">
      {/* HEADER */}
      <div className="px-6 py-6 border-b border-gray-300">
        <h1 className="text-lg font-semibold text-gray-900">
          Work Orders (Admin)
        </h1>
        <p className="text-sm text-gray-500">
          Manage all assignments, schedules, payments & audit logs.
        </p>
      </div>

      <div className="px-6 py-6">
        {/* SEARCH */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            <input
              placeholder="Search by WO number or customer..."
              className="w-full pl-10 pr-4 py-2 border-gray-300 rounded border text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* TABS */}
        <div className="grid grid-cols-6 bg-gray-100 rounded p-1 text-xs font-medium text-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-1 rounded ${
                activeTab === tab.key
                  ? "bg-white text-[#c20001] shadow"
                  : "hover:bg-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="mt-6">{renderWorkOrders(currentList)}</div>
      </div>

      {/* ACTION MODALS */}
      {selectedWorkOrder &&
        currentAction &&
        currentAction !== "verifyPayment" && (
          <WorkOrderActionsModal
            workOrder={selectedWorkOrder}
            action={currentAction}
            technicians={technicians}
            onClose={() => {
              setSelectedWorkOrder(null);
              setCurrentAction(null);
            }}
            onConfirm={handleConfirmAction}
          />
        )}

      {/* PAYMENT VERIFICATION MODAL */}
      {selectedWorkOrder &&
        currentAction === "verifyPayment" &&
        selectedWorkOrder.payment && (
          <PaymentVerificationModal
            isOpen={true}
            onClose={() => {
              setSelectedWorkOrder(null);
              setCurrentAction(null);
            }}
            workOrderId={selectedWorkOrder.woNumber}
            technicianRate={
              technicians.find((t) => t.id === selectedWorkOrder.technicianId)
                ?.commissionRate
            }
            technicianName={
              technicians.find((t) => t.id === selectedWorkOrder.technicianId)
                ?.name
            }
            payment={selectedWorkOrder.payment}
            onVerify={(amount) =>
              handleVerifyPayment(selectedWorkOrder.payment.id, amount)
            }
            onReject={(reason) =>
              handleRejectPayment(selectedWorkOrder.payment.id, reason)
            }
          />
        )}
    </div>
  );
}
