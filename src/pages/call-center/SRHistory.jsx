import { useState, useEffect } from "react";
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

// --- Mock data (screenshot অনুযায়ী) ---
const mockServiceRequests = [
  {
    id: "SR-2024-1001",
    customerName: "John Mitchell",
    category: "Electrical",
    assignedTechnician: "Mike Johnson",
    woStatus: "In Progress",
    priority: "High",
    status: "In Progress",
    date: "2024-10-28",
  },
  {
    id: "SR-2024-1002",
    customerName: "Sarah Williams",
    category: "Plumbing",
    assignedTechnician: "",
    woStatus: "",
    priority: "Medium",
    status: "Pending",
    date: "2024-10-29",
  },
  {
    id: "SR-2024-1003",
    customerName: "Michael Chen",
    category: "HVAC",
    assignedTechnician: "Carlos Rodriguez",
    woStatus: "Completed",
    priority: "Low",
    status: "Resolved",
    date: "2024-10-30",
  },
  {
    id: "SR-2024-1004",
    customerName: "Emily Rodriguez",
    category: "General",
    assignedTechnician: "Tom Wilson",
    woStatus: "Assigned",
    priority: "Medium",
    status: "In Progress",
    date: "2024-10-30",
  },
  {
    id: "SR-2024-1005",
    customerName: "David Thompson",
    category: "Electrical",
    assignedTechnician: "",
    woStatus: "",
    priority: "High",
    status: "Pending",
    date: "2024-10-31",
  },
  {
    id: "SR-2024-1006",
    customerName: "Jennifer Martinez",
    category: "Plumbing",
    assignedTechnician: "",
    woStatus: "",
    priority: "High",
    status: "Pending",
    date: "2024-11-01",
  },
  {
    id: "SR-2024-1007",
    customerName: "Robert Anderson",
    category: "HVAC",
    assignedTechnician: "Carlos Rodriguez",
    woStatus: "In Progress",
    priority: "Medium",
    status: "In Progress",
    date: "2024-11-02",
  },
  {
    id: "SR-2024-1008",
    customerName: "Lisa Parker",
    category: "Electrical",
    assignedTechnician: "",
    woStatus: "",
    priority: "Low",
    status: "Pending",
    date: "2024-11-03",
  },
  {
    id: "SR-2024-1009",
    customerName: "John Mitchell",
    category: "Plumbing",
    assignedTechnician: "",
    woStatus: "",
    priority: "Medium",
    status: "Resolved",
    date: "2024-11-04",
  },
  {
    id: "SR-2024-1010",
    customerName: "Sarah Williams",
    category: "HVAC",
    assignedTechnician: "",
    woStatus: "",
    priority: "Low",
    status: "Pending",
    date: "2024-11-05",
  },
  {
    id: "SR-2024-1010",
    customerName: "Sarah Williams",
    category: "HVAC",
    assignedTechnician: "",
    woStatus: "",
    priority: "Low",
    status: "Pending",
    date: "2024-11-05",
  },
  {
    id: "SR-2024-1010",
    customerName: "Sarah Williams",
    category: "HVAC",
    assignedTechnician: "",
    woStatus: "",
    priority: "Low",
    status: "Pending",
    date: "2024-11-05",
  },
  {
    id: "SR-2024-1010",
    customerName: "Sarah Williams",
    category: "HVAC",
    assignedTechnician: "",
    woStatus: "",
    priority: "Low",
    status: "Pending",
    date: "2024-11-05",
  },
  {
    id: "SR-2024-1010",
    customerName: "Sarah Williams",
    category: "HVAC",
    assignedTechnician: "",
    woStatus: "",
    priority: "Low",
    status: "Pending",
    date: "2024-11-05",
  },
  {
    id: "SR-2024-1010",
    customerName: "Sarah Williams",
    category: "HVAC",
    assignedTechnician: "",
    woStatus: "",
    priority: "Low",
    status: "Pending",
    date: "2024-11-05",
  },
  {
    id: "SR-2024-1010",
    customerName: "Sarah Williams",
    category: "HVAC",
    assignedTechnician: "",
    woStatus: "",
    priority: "Low",
    status: "Pending",
    date: "2024-11-05",
  },
  {
    id: "SR-2024-1010",
    customerName: "Sarah Williams",
    category: "HVAC",
    assignedTechnician: "",
    woStatus: "",
    priority: "Low",
    status: "Pending",
    date: "2024-11-05",
  },
  {
    id: "SR-2024-1010",
    customerName: "Sarah Williams",
    category: "HVAC",
    assignedTechnician: "",
    woStatus: "",
    priority: "Low",
    status: "Pending",
    date: "2024-11-05",
  },
  // চাইলে আরও বাড়াতে পারো
];

