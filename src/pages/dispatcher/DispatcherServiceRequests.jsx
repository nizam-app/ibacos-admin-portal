// src/pages/dispatcher/ServiceRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Briefcase,
  Users,
  Info,
  MapPin,
  AlertCircle,
} from "lucide-react";

// ---------- Mock data ----------
const mockServiceRequests = [
  {
    id: "SR-2024-1001",
    customerName: "John Mitchell",
    category: "Electrical",
    priority: "High",
    status: "In Progress",
    date: "2024-10-28",
    address: "123 Main Street, Pittsburgh, PA",
  },
  {
    id: "SR-2024-1002",
    customerName: "Sarah Williams",
    category: "Plumbing",
    priority: "Medium",
    status: "Pending",
    date: "2024-10-29",
    address: "45 Market Ave, Pittsburgh, PA",
  },
  {
    id: "SR-2024-1003",
    customerName: "Michael Chen",
    category: "HVAC",
    priority: "Low",
    status: "Resolved",
    date: "2024-10-30",
    address: "78 Hilltop Rd, Pittsburgh, PA",
  },
  {
    id: "SR-2024-1004",
    customerName: "Emily Rodriguez",
    category: "General",
    priority: "Medium",
    status: "In Progress",
    date: "2024-10-30",
    address: "15 Lakeview Dr, Pittsburgh, PA",
  },
  {
    id: "SR-2024-1005",
    customerName: "David Thompson",
    category: "Electrical",
    priority: "High",
    status: "Pending",
    date: "2024-10-31",
    address: "90 River St, Pittsburgh, PA",
  },
  {
    id: "SR-2024-1006",
    customerName: "Jennifer Martinez",
    category: "Plumbing",
    priority: "High",
    status: "Pending",
    date: "2024-11-01",
    address: "12 Pine St, Pittsburgh, PA",
  },
  {
    id: "SR-2024-1007",
    customerName: "Robert Anderson",
    category: "HVAC",
    priority: "Medium",
    status: "In Progress",
    date: "2024-11-02",
    address: "34 Oak Ln, Pittsburgh, PA",
  },
  {
    id: "SR-2024-1008",
    customerName: "Lisa Parker",
    category: "Electrical",
    priority: "Low",
    status: "Pending",
    date: "2024-11-03",
    address: "8 West St, Pittsburgh, PA",
  },
  {
    id: "SR-2024-1009",
    customerName: "John Mitchell",
    category: "Plumbing",
    priority: "Medium",
    status: "Resolved",
    date: "2024-11-04",
    address: "123 Main Street, Pittsburgh, PA",
  },
  {
    id: "SR-2024-1010",
    customerName: "Sarah Williams",
    category: "HVAC",
    priority: "Low",
    status: "Pending",
    date: "2024-11-05",
    address: "45 Market Ave, Pittsburgh, PA",
  },
  // extra few rows so page 2 works
  {
    id: "SR-2024-1011",
    customerName: "David Thompson",
    category: "General",
    priority: "Low",
    status: "Pending",
    date: "2024-11-06",
    address: "90 River St, Pittsburgh, PA",
  },
  {
    id: "SR-2024-1012",
    customerName: "Emily Brown",
    category: "Plumbing",
    priority: "Medium",
    status: "Pending",
    date: "2024-11-07",
    address: "19 Elm St, Pittsburgh, PA",
  },
];

