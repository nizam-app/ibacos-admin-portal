// src/pages/dispatcher/DispatcherServiceRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Swal from "sweetalert2";
import axiosClient from "../../api/axiosClient";

// ------------------ helpers ------------------

// priority badge colour
const getPriorityClasses = (priority) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-50 text-red-700 border-red-100";
    case "LOW":
      return "bg-green-50 text-green-700 border-green-100";
    default:
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
  }
};

// status badge colour
const getStatusClasses = (status) => {
  if (!status) return "bg-gray-50 text-gray-600 border-gray-100";

  const s = status.toLowerCase();
  if (s.includes("pending")) return "bg-yellow-50 text-yellow-700 border-yellow-100";
  if (s.includes("cancel")) return "bg-gray-50 text-gray-600 border-gray-100";
  if (s.includes("resolved") || s.includes("converted"))
    return "bg-green-50 text-green-700 border-green-100";

  return "bg-blue-50 text-blue-700 border-blue-100";
};

// technician status chip (based on availability + locationStatus)
const getTechStatusChip = (tech) => {
  if (tech.availability === "BUSY") {
    return {
      label: "Busy",
      classes: "bg-orange-50 text-orange-700 border-orange-100",
      dot: "bg-orange-500",
    };
  }

  if (tech.locationStatus === "ONLINE") {
    return {
      label: "Active",
      classes: "bg-green-50 text-green-700 border-green-100",
      dot: "bg-green-500",
    };
  }

  return {
    label: "Offline",
    classes: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  };
};

// ------------------ main component ------------------

const DispatcherServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSr, setSelectedSr] = useState(null);

  const [scheduledAt, setScheduledAt] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("120");
  const [notes, setNotes] = useState("");

  // technician data
  const [technicians, setTechnicians] = useState([]);
  const [technicianLoading, setTechnicianLoading] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);

  // ------------------ data fetch ------------------

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/sr");
      setServiceRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load service requests", error);
      Swal.fire("Error", "Failed to load service requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  // new: get nearby technicians based on SR location
  const fetchTechnicians = async (sr) => {
    if (!sr) {
      setTechnicians([]);
      return;
    }

    const { latitude, longitude } = sr;

    if (latitude == null || longitude == null) {
      Swal.fire(
        "Info",
        "This service request has no location coordinates, so nearby technicians cannot be loaded. You can still convert without assigning a technician.",
        "info"
      );
      setTechnicians([]);
      return;
    }

    try {
      setTechnicianLoading(true);

      const res = await axiosClient.get("/dispatcher/technicians/nearby", {
        params: {
          latitude,
          longitude,
          maxDistance: 50,
          status: "ONLINE",
        },
      });

      const data = res.data;
      setTechnicians(
        data && Array.isArray(data.technicians) ? data.technicians : []
      );
    } catch (error) {
      console.error("Failed to load technicians", error);
      Swal.fire("Error", "Failed to load technicians list.", "error");
      setTechnicians([]);
    } finally {
      setTechnicianLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  // ------------------ filters / derived data ------------------

  const categories = useMemo(() => {
    const set = new Set();
    serviceRequests.forEach((sr) => {
      if (sr?.category?.name) set.add(sr.category.name);
    });
    return Array.from(set);
  }, [serviceRequests]);

  const statuses = useMemo(() => {
    const set = new Set();
    serviceRequests.forEach((sr) => {
      if (sr?.readableStatus) set.add(sr.readableStatus);
    });
    return Array.from(set);
  }, [serviceRequests]);

  const filteredRequests = useMemo(() => {
    return serviceRequests.filter((sr) => {
      const matchSearch =
        !searchQuery ||
        sr.srNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sr.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sr.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        categoryFilter === "ALL" || sr.category?.name === categoryFilter;

      const matchStatus =
        statusFilter === "ALL" || sr.readableStatus === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [serviceRequests, searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ------------------ modal handlers ------------------

  const openConvertModal = (sr) => {
    setSelectedSr(sr);

    // default scheduledAt: if API has scheduledAt use that, else now/blank
    let defaultDate =
      sr?.scheduledAt || sr?.preferredAppointmentDate || null;
    if (defaultDate) {
      const d = new Date(defaultDate);
      const local = new Date(
        d.getTime() - d.getTimezoneOffset() * 60000
      ).toISOString();
      setScheduledAt(local.slice(0, 16));
    } else {
      setScheduledAt("");
    }

    setEstimatedDuration("120");
    setNotes("");
    setSelectedTechnicianId(null);

    setIsModalOpen(true);
    fetchTechnicians(sr);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSr(null);
    setSelectedTechnicianId(null);
  };

  const handleConvertToWo = async () => {
    if (!selectedSr) return;

    if (!scheduledAt) {
      Swal.fire("Validation", "Please select scheduled date & time.", "warning");
      return;
    }

    if (!estimatedDuration || Number.isNaN(Number(estimatedDuration))) {
      Swal.fire(
        "Validation",
        "Please provide a valid estimated duration in minutes.",
        "warning"
      );
      return;
    }

    try {
      const isoDate = new Date(scheduledAt).toISOString();

      const payload = {
        scheduledAt: isoDate,
        estimatedDuration: Number(estimatedDuration),
        notes: notes || "",
      };

      if (selectedTechnicianId) {
        payload.technicianId = selectedTechnicianId;
      }

      const res = await axiosClient.post(
        `/wos/from-sr/${selectedSr.id}`,
        payload
      );

      const woNumber = res?.data?.woNumber || "Work Order";

      Swal.fire(
        "Converted",
        `${woNumber} has been created successfully.`,
        "success"
      );

      closeModal();
      fetchServiceRequests();
    } catch (error) {
      console.error("Failed to convert SR to WO", error);
      const message =
        error.response?.data?.message ||
        "Failed to convert service request to work order.";
      Swal.fire("Error", message, "error");
    }
  };

  // ------------------ UI ------------------

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading service requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Service Requests
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Convert service requests to work orders
        </p>
      </div>

      {/* Filters + header card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#c20001] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c20001]"
              placeholder="Search by ID, customer name, or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Right filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Category filter */}
            <select
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#c20001] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c20001]"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#c20001] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c20001]"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Status</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* summary line */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-2 text-xs text-gray-500">
          <p>
            Showing {paginatedRequests.length} of {filteredRequests.length} SRs
          </p>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-gray-100 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">SR ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-6 text-center text-sm text-gray-500"
                  >
                    No service requests found.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((sr) => (
                  <tr key={sr.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-4 text-sm font-medium text-[#c20001]">
                      {sr.srNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sr.customer?.name || "N/A"}
                      <div className="text-xs text-gray-500">
                        {sr.customer?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sr.category?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                          getPriorityClasses(sr.priority)
                        }
                      >
                        {sr.priority || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                          getStatusClasses(sr.readableStatus)
                        }
                      >
                        {sr.readableStatus || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sr.createdAt
                        ? new Date(sr.createdAt).toISOString().slice(0, 10)
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openConvertModal(sr)}
                        className="inline-flex items-center rounded-full bg-[#c20001] px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#9a0001]"
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

        {/* pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 text-xs text-gray-600">
          <div>
            Showing{" "}
            {filteredRequests.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}{" "}
            to{" "}
            {Math.min(currentPage * pageSize, filteredRequests.length)} of{" "}
            {filteredRequests.length} results
          </div>
          <div className="inline-flex items-center gap-1">
            <button
              className="rounded-md border border-gray-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[32px] rounded-md border px-2 py-1 ${
                    p === currentPage
                      ? "border-[#c20001] bg-[#c20001] text-white"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              className="rounded-md border border-gray-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ------------------ Convert Modal ------------------ */}
      {isModalOpen && selectedSr && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            {/* header */}
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Convert Service Request to Work Order
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  SR: {selectedSr.srNumber} ·{" "}
                  {selectedSr.customer?.name || "N/A"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* body */}
            <div className="max-h-[75vh] space-y-6 overflow-y-auto px-6 py-5">
              {/* Service info summary box */}
              <div className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-700">
                <p className="font-medium text-gray-900">
                  Address:{" "}
                  <span className="font-normal">
                    {selectedSr.address || "N/A"}
                  </span>
                </p>
                <p className="mt-1">
                  <span className="font-medium">Category:</span>{" "}
                  {selectedSr.category?.name || "N/A"} ·{" "}
                  {selectedSr.subservice?.name || "N/A"}{" "}
                  {selectedSr.service?.name
                    ? `· ${selectedSr.service.name}`
                    : ""}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Priority:</span>{" "}
                  {selectedSr.priority || "N/A"}
                </p>
              </div>

              {/* Scheduling section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Scheduling
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Scheduled Date &amp; Time{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-[#c20001] focus:outline-none focus:ring-1 focus:ring-[#c20001]"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Estimated Duration (minutes){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={15}
                      step={15}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-[#c20001] focus:outline-none focus:ring-1 focus:ring-[#c20001]"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Technician assignment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Technician Assignment
                  </h3>
                  <p className="text-xs text-gray-500">
                    Assign now or leave unassigned (optional)
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 text-xs text-gray-600">
                    <span>Sorted by distance (nearest first)</span>
                    <span>
                      {technicianLoading
                        ? "Loading technicians..."
                        : `${technicians.length} technicians`}
                    </span>
                  </div>

                  <div className="max-h-56 divide-y divide-gray-100 overflow-y-auto">
                    {technicianLoading ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-500">
                        Loading...
                      </div>
                    ) : technicians.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-500">
                        No technicians available nearby.
                      </div>
                    ) : (
                      technicians.map((tech) => {
                        const statusMeta = getTechStatusChip(tech);
                        const isSelected =
                          selectedTechnicianId === tech.id;
                        return (
                          <button
                            key={tech.id}
                            type="button"
                            onClick={() =>
                              setSelectedTechnicianId(
                                tech.id === selectedTechnicianId ? null : tech.id
                              )
                            }
                            className={`flex w-full items-start justify-between px-4 py-3 text-left text-xs transition ${
                              isSelected ? "bg-[#fff5f5]" : "hover:bg-gray-50"
                            }`}
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {tech.name}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-600">
                                {tech.specialization || "Specialization N/A"}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusMeta.classes}`}
                                >
                                  <span
                                    className={`mr-1 h-1.5 w-1.5 rounded-full ${statusMeta.dot}`}
                                  />
                                  {statusMeta.label}
                                </span>

                                <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
                                  {tech.type || "Technician"}
                                </span>

                                {tech.distanceKm && (
                                  <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
                                    {tech.distanceKm}
                                    {tech.estimatedTravelTime
                                      ? ` · ${tech.estimatedTravelTime}`
                                      : ""}
                                  </span>
                                )}

                                {typeof tech.openJobsCount === "number" && (
                                  <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
                                    Open: {tech.openJobsCount}
                                  </span>
                                )}
                              </div>
                            </div>

                            {isSelected && (
                              <div className="mt-1 text-xs font-medium text-[#c20001]">
                                Selected
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* assign later */}
                  <button
                    type="button"
                    onClick={() => setSelectedTechnicianId(null)}
                    className="flex w-full items-center justify-between px-4 py-2 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    <span>Assign later (leave unassigned)</span>
                    {!selectedTechnicianId && (
                      <span className="text-[11px] font-medium text-[#c20001]">
                        Selected
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* notes */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Notes for technician
                </label>
                <textarea
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-[#c20001] focus:outline-none focus:ring-1 focus:ring-[#c20001]"
                  placeholder="Add any special instructions or notes for the technician..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={closeModal}
                className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertToWo}
                className="rounded-full bg-[#c20001] px-5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#9a0001]"
              >
                Convert to WO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatcherServiceRequests;
