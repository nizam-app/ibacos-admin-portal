// src/pages/dispatcher/DispatcherWorkOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  Calendar,
  Clock,
  User,
  RefreshCw,
  XCircle,
  Search,
  DollarSign,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

import DispatcherAPI from "../../api/dispatcherApi";
import WorkOrderActionsModal from "./WorkOrderActionsModal";
import PaymentVerificationModal from "../../components/PaymentVerificationModal";

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

/* Mapping helpers */

const mapBackendStatusToLabel = (status) => {
  switch (status) {
    case "UNASSIGNED":
      return "Pending";
    case "ASSIGNED":
      return "Assigned";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status || "Unknown";
  }
};

const mapLabelToBackendStatus = (tabKey) => {
  switch (tabKey) {
    case "pending":
      return "UNASSIGNED";
    case "assigned":
      return "ASSIGNED";
    case "in progress":
      return "IN_PROGRESS";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    default:
      return undefined; // "all" -> no filter
  }
};

const mapBackendPriorityToLabel = (priority) => {
  switch (priority) {
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
    default:
      return priority || "Medium";
  }
};

/* Nearby technician mapper – backend → UI */
const mapNearbyTech = (t) => ({
  id: t.id,
  name: t.name,
  specialty: t.specialization || "General",
  type: t.type === "FREELANCER" ? "Freelancer" : "Internal Employee",
  commissionRate:
    typeof t.rates?.commissionRate === "number"
      ? t.rates.commissionRate * 100 // 0.35 → 35
      : 10,
  bonusRate:
    typeof t.rates?.bonusRate === "number" ? t.rates.bonusRate * 100 : 5,
  distance: t.distance,
  distanceKm: t.distanceKm,
  // status: t.availability === "AVAILABLE" ? "Available" : "Busy",
  status: t.locationStatus === "ONLINE" ? "Online" : "Offline",
  openJobs: t.openJobs || [],
});

/* ------------------------------------------------------------------
   TIMELINE / AUDIT HELPERS
-------------------------------------------------------------------*/

const mapTimelineEventLabel = (event) => {
  switch (event) {
    case "PAYMENT_VERIFIED":
      return "Paid Verified";
    case "PAYMENT_UPLOADED":
      return "Payment Proof Uploaded";
    case "DISPATCHED":
      return "Dispatched";
    case "ACCEPTED":
      return "Accepted";
    case "STARTED":
      return "Work Started";
    case "COMPLETED":
      return "Completed";
    case "CREATED":
      return "Created";
    default:
      return event?.replace(/_/g, " ") || "Event";
  }
};