// ---------- Helpers ----------
const priorityBadgeClass = (priority) => {
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

const statusBadgeClass = (status) => {
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
};

// ---------- Main page ----------
const DispatcherServiceRequests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSR, setSelectedSR] = useState(null);

  const itemsPerPage = 5;

  // reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStatus]);

  const filteredRequests = useMemo(() => {
    return mockServiceRequests.filter((sr) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        sr.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sr.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sr.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || sr.category === filterCategory;

      const matchesStatus =
        filterStatus === "all" || sr.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, filterCategory, filterStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCreateWO = (sr, workOrderData) => {
    console.log("Work order created:", { sr, workOrderData });
    // বাস্তবে এখানে API call হবে
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Service Requests</h1>
        <p className="text-sm text-gray-500">
          Convert service requests to work orders
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Search + filters */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, customer name, or category..."
                className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001]/30 focus:border-[#c20001]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category filter */}
            <select
              className="w-full sm:w-44 rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c20001]/30 focus:border-[#c20001]"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option className="" value="all">All Categories</option>
              <option className="" value="Electrical">Electrical</option>
              <option className="" value="Plumbing">Plumbing</option>
              <option className="" value="HVAC">HVAC</option>
              <option className="" value="General">General</option>
            </select>

            {/* Status filter */}
            <select
              className="w-full sm:w-40 rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c20001]/30 focus:border-[#c20001]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>
              Showing {filteredRequests.length} of {mockServiceRequests.length}{" "}
              SRs
            </span>
            <span>Total: {mockServiceRequests.length} SRs</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500">
                <th className="px-4 py-3 text-left font-medium">SR ID</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Priority</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No service requests found.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((sr) => (
                  <tr
                    key={sr.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-[#c20001]">{sr.id}</td>
                    <td className="px-4 py-3">{sr.customerName}</td>
                    <td className="px-4 py-3">{sr.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityBadgeClass(
                          sr.priority
                        )}`}
                      >
                        {sr.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(
                          sr.status
                        )}`}
                      >
                        {sr.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{sr.date}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSR(sr)}
                        className="inline-flex items-center rounded-full bg-[#c20001] px-3 py-1 text-xs font-medium text-white hover:bg-[#a00001] transition"
                      >
                        Convert to WO
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
          <span>
            Showing {filteredRequests.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredRequests.length)} of{" "}
            {filteredRequests.length} results
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage === 1}
              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs ${
                safePage === 1
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Previous
            </button>

            {/* page numbers (max 5 buttons) */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;

                // show at most 5 pages smartly
                if (totalPages > 5) {
                  if (safePage <= 3 && page > 5) return null;
                  if (safePage >= totalPages - 2 && page < totalPages - 4)
                    return null;
                  if (
                    safePage > 3 &&
                    safePage < totalPages - 2 &&
                    (page < safePage - 2 || page > safePage + 2)
                  )
                    return null;
                }

                const isActive = page === safePage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`h-7 w-7 rounded-md text-xs font-medium ${
                      isActive
                        ? "bg-[#c20001] text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage === totalPages}
              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs ${
                safePage === totalPages
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Next
              <ChevronRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedSR && (
        <ConvertToWorkOrderModal
          serviceRequest={selectedSR}
          onClose={() => setSelectedSR(null)}
          onConfirm={(data) => handleCreateWO(selectedSR, data)}
        />
      )}
    </div>
  );
};

export default DispatcherServiceRequests;

// ---------- Modal Component ----------
function ConvertToWorkOrderModal({ serviceRequest, onClose, onConfirm }) {
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    assignedTechnician: "",
    estimatedDuration: "2",
    notes: "",
  });

  const [selectedTechnician, setSelectedTechnician] = useState(null);

  // same technicians as TypeScript version (mock)
  const technicians = [
    {
      id: "TECH001",
      name: "Mike Johnson",
      specialty: "Electrical",
      employmentType: "Freelancer",
      commissionRate: 10,
      distance: 2.3,
      status: "Available",
      openJobs: [],
    },
    {
      id: "TECH002",
      name: "Sarah Davis",
      specialty: "Plumbing",
      employmentType: "Internal Employee",
      bonusRate: 5,
      distance: 4.7,
      status: "Busy",
      openJobs: [
        { woId: "WO0008", status: "In Progress", scheduledDate: "Today", scheduledTime: "11:00" },
        { woId: "WO0012", status: "Assigned", scheduledDate: "Today", scheduledTime: "15:30" },
        { woId: "WO0015", status: "Pending", scheduledDate: "Tomorrow", scheduledTime: "09:00" },
      ],
    },
    {
      id: "TECH003",
      name: "Robert Chen",
      specialty: "HVAC",
      employmentType: "Freelancer",
      commissionRate: 12,
      distance: 6.1,
      status: "Busy",
      openJobs: [
        { woId: "WO0010", status: "In Progress", scheduledDate: "Today", scheduledTime: "10:00" },
      ],
    },
    {
      id: "TECH004",
      name: "Lisa Martinez",
      specialty: "General",
      employmentType: "Internal Employee",
      bonusRate: 6,
      distance: 8.2,
      status: "Available",
      openJobs: [],
    },
    {
      id: "TECH005",
      name: "James Wilson",
      specialty: "Electrical",
      employmentType: "Freelancer",
      commissionRate: 10,
      distance: 12.5,
      status: "Busy",
      openJobs: [
        { woId: "WO0013", status: "Assigned", scheduledDate: "Today", scheduledTime: "14:00" },
        { woId: "WO0016", status: "Assigned", scheduledDate: "Tomorrow", scheduledTime: "10:00" },
      ],
    },
    {
      id: "TECH006",
      name: "Emily Brown",
      specialty: "Plumbing",
      employmentType: "Internal Employee",
      bonusRate: 5,
      distance: 15.8,
      status: "Available",
      openJobs: [],
    },
  ].sort((a, b) => a.distance - b.distance);

  const freelancers = technicians.filter(
    (t) => t.employmentType === "Freelancer"
  );
  const employees = technicians.filter(
    (t) => t.employmentType === "Internal Employee"
  );

  const handleTechnicianClick = (tech) => {
    setFormData((prev) => ({
      ...prev,
      assignedTechnician: tech ? tech.id : "",
    }));
    setSelectedTechnician(tech || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.scheduledDate || !formData.scheduledTime) return;

    const ok = window.confirm("Create Work Order with these details?");
    if (!ok) return;

    onConfirm(formData);
    alert("Work Order created (mock). Check console for payload.");
    onClose();
  };

  const employmentBadge = (type) => {
    if (type === "Freelancer") {
      return (
        <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-medium ml-1">
          <Briefcase className="w-3 h-3 mr-0.5" />
          Freelancer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-medium ml-1">
        <Users className="w-3 h-3 mr-0.5" />
        Employee
      </span>
    );
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-[#c20001]">
              Convert to Work Order
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Service Request: {serviceRequest.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Service info */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Service Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="text-gray-900">{serviceRequest.customerName}</p>
              </div>
              <div>
                <p className="text-gray-500">Category</p>
                <p className="text-gray-900">{serviceRequest.category}</p>
              </div>
              <div>
                <p className="text-gray-500">Date Submitted</p>
                <p className="text-gray-900">{serviceRequest.date}</p>
              </div>
              <div>
                <p className="text-gray-500">Service Address</p>
                <p className="text-gray-900">
                  {serviceRequest.address || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            {/* Scheduling */}
            <section>
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Scheduling
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="scheduledDate"
                    className="text-xs font-medium text-gray-700"
                  >
                    Scheduled Date *
                  </label>
                  <input
                    id="scheduledDate"
                    type="date"
                    min={today}
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduledDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001]/30 focus:border-[#c20001]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="scheduledTime"
                    className="text-xs font-medium text-gray-700"
                  >
                    Scheduled Time *
                  </label>
                  <input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduledTime: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001]/30 focus:border-[#c20001]"
                    required
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label
                    htmlFor="estimatedDuration"
                    className="text-xs font-medium text-gray-700"
                  >
                    Estimated Duration (hours) *
                  </label>
                  <select
                    id="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estimatedDuration: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c20001]/30 focus:border-[#c20001]"
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
            </section>

            {/* Technician assignment */}
            <section className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Technician Assignment
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2 py-0.5">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {freelancers.length} Freelancers
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5">
                    <Users className="w-3 h-3 mr-1" />
                    {employees.length} Employees
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                Sorted by distance (nearest first). Click a row to select, or
                leave unassigned.
              </p>

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {technicians.map((tech) => {
                    const isActive =
                      formData.assignedTechnician === tech.id;
                    return (
                      <div
                        key={tech.id}
                        onClick={() => handleTechnicianClick(tech)}
                        className={`px-4 py-3 text-sm flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 ${
                          isActive ? "bg-blue-50 border-l-4 border-l-[#c20001]" : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 truncate">
                              {tech.name} – {tech.specialty}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-1.5 py-[1px] text-[10px]">
                              {tech.employmentType === "Freelancer" ? (
                                <>
                                  <Briefcase className="w-3 h-3 mr-0.5" /> F
                                </>
                              ) : (
                                <>
                                  <Users className="w-3 h-3 mr-0.5" /> E
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            tech.status === "Available"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {tech.status}
                        </span>

                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="inline-flex items-center rounded-full border border-gray-300 px-2 py-0.5">
                            <MapPin className="w-3 h-3 mr-1" />
                            {tech.distance} km
                          </span>
                          {tech.openJobs.length > 0 && (
                            <span className="inline-flex items-center rounded-full border border-gray-300 px-2 py-0.5 bg-gray-50">
                              Open: {tech.openJobs.length}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* "Assign later" row */}
                <button
                  type="button"
                  onClick={() => handleTechnicianClick(null)}
                  className={`w-full text-left px-4 py-3 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 ${
                    formData.assignedTechnician === "" ? "bg-blue-50" : ""
                  }`}
                >
                  Assign later (leave unassigned)
                </button>
              </div>

              {/* Busy warning */}
              {selectedTechnician && selectedTechnician.status === "Busy" && (
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-900">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <p>
                    Technician is currently busy with{" "}
                    {selectedTechnician.openJobs.length} open job
                    {selectedTechnician.openJobs.length !== 1 ? "s" : ""}. Make
                    sure scheduling does not conflict.
                  </p>
                </div>
              )}

              {/* Selected technician details */}
              {selectedTechnician && (
                <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {selectedTechnician.name}
                    </span>
                    {employmentBadge(selectedTechnician.employmentType)}
                  </div>
                  <p>
                    <span className="text-gray-500">Specialty:</span>{" "}
                    {selectedTechnician.specialty}
                  </p>
                  <p>
                    <span className="text-gray-500">Distance:</span>{" "}
                    {selectedTechnician.distance} km from job location
                  </p>
                  <p>
                    {selectedTechnician.employmentType === "Freelancer" ? (
                      <>
                        <span className="text-gray-500">Commission Rate:</span>{" "}
                        <span className="text-purple-700">
                          {selectedTechnician.commissionRate}%
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-500">Bonus Rate:</span>{" "}
                        <span className="text-blue-700">
                          {selectedTechnician.bonusRate}%
                        </span>
                      </>
                    )}
                  </p>
                </div>
              )}
            </section>

            {/* Notes */}
            <section className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Additional Notes
              </h3>
              <label
                htmlFor="notes"
                className="text-xs font-medium text-gray-700"
              >
                Work Order Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any special instructions or notes for the technician..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001]/30 focus:border-[#c20001] resize-none"
              />
            </section>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.scheduledDate || !formData.scheduledTime}
                className="flex-1 inline-flex items-center justify-center rounded-md bg-[#c20001] px-4 py-2 text-sm font-medium text-white hover:bg-[#a00001] disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Work Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
