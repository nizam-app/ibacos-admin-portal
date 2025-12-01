// src/pages/call-center/SRHistoryPage.jsx
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Briefcase,
  Clock,
  X as CloseIcon,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import LocationPickerMap from "../../components/map/LocationPickerMap";

// ============ helpers ============

// priority badge classes (API: HIGH / MEDIUM / LOW)
function getPriorityClasses(priorityRaw) {
  const p = (priorityRaw || "").toString().toUpperCase();
  switch (p) {
    case "HIGH":
      return "bg-red-100 text-red-800";
    case "MEDIUM":
      return "bg-orange-100 text-orange-800";
    case "LOW":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// SR main status badge (API: status + readableStatus)
function getStatusInfo(sr) {
  const statusCode = (sr?.status || "").toString().toUpperCase();
  const readable = sr?.readableStatus || sr?.status || "Unknown";

  switch (statusCode) {
    case "PENDING_APPROVAL":
      return {
        label: "Pending Approval",
        classes: "bg-yellow-100 text-yellow-800",
      };
    case "IN_PROGRESS":
      return { label: "In Progress", classes: "bg-blue-100 text-blue-800" };
    case "RESOLVED":
    case "COMPLETED":
      return { label: "Resolved", classes: "bg-green-100 text-green-800" };
    case "CANCELLED":
      return { label: "Cancelled", classes: "bg-red-100 text-red-800" };
    default:
      return { label: readable, classes: "bg-gray-100 text-gray-800" };
  }
}

// Work order status badge
function getWoStatusClasses(statusRaw) {
  const s = (statusRaw || "").toString().toUpperCase();
  switch (s) {
    case "ASSIGNED":
      return "bg-blue-100 text-blue-800";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// timeline mapping – based on SR status / internalStatus
function getStatusTimeline(sr) {
  const steps = ["Created", "Assigned", "In Progress", "Resolved"];

  const statusCode = (sr?.status || "").toString().toUpperCase();
  const internal = (sr?.internalStatus || "").toString().toUpperCase();

  let idx = 0; // default: at "Created"

  if (statusCode === "PENDING_APPROVAL" || internal === "NEW") idx = 0;
  else if (statusCode === "ASSIGNED" || internal === "ASSIGNED") idx = 1;
  else if (statusCode === "IN_PROGRESS") idx = 2;
  else if (statusCode === "RESOLVED" || statusCode === "COMPLETED") idx = 3;
  else if (statusCode === "CANCELLED") idx = 0; // cancelled: শুধু Created active

  return steps.map((label, i) => ({
    status: label,
    active: i <= idx,
  }));
}

// date helper
function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return String(value).slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

// small modal
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

// confirm dialog
function ConfirmDialog({ open, onClose, onConfirm, disabled, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        {children}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-md bg-[#c20001] px-4 py-2 text-sm font-medium text-white hover:bg-[#c20001]/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SRHistoryPage() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedSR, setSelectedSR] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ===== API: load SR list =====
  useEffect(() => {
    const fetchSRs = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const { data } = await axiosClient.get("/sr");
        setServiceRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load service requests", err);
        setLoadError(
          err.response?.data?.message ||
            "Failed to load service requests. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSRs();
  }, []);

  // filters change হলে page 1 এ reset
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStatus]);

  // category dropdown options – API data থেকে unique list
  const categoryOptions = useMemo(() => {
    const set = new Set();
    serviceRequests.forEach((sr) => {
      if (sr.category?.name) set.add(sr.category.name);
    });
    return Array.from(set);
  }, [serviceRequests]);

  // status dropdown options – label থেকে unique list
  const statusOptions = useMemo(() => {
    const set = new Set();
    serviceRequests.forEach((sr) => {
      set.add(getStatusInfo(sr).label);
    });
    return Array.from(set);
  }, [serviceRequests]);

  // search + filter
  const filteredServiceRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return serviceRequests.filter((sr) => {
      const srId = (sr.srNumber || sr.id || "").toString();
      const customerName = (sr.customer?.name || "").toString();
      const categoryName = (sr.category?.name || "").toString();

      const matchesSearch =
        q === "" ||
        srId.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q);

      const matchesCategory =
        filterCategory === "all" || categoryName === filterCategory;

      const statusLabel = getStatusInfo(sr).label;
      const matchesStatus =
        filterStatus === "all" || statusLabel === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [serviceRequests, searchQuery, filterCategory, filterStatus]);

  // pagination
  const totalPages =
    Math.ceil(filteredServiceRequests.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServiceRequests = filteredServiceRequests.slice(
    startIndex,
    endIndex
  );

  const hasActiveFilters =
    searchQuery !== "" || filterCategory !== "all" || filterStatus !== "all";

  const handleViewDetails = (sr) => {
    setSelectedSR(sr);
    setShowDetailsModal(true);
  };

  const details = selectedSR || {};
  const statusTimeline = selectedSR ? getStatusTimeline(selectedSR) : [];

  const technicianName =
    typeof details.assignedTechnician === "string"
      ? details.assignedTechnician
      : details.assignedTechnician?.name || "";

  const statusCodeForSelected = selectedSR
    ? (selectedSR.status || "").toString().toUpperCase()
    : "";
  const canCancel =
    selectedSR &&
    !["RESOLVED", "COMPLETED", "CANCELLED"].includes(statusCodeForSelected);

  // ===== Cancel SR handler =====
 const handleCancelConfirm = async () => {
  if (!selectedSR || !cancelReason.trim()) return;

  try {
    setCancelLoading(true);
    setCancelError("");

    // ⬇️ এখানে PATCH + reason
    const { data } = await axiosClient.patch(
      `/sr/${selectedSR.id}/cancel`,
      {
        reason: cancelReason.trim(),
      }
    );

    const updated = data?.serviceRequest || data;

    // list আপডেট
    setServiceRequests((prev) =>
      prev.map((sr) => (sr.id === updated.id ? { ...sr, ...updated } : sr))
    );

    // modal এর selected SR আপডেট
    setSelectedSR((prev) =>
      prev && prev.id === updated.id ? { ...prev, ...updated } : prev
    );

    setShowCancelDialog(false);
    setCancelReason("");
    // চাইলে এখানে toast/alert দিতে পারো
    // toast.success(data?.message || "Service Request cancelled successfully");
  } catch (err) {
    console.error("SR cancel failed", err);
    setCancelError(
      err.response?.data?.message ||
        "Failed to cancel service request. Please try again."
    );
  } finally {
    setCancelLoading(false);
  }
};



  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Service Request History</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and search all submitted service requests
          </p>
        </div>

        <div className="px-6 pb-6 pt-4">
          {/* error / loading banner */}
          {loadError && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {/* Search + filters */}
          <div className="mb-4 space-y-4">
            <div className="flex flex-col items-end gap-4 sm:flex-row">
              {/* search */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by SR ID or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none ring-0 focus:border-[#c20001] focus:ring-2 focus:ring-[#c20001]/30"
                />
              </div>

              {/* category filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-10 w-[160px] rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#c20001] focus:ring-2 focus:ring-[#c20001]/30"
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 w-[150px] rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#c20001] focus:ring-2 focus:ring-[#c20001]/30"
              >
                <option value="all">All Status</option>
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center text-sm text-gray-500">
              {hasActiveFilters && (
                <span>
                  Showing {filteredServiceRequests.length} of{" "}
                  {serviceRequests.length} service requests
                </span>
              )}
              <span className="ml-auto">
                Total: {serviceRequests.length} SRs
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-neutral-300">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    SR ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Assigned Technician
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    WO Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      Loading service requests...
                    </td>
                  </tr>
                ) : paginatedServiceRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      {serviceRequests.length === 0
                        ? "No service requests found. Create your first service request to get started."
                        : "No service requests match your search criteria. Try adjusting your filters."}
                    </td>
                  </tr>
                ) : (
                  paginatedServiceRequests.map((sr) => {
                    const statusInfo = getStatusInfo(sr);
                    const priorityClasses = getPriorityClasses(sr.priority);
                    const woStatus = sr.woStatus;
                    const woStatusClasses = getWoStatusClasses(woStatus);

                    const srId = sr.srNumber || sr.id;
                    const customerName = sr.customer?.name || "—";
                    const categoryName = sr.category?.name || "—";
                    const dateCreated = formatDate(sr.createdAt);

                    const rowTechnicianName =
                      typeof sr.assignedTechnician === "string"
                        ? sr.assignedTechnician
                        : sr.assignedTechnician?.name;

                    return (
                      <tr
                        key={sr.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleViewDetails(sr)}
                      >
                        <td className="px-4 py-3 text-[#c20001]">{srId}</td>
                        <td className="px-4 py-3">{customerName}</td>
                        <td className="px-4 py-3">{categoryName}</td>
                        <td className="px-4 py-3">
                          {rowTechnicianName ? (
                            <span className="text-gray-900">
                              {rowTechnicianName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {woStatus ? (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${woStatusClasses}`}
                            >
                              {woStatus}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityClasses}`}
                          >
                            {sr.priority
                              ? sr.priority.charAt(0) +
                                sr.priority.slice(1).toLowerCase()
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.classes}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">{dateCreated}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredServiceRequests.length > itemsPerPage && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredServiceRequests.length)} of{" "}
                {filteredServiceRequests.length} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 rounded-md text-xs font-medium ${
                          currentPage === pageNum
                            ? "bg-[#c20001] text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Details Modal ===== */}
      <Modal
        open={!!selectedSR && showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      >
        {selectedSR && (
          <>
            <div className="flex items-start justify-between border-b px-6 pt-6 pb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Service Request Details
                </h3>
                <p className="sr-only">
                  Complete information for service request{" "}
                  {selectedSR.srNumber || selectedSR.id}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-medium text-[#c20001]">
                  {selectedSR.srNumber || selectedSR.id}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    getStatusInfo(selectedSR).classes
                  }`}
                >
                  {getStatusInfo(selectedSR).label}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-4 pt-4">
              {/* top: customer + map */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* customer info */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-[#c20001]">
                    Customer Information
                  </h4>
                  <div className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Name</div>
                      <div className="mt-1">
                        {selectedSR.customer?.name || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone
                      </div>
                      <div className="mt-1">
                        {selectedSR.customer?.phone || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Address</div>
                      <div className="mt-1">
                        {selectedSR.address || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* job location map (real map component) */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-[#c20001]">
                    Job Location
                  </h4>
                  <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                    <LocationPickerMap
                      lat={selectedSR.latitude ?? 40.4406}
                      lng={selectedSR.longitude ?? -79.9959}
                      disabled={true}
                    />
                  </div>
                  <div className="mt-2 inline-flex rounded bg-white px-3 py-1 text-xs shadow-sm">
                    <span className="text-gray-600">Lat:&nbsp;</span>
                    <span className="text-gray-900">
                      {selectedSR.latitude != null
                        ? selectedSR.latitude.toFixed(6)
                        : "40.440600"}
                    </span>
                    <span className="mx-2">|</span>
                    <span className="text-gray-600">Lng:&nbsp;</span>
                    <span className="text-gray-900">
                      {selectedSR.longitude != null
                        ? selectedSR.longitude.toFixed(6)
                        : "-79.995900"}
                    </span>
                  </div>
                </div>
              </div>

              {/* service details */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-[#c20001]">
                  Service Details
                </h4>
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Category</div>
                    <div className="mt-1">
                      {selectedSR.category?.name || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Subservice</div>
                    <div className="mt-1">
                      {selectedSR.subservice?.name || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Service</div>
                    <div className="mt-1">
                      {selectedSR.service?.name || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Priority</div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityClasses(
                          selectedSR.priority
                        )}`}
                      >
                        {selectedSR.priority
                          ? selectedSR.priority.charAt(0) +
                            selectedSR.priority.slice(1).toLowerCase()
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date Created</div>
                    <div className="mt-1">
                      {formatDate(selectedSR.createdAt)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500">Description</div>
                    <div className="mt-1">
                      {selectedSR.description || "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* timeline */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-[#c20001]">
                  Timeline
                </h4>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  {statusTimeline.map((item, index) => (
                    <div key={item.status} className="flex items-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.active
                            ? "bg-[#c20001] text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.status}
                      </span>
                      {index < statusTimeline.length - 1 && (
                        <div
                          className={`mx-1 h-0.5 w-12 ${
                            item.active ? "bg-[#c20001]" : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* technician / WO */}
              {technicianName ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-[#c20001]">
                    Assigned Technician
                  </h4>
                  <div className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Briefcase className="h-3 w-3" />
                          Technician
                        </div>
                        <div className="mt-1">{technicianName}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          Phone
                        </div>
                        <div className="mt-1">
                          {selectedSR.technicianPhone || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">WO Status</div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getWoStatusClasses(
                              selectedSR.woStatus || "ASSIGNED"
                            )}`}
                          >
                            {selectedSR.woStatus || "Assigned"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          Last Update
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          {selectedSR.lastSeenTime || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-[#c20001]">
                    Related Work Order
                  </h4>
                  <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                    Awaiting dispatcher assignment
                  </div>
                </div>
              )}

              {/* cancel button */}
              {canCancel && (
                <div className="flex justify-center pb-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelDialog(true);
                      setCancelError("");
                    }}
                    className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Cancel Request
                  </button>
                </div>
              )}
            </div>

            <div className="border-t px-6 pb-6 pt-4">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="flex w-full items-center justify-center rounded-md bg-[#c20001] px-4 py-2 text-sm font-medium text-white hover:bg-[#c20001]/90"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* cancel dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setCancelReason("");
          setCancelError("");
        }}
        onConfirm={handleCancelConfirm}
        disabled={!cancelReason.trim() || cancelLoading}
      >
        <h3 className="text-base font-semibold">Cancel Service Request</h3>
        <p className="mt-1 text-sm text-gray-600">
          Please provide a reason for cancelling this service request. This
          action cannot be undone.
        </p>
        <textarea
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Enter cancellation reason..."
          className="mt-3 w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#c20001] focus:ring-2 focus:ring-[#c20001]/30"
        />
        {cancelError && (
          <p className="mt-2 text-xs text-red-600">{cancelError}</p>
        )}
      </ConfirmDialog>
    </div>
  );
}