const getTimelinePillClass = (event) => {
  switch (event) {
    case "PAYMENT_VERIFIED":
      return "bg-green-100 text-green-800";
    case "PAYMENT_UPLOADED":
      return "bg-amber-100 text-amber-800";
    case "DISPATCHED":
      return "bg-purple-100 text-purple-800";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/* ------------------------------------------------------------------
   MAIN PAGE – DISPATCHER WORK ORDERS
-------------------------------------------------------------------*/

export default function DispatcherWorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);

  // 🔹 current user role (ADMIN / DISPATCHER)
  const [userRole, setUserRole] = useState(null);
  const isAdmin = userRole === "ADMIN";

  // 🔢 tab counts
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });

  const [technicians, setTechnicians] = useState([]);
  const [blockedTechnicians] = useState([]); // future use

  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [currentAction, setCurrentAction] = useState(null); // 'reassign' | 'reschedule' | 'cancel' | 'verifyPayment'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [techLoading, setTechLoading] = useState(false);
  const [techError, setTechError] = useState("");

  // 🔹 audit-trail state (per work-order)
  const [auditExpanded, setAuditExpanded] = useState({}); // { [woId]: bool }
  const [auditData, setAuditData] = useState({}); // { [woId]: payload }
  const [auditLoading, setAuditLoading] = useState({}); // { [woId]: bool }
  const [auditError, setAuditError] = useState({}); // { [woId]: string }

  /* ------------ Load current user role ------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserRole(parsed.role || parsed.user_type || null);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }, []);

  /* ------------ Fetch helpers ------------- */

  const transformWorkOrder = (wo) => {
    let scheduledDate = "";
    let scheduledTime = "";
    if (wo.scheduledAt) {
      const d = new Date(wo.scheduledAt);
      scheduledDate = d.toISOString().split("T")[0];
      scheduledTime = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const estimatedHours =
      typeof wo.estimatedDuration === "number"
        ? Math.round(wo.estimatedDuration / 60)
        : 2;

    const priorityLabel = mapBackendPriorityToLabel(wo.priority);
    const statusLabel = mapBackendStatusToLabel(wo.status);

    return {
      id: wo.id,
      woNumber: wo.woNumber,

      srId: wo.serviceRequest?.srNumber || `SR-${wo.srId}`,
      customerName: wo.customer?.name || "",
      category: [
        wo.category?.name,
        wo.service?.name,
        wo.subservice?.name,
      ]
        .filter(Boolean)
        .join(" – "),
      status: statusLabel,
      statusRaw: wo.status,

      scheduledDate,
      scheduledTime,
      assignedTechnician: wo.technician?.id || null,
      estimatedDuration: String(estimatedHours || "2"),
      priority: priorityLabel,
      notes: wo.notes || "",
      price: typeof wo.subservice?.baseRate === "number"
        ? wo.subservice.baseRate
        : null,

      paymentRecord: null, // placeholder – future use

      raw: wo,
    };
  };

  // 🔢 status counts
  const loadCounts = async () => {
    try {
      const res = await DispatcherAPI.getWorkOrders({
        page: 1,
        limit: 1000,
      });

      const data = res.data;
      const list = Array.isArray(data.workOrders) ? data.workOrders : [];

      const counts = {
        all: data.pagination?.total || list.length,
        pending: 0,
        assigned: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
      };

      list.forEach((wo) => {
        switch (wo.status) {
          case "UNASSIGNED":
            counts.pending += 1;
            break;
          case "ASSIGNED":
            counts.assigned += 1;
            break;
          case "IN_PROGRESS":
            counts.inProgress += 1;
            break;
          case "COMPLETED":
            counts.completed += 1;
            break;
          case "CANCELLED":
            counts.cancelled += 1;
            break;
          default:
            break;
        }
      });

      setStatusCounts(counts);
    } catch (err) {
      console.error("Failed to load status counts", err);
    }
  };

  const loadWorkOrders = async (pageToLoad = page, tab = activeTab) => {
    try {
      setLoading(true);
      setError("");

      const statusParam = mapLabelToBackendStatus(tab);
      const params = { page: pageToLoad, limit };
      if (statusParam) params.status = statusParam;

      const res = await DispatcherAPI.getWorkOrders(params);
      const data = res.data;

      const list = Array.isArray(data.workOrders) ? data.workOrders : [];

      setWorkOrders(list.map(transformWorkOrder));
      setTotal(data.pagination?.total || list.length);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(data.pagination?.page || pageToLoad);
    } catch (err) {
      console.error("Failed to load work orders", err);
      setError(
        err.response?.data?.message ||
        "Failed to load work orders. Please try again."
      );
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyTechnicians = async (wo) => {
    try {
      setTechLoading(true);
      setTechError("");
      setTechnicians([]);

      const lat =
        wo.raw?.latitude ??
        wo.raw?.customer?.latitude ??
        wo.raw?.jobLocation?.latitude;
      const lng =
        wo.raw?.longitude ??
        wo.raw?.customer?.longitude ??
        wo.raw?.jobLocation?.longitude;

      if (lat == null || lng == null) {
        setTechError("Job location not available for this work order.");
        return;
      }

      const res = await DispatcherAPI.getNearbyTechnicians({
        latitude: lat,
        longitude: lng,
        maxDistance: 500,
        status: "ONLINE",
      });

      const data = res.data;
      const list = Array.isArray(data.technicians) ? data.technicians : [];
      setTechnicians(list.map(mapNearbyTech));
    } catch (err) {
      console.error("Failed to load nearby technicians", err);
      setTechError(
        err.response?.data?.message ||
        "Failed to load nearby technicians. Please try again."
      );
      setTechnicians([]);
    } finally {
      setTechLoading(false);
    }
  };

  // 🔹 load audit trail for a single work-order (Admin only)
  const loadAuditTrail = async (woId) => {
    if (!isAdmin) return;

    try {
      setAuditLoading((prev) => ({ ...prev, [woId]: true }));
      setAuditError((prev) => ({ ...prev, [woId]: "" }));

      const res = await DispatcherAPI.getWorkOrderAuditTrail(woId);
      const payload = res.data;

      const timeline = Array.isArray(payload.timeline)
        ? [...payload.timeline].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )
        : [];

      const payments = Array.isArray(payload.payments)
        ? payload.payments
        : [];

      setAuditData((prev) => ({
        ...prev,
        [woId]: {
          ...payload,
          timeline,
          payments,
        },
      }));
    } catch (err) {
      console.error("Failed to load audit trail", err);
      setAuditError((prev) => ({
        ...prev,
        [woId]:
          err.response?.data?.message ||
          "Failed to load audit trail. Please try again.",
      }));
    } finally {
      setAuditLoading((prev) => ({ ...prev, [woId]: false }));
    }
  };

  const toggleAuditTrail = (woId) => {
    if (!isAdmin) return;
    const isOpen = !!auditExpanded[woId];
    const willOpen = !isOpen;

    // first time open -> fetch if not loaded
    if (willOpen && !auditData[woId] && !auditLoading[woId]) {
      loadAuditTrail(woId);
    }

    setAuditExpanded((prev) => ({
      ...prev,
      [woId]: willOpen,
    }));
  };

  // mount + tab change → list + counts refresh
  useEffect(() => {
    loadCounts();
    loadWorkOrders(1, activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  /* ------------ Derived data ------------- */

  const technicianNameMap = useMemo(() => {
    return technicians.reduce((acc, t) => {
      acc[t.id] = t.name;
      return acc;
    }, {});
  }, [technicians]);

  const getTechnicianName = (id, workOrder) => {
    if (!id) return "";

    // 1) প্রথমে work order এর ভিতরের technician object থেকে নাম নাও
    if (workOrder?.raw?.technician?.name) {
      return workOrder.raw.technician.name;
    }

    // 2) না থাকলে nearby technicians map থেকে চেষ্টা করো
    if (technicianNameMap[id]) {
      return technicianNameMap[id];
    }

    // 3) সবশেষে fallback
    return `Tech #${id}`;
  };


  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "Low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplay = (statusRaw) => {
    switch (statusRaw) {
      case "UNASSIGNED":
        return "Pending";
      case "ASSIGNED":
        return "Assigned";
      case "IN_PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      case "COMPLETED_PENDING_PAYMENT":
        return "Completed – Pending Payment";
      case "CANCELLED":
        return "Cancelled";
      default:
        return (statusRaw || "Unknown").replace(/_/g, " ");
    }
  };

  const getStatusBadgeClass = (statusRaw) => {
    switch (statusRaw) {
      case "UNASSIGNED":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "IN_PROGRESS":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "COMPLETED_PENDING_PAYMENT":
        return "bg-yellow-50 text-yellow-800 border border-yellow-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };


  const filteredWorkOrders = useMemo(() => {
    let list = [...workOrders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((wo) => {
        const woNumberMatch =
          wo.woNumber && wo.woNumber.toLowerCase().includes(q);

        const internalIdMatch = String(wo.id).toLowerCase().includes(q);

        // 🔹 এখানেই SR ID দিয়ে search করার logic
        const srIdMatch =
          wo.srId && String(wo.srId).toLowerCase().includes(q);

        const customerMatch =
          wo.customerName && wo.customerName.toLowerCase().includes(q);

        return woNumberMatch || internalIdMatch || srIdMatch || customerMatch;
      });
    }

    return list;
  }, [workOrders, searchQuery]);


  const countByStatus = (statusKey) => {
    switch (statusKey) {
      case "all":
        return statusCounts.all;
      case "pending":
        return statusCounts.pending;
      case "assigned":
        return statusCounts.assigned;
      case "in progress":
        return statusCounts.inProgress;
      case "completed":
        return statusCounts.completed;
      case "cancelled":
        return statusCounts.cancelled;
      default:
        return 0;
    }
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
    if (action === "reassign") {
      loadNearbyTechnicians(wo).then(() => {
        setSelectedWorkOrder(wo);
        setCurrentAction(action);
      });
    } else {
      setSelectedWorkOrder(wo);
      setCurrentAction(action);
    }
  };

  const closeModals = () => {
    setSelectedWorkOrder(null);
    setCurrentAction(null);
  };

  const handleWorkOrderAction = async (workOrderId, action, data) => {
    try {
      if (action === "cancel") {
        await DispatcherAPI.cancelWorkOrder(workOrderId, {
          reason: data.reason,
        });
      } else if (action === "reassign") {
        await DispatcherAPI.reassignWorkOrder(workOrderId, {
          technicianId: data.assignedTechnician,
          reason: data.notes || "Previous technician unavailable",
        });

        await DispatcherAPI.rescheduleWorkOrder(workOrderId, {
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          estimatedDuration: Number(data.estimatedDuration || 2),
          notes: data.notes,
        });
      } else if (action === "reschedule") {
        await DispatcherAPI.rescheduleWorkOrder(workOrderId, {
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          estimatedDuration: Number(data.estimatedDuration || 2),
          notes: data.notes,
        });
      }

      Swal.fire({
        icon: "success",
        title:
          action === "cancel"
            ? "Work order cancelled"
            : "Work order updated",
        confirmButtonColor: "#c20001",
      });

      closeModals();
      loadCounts();
      loadWorkOrders(1, activeTab);
    } catch (err) {
      console.error("WO action failed", err);

      const backendMsg = err.response?.data?.message || "";
      let friendlyMsg =
        "Something went wrong while updating the work order.";

      if (
        backendMsg.includes("scheduledAt") ||
        backendMsg.includes("Invalid Date")
      ) {
        friendlyMsg =
          "Invalid schedule date/time. Please choose a valid date and time, then try again.";
      } else if (backendMsg.toLowerCase().includes("technician")) {
        friendlyMsg =
          "Unable to update technician assignment. Please try again or select a different technician.";
      }

      Swal.fire({
        icon: "error",
        title: "Action failed",
        text: friendlyMsg,
        confirmButtonColor: "#c20001",
      });
    }
  };

  const handleVerifyPayment = () => {
    Swal.fire({
      icon: "info",
      title: "View only",
      text: "Payment verification can only be done by Admin.",
      confirmButtonColor: "#c20001",
    });
    closeModals();
  };

  const handleRejectPayment = () => {
    Swal.fire({
      icon: "info",
      title: "View only",
      text: "Payment rejection can only be done by Admin.",
      confirmButtonColor: "#c20001",
    });
    closeModals();
  };

  /* ------------ Render ------------- */

  const renderWorkOrders = (list) => {
    if (loading) {
      return (
        <div className="py-12 text-center text-gray-500">
          Loading work orders…
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-8 text-center text-red-600 text-sm">
          {error}
        </div>
      );
    }

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
        {list.map((wo) => {
          const audit = auditData[wo.id];
          const isAuditOpen = !!auditExpanded[wo.id];

          return (
            <div
              key={wo.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50"
            >
              {/* Top row */}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-[#c20001]">
                    {wo.woNumber || `WO-${wo.id}`}
                  </h3>
                  <p className="text-xs text-gray-600">SR: {wo.srId}</p>

                  {/* 🔹 Styled status badge */}
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${getStatusBadgeClass(
                        wo.statusRaw || wo.status
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {getStatusDisplay(wo.statusRaw || wo.status)}
                    </span>
                  </div>
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
                    <span>{getTechnicianName(wo.assignedTechnician, wo)}</span>
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
                {typeof wo.price === "number" && (
                  <div className="flex items-center gap-1">
                    {/* <DollarSign className="h-4 w-4" /> */}
                    <span>${wo.price}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {wo.notes && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-600">Notes</p>
                  <p className="text-sm text-gray-700">{wo.notes}</p>
                </div>
              )}

              {/* Footer (actions + payment) */}
              {wo.status !== "Cancelled" && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Left: payment status + action icons */}
                    <div className="flex items-center gap-2">
                      {/* Payment badge for completed */}
                      {wo.status === "Completed" &&
                        (() => {
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
                          {/* 🔁 Assign / Reassign – এখন Pending (UNASSIGNED) থাকলেও button থাকবে */}
                          {(wo.status === "Pending" ||
                            wo.status === "Assigned" ||
                            wo.status === "In Progress") && (
                              <div className="group relative">
                                <button
                                  type="button"
                                  onClick={() => openAction(wo, "reassign")}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-xs text-gray-700 transition hover:bg-gray-100"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                                  {wo.status === "Pending"
                                    ? "Assign"
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

                          {/* Cancel */}
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

                    {/* Right: payment call-to-action – আগের মতোই রেখে দিলাম */}
                    {wo.status === "Completed" &&
                      (() => {
                        const status = wo.paymentRecord?.paymentStatus;

                        if (status === "Proof Uploaded") {
                          return (
                            <button
                              type="button"
                              onClick={() => openAction(wo, "verifyPayment")}
                              className="rounded-[10px] border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                            >
                              View Payment
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

              {/* 🔹 Audit Trail – ADMIN only */}
              {isAdmin && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => toggleAuditTrail(wo.id)}
                    className="flex w-full items-center justify-between text-sm text-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#c20001]" />
                      <span className="font-medium">Audit Trail</span>
                      {audit?.timeline && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {audit.timeline.length} events
                        </span>
                      )}
                    </div>
                    {isAuditOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {isAuditOpen && (
                    <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
                      {auditLoading[wo.id] && (
                        <p className="text-xs text-gray-500">
                          Loading audit trail...
                        </p>
                      )}

                      {auditError[wo.id] && (
                        <p className="text-xs text-red-600">
                          {auditError[wo.id]}
                        </p>
                      )}

                      {!auditLoading[wo.id] &&
                        !auditError[wo.id] &&
                        audit?.timeline &&
                        audit.timeline.length > 0 && (
                          <ol className="space-y-3">
                            {audit.timeline.map((evt, index) => {
                              const label = mapTimelineEventLabel(evt.event);
                              const pillClass = getTimelinePillClass(
                                evt.event
                              );
                              const timestamp = new Date(
                                evt.timestamp
                              ).toLocaleString();
                              const actorName =
                                evt.actor?.name || "System";

                              const payment =
                                evt.paymentId &&
                                audit.payments?.find(
                                  (p) => p.id === evt.paymentId
                                );

                              return (
                                <li
                                  key={`${evt.event}-${evt.timestamp}-${index}`}
                                  className="relative pl-6 text-xs text-gray-700"
                                >
                                  {/* timeline dot + line */}
                                  <span className="absolute left-0 top-1.5 flex h-full flex-col items-center">
                                    <span className="h-3 w-3 rounded-full border-2 border-white bg-[#c20001] shadow" />
                                    {index !== audit.timeline.length - 1 && (
                                      <span className="mt-0.5 h-full w-px bg-gray-300" />
                                    )}
                                  </span>

                                  <div className="rounded-md bg-white px-3 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Badge className={pillClass}>
                                          {label}
                                        </Badge>
                                        <span className="text-[11px] text-gray-500">
                                          {timestamp}
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-gray-500">
                                        {actorName}
                                      </span>
                                    </div>

                                    {evt.description && (
                                      <p className="mt-1 text-[11px] text-gray-700">
                                        {evt.description}
                                      </p>
                                    )}

                                    {payment && (
                                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-50 px-2 py-1.5 text-[11px] text-gray-700">
                                        <span>
                                          Amount:{" "}
                                          <span className="font-semibold text-emerald-700">
                                            {payment.amount} KES
                                          </span>{" "}
                                          • Method: {payment.method}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ol>
                        )}

                      {!auditLoading[wo.id] &&
                        !auditError[wo.id] &&
                        (!audit?.timeline || audit.timeline.length === 0) && (
                          <p className="text-xs text-gray-500">
                            No audit events recorded yet for this work order.
                          </p>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 pb-6 pt-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search by WO number, SR ID or Customer…"
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
                { key: "all", label: "All" },
                { key: "pending", label: "Pending" },
                { key: "assigned", label: "Assigned" },
                { key: "in progress", label: "In Progress" },
                { key: "completed", label: "Completed" },
                { key: "cancelled", label: "Cancelled" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs transition ${activeTab === tab.key
                    ? "bg-white text-[#c20001] shadow-sm"
                    : "bg-transparent text-gray-700 hover:bg-white"
                    }`}
                >
                  {tab.label} ({countByStatus(tab.key)})
                </button>
              ))}
            </div>

            <div className="mt-6">
              {renderWorkOrders(filteredWorkOrders)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end gap-3 text-xs text-gray-600">
                <span>
                  Page {page} of {totalPages} • {total} results
                </span>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => loadWorkOrders(page - 1, activeTab)}
                  className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => loadWorkOrders(page + 1, activeTab)}
                  className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedWorkOrder &&
        currentAction &&
        ["reassign", "reschedule", "cancel"].includes(currentAction) && (
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
            workOrderId={selectedWorkOrder.woNumber || selectedWorkOrder.id}
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
            onVerify={handleVerifyPayment}
            onReject={handleRejectPayment}
          />
        )}

      {/* Nearby technicians loading/error info */}
      {techLoading && (
        <div className="mt-2 text-xs text-gray-500">
          Loading nearby technicians…
        </div>
      )}
      {techError && (
        <div className="mt-2 text-xs text-red-600">{techError}</div>
      )}
    </div>
  );
}