function getPriorityClasses(priority) {
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
}

function getStatusClasses(status) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "Resolved":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getWoStatusClasses(status) {
  switch (status) {
    case "Assigned":
      return "bg-blue-100 text-blue-800";
    case "In Progress":
      return "bg-purple-100 text-purple-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// ছোট helper – simple modal (কোনো external UI নয়)
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

export default function SRHistoryPage({ serviceRequests = mockServiceRequests }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSR, setSelectedSR] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // filters change হলে page 1 এ ফেরা
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStatus]);

  // search + filter
  const filteredServiceRequests = serviceRequests.filter((sr) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      sr.id.toLowerCase().includes(q) ||
      sr.customerName.toLowerCase().includes(q);

    const matchesCategory =
      filterCategory === "all" || sr.category === filterCategory;
    const matchesStatus = filterStatus === "all" || sr.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // pagination
  const totalPages = Math.ceil(filteredServiceRequests.length / itemsPerPage) || 1;
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

  const getStatusTimeline = (status) => {
    const statuses = ["Created", "Assigned", "In Progress", "Resolved"];
    const currentIndex = statuses.indexOf(
      status === "Pending" ? "Created" : status
    );

    return statuses.map((s, index) => ({
      status: s,
      active: currentIndex === -1 ? false : index <= currentIndex,
    }));
  };

  // Modal এর জন্য mock details (real API আসলে এখান থেকে replace করবে)
  const getCustomerDetails = (sr) => {
    if (!sr) return {};
    return {
      phone: sr.customerPhone || "(555) 123-4567",
      email: sr.customerEmail || "customer@email.com",
      address:
        sr.customerAddress || "123 Main Street, Pittsburgh, PA 15213",
      subservice: sr.subservice || "Installation",
      description:
        sr.description ||
        `Customer requires service for ${sr.category.toLowerCase()} work. Please contact for more details.`,
    };
  };

  const details = getCustomerDetails(selectedSR);

  const statusTimeline = selectedSR
    ? getStatusTimeline(selectedSR.status)
    : [];

  return (
    <div className="space-y-4">
      {/* Card */}
      <div className="rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="px-6 pt-6 pb-4 border-b-1 border-gray-400">
          <h2 className="text-lg font-semibold">
            Service Request History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and search all submitted service requests
          </p>
        </div>

        <div className="px-6 pb-6 pt-4">
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
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC</option>
                <option value="General">General</option>
              </select>

              {/* status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 w-[150px] rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#c20001] focus:ring-2 focus:ring-[#c20001]/30"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
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
                {paginatedServiceRequests.length === 0 ? (
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
                  paginatedServiceRequests.map((sr) => (
                    <tr
                      key={sr.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleViewDetails(sr)}
                    >
                      <td className="px-4 py-3 text-[#c20001]">{sr.id}</td>
                      <td className="px-4 py-3">{sr.customerName}</td>
                      <td className="px-4 py-3">{sr.category}</td>
                      <td className="px-4 py-3">
                        {sr.assignedTechnician ? (
                          <span className="text-gray-900">
                            {sr.assignedTechnician}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {sr.woStatus ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getWoStatusClasses(
                              sr.woStatus
                            )}`}
                          >
                            {sr.woStatus}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityClasses(
                            sr.priority
                          )}`}
                        >
                          {sr.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(
                            sr.status
                          )}`}
                        >
                          {sr.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{sr.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredServiceRequests.length > itemsPerPage && (
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

      {/* Details modal */}
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
                  Complete information for service request {selectedSR.id}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-medium text-[#c20001]">
                  {selectedSR.id}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(
                    selectedSR.status
                  )}`}
                >
                  {selectedSR.status}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-4 pt-4">
              {/* top two-column: customer + map */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* customer info */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-[#c20001]">
                    Customer Information
                  </h4>
                  <div className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Name</div>
                      <div className="mt-1">{selectedSR.customerName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone
                      </div>
                      <div className="mt-1">{details.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="mt-1">{details.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Address</div>
                      <div className="mt-1">{details.address}</div>
                      {selectedSR.landmark && (
                        <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                          <MapPin className="mt-0.5 h-3 w-3" />
                          {selectedSR.landmark}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* map preview */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-[#c20001]">
                    Job Location
                  </h4>
                  <div className="h-64 overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `
                            linear-gradient(to right, gray 1px, transparent 1px),
                            linear-gradient(to bottom, gray 1px, transparent 1px)
                          `,
                          backgroundSize: "20px 20px",
                        }}
                      />
                      <div
                        className="absolute"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -100%)",
                        }}
                      >
                        <MapPin
                          className="h-8 w-8 text-[#c20001] drop-shadow-lg"
                          fill="#c20001"
                        />
                      </div>
                      <div className="absolute bottom-2 left-2 rounded bg-white px-3 py-1 text-xs shadow-sm">
                        <span className="text-gray-600">Lat: </span>
                        <span className="text-gray-900">
                          {selectedSR.latitude?.toFixed(6) || "40.440600"}
                        </span>
                        <span className="mx-2">|</span>
                        <span className="text-gray-600">Lng: </span>
                        <span className="text-gray-900">
                          {selectedSR.longitude?.toFixed(6) || "-79.995900"}
                        </span>
                      </div>
                    </div>
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
                    <div className="mt-1">{selectedSR.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Subservice</div>
                    <div className="mt-1">{details.subservice}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Priority</div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityClasses(
                          selectedSR.priority
                        )}`}
                      >
                        {selectedSR.priority}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date Created</div>
                    <div className="mt-1">{selectedSR.date}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500">Description</div>
                    <div className="mt-1">{details.description}</div>
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

              {/* technician / work order */}
              {selectedSR.workOrderId && selectedSR.assignedTechnician ? (
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
                        <div className="mt-1">
                          {selectedSR.assignedTechnician}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          Phone
                        </div>
                        <div className="mt-1">
                          {selectedSR.technicianPhone || "(555) 123-4567"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Specialty</div>
                        <div className="mt-1">
                          {selectedSR.technicianSpecialty ||
                            selectedSR.category}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">WO Status</div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getWoStatusClasses(
                              selectedSR.woStatus || "Assigned"
                            )}`}
                          >
                            {selectedSR.woStatus || "Assigned"}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          Last Location
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          Last seen {selectedSR.lastSeenTime || "15 mins ago"}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            "In real app, technician map view/open in new page."
                          )
                        }
                        className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        View Technician on Map
                      </button>
                    </div>

                    <div className="border-t border-gray-200 pt-2 text-xs">
                      <div className="text-gray-500">Work Order ID</div>
                      <div className="mt-1 font-medium text-[#c20001]">
                        {selectedSR.workOrderId}
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
              {!selectedSR.workOrderId && selectedSR.status !== "Resolved" && (
                <div className="flex justify-center pb-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelDialog(true)}
                    className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Cancel Request
                  </button>
                </div>
              )}
            </div>

            {/* footer close */}
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
        }}
        onConfirm={() => {
          console.log("Cancel SR:", selectedSR?.id, "Reason:", cancelReason);
          setShowCancelDialog(false);
          setShowDetailsModal(false);
          setCancelReason("");
        }}
        disabled={!cancelReason.trim()}
      >
        <h3 className="text-base font-semibold">
          Cancel Service Request
        </h3>
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
      </ConfirmDialog>
    </div>
  );
}
