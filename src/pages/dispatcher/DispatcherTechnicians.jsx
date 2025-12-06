// src/pages/dispatcher/DispatcherTechnicians.jsx

import React, { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Edit3,
  Ban,
  CheckCircle2,
  Download,
  BriefcaseBusiness,
  Users as UsersIcon,
  UserX,
  UserCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import AddEditTechnicianModal from "../../components/technicians/AddEditTechnicianModal";
import { BlockTechnicianModal } from "../../components/technicians/BlockTechnicianModal";

// ---------------- MOCK DATA ----------------

const INITIAL_TECHNICIANS = [
  {
    id: "TECH-001",
    name: "Ahmed Hassan",
    specialty: "Electrical",
    phone: "+971 50 111 1111",
    email: "ahmed@serviopro.com",
    status: "Active",
    activeWorkOrders: 1,
    completedJobs: 12,
    employmentType: "Freelancer",
    commissionRate: 10,
    joinDate: "2025-01-05",
    hasCompensationOverride: false,
    openWorkOrders: [],
  },
  {
    id: "TECH-002",
    name: "Mohammad Ali",
    specialty: "Electrical",
    phone: "+971 50 222 2222",
    email: "m.ali@serviopro.com",
    status: "Active",
    activeWorkOrders: 0,
    completedJobs: 9,
    employmentType: "Internal Employee",
    salary: 5500,
    bonusRate: 5,
    joinDate: "2025-02-10",
    hasCompensationOverride: false,
    openWorkOrders: [],
  },
  {
    id: "TECH-003",
    name: "Salim Khan",
    specialty: "General",
    phone: "+971 50 333 3333",
    email: "salim@serviopro.com",
    status: "Active",
    activeWorkOrders: 0,
    completedJobs: 4,
    employmentType: "Freelancer",
    commissionRate: 10,
    joinDate: "2025-03-02",
    hasCompensationOverride: false,
    openWorkOrders: [],
  },
  {
    id: "TECH-004",
    name: "Imran Siddiq",
    specialty: "HVAC",
    phone: "+971 50 444 4444",
    email: "imran@serviopro.com",
    status: "Active",
    activeWorkOrders: 1,
    completedJobs: 7,
    employmentType: "Internal Employee",
    salary: 6000,
    bonusRate: 6,
    joinDate: "2025-01-18",
    hasCompensationOverride: false,
    openWorkOrders: [],
  },
  {
    id: "TECH-005",
    name: "Nabil Rahman",
    specialty: "Plumbing",
    phone: "+971 50 555 5555",
    email: "nabil@serviopro.com",
    status: "Active",
    activeWorkOrders: 0,
    completedJobs: 5,
    employmentType: "Freelancer",
    commissionRate: 10,
    joinDate: "2025-02-22",
    hasCompensationOverride: false,
    openWorkOrders: [],
  },
  {
    id: "TECH-006",
    name: "Omar Faruk",
    specialty: "Plumbing",
    phone: "+971 50 666 6666",
    email: "omar@serviopro.com",
    status: "Blocked",
    blockedReason: "Multiple no-shows on scheduled jobs",
    blockedDate: "2025-03-15",
    activeWorkOrders: 0,
    completedJobs: 3,
    employmentType: "Internal Employee",
    salary: 5200,
    bonusRate: 4,
    joinDate: "2024-12-10",
    hasCompensationOverride: false,
    openWorkOrders: [],
  },
];

// KPI colors (Electrical, General, HVAC, Plumbing, others)
const COLORS = [
  "#c20001", // red
  "#f59e0b", // amber (General)
  "#8b5cf6", // purple (HVAC)
  "#3b82f6", // blue (Plumbing)
  "#10b981",
  "#ef4444",
  "#6366f1",
];

// read role from localStorage.user.role
const getUserRoleFromStorage = () => {
  if (typeof window === "undefined") return "dispatcher";

  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "dispatcher";
    const parsed = JSON.parse(raw);
    return parsed.role === "ADMIN" ? "admin" : "dispatcher";
  } catch {
    return "dispatcher";
  }
};

const DispatcherTechnicians = () => {
  const [technicians, setTechnicians] = useState(INITIAL_TECHNICIANS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all | Freelancer | Internal Employee
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [modalAction, setModalAction] = useState(null); // "block" | "unblock"
  const [userRole] = useState(getUserRoleFromStorage);

  // ---------- helpers ----------
  const allSpecializations = useMemo(() => {
    return Array.from(new Set(technicians.map((t) => t.specialty))).sort();
  }, [technicians]);

  const applyTypeAndSpecFilters = (list) =>
    list.filter((t) => {
      const matchesType =
        filterType === "all" || t.employmentType === filterType;
      const matchesSpec =
        selectedSpecializations.length === 0 ||
        selectedSpecializations.includes(t.specialty);
      return matchesType && matchesSpec;
    });

  // KPI base list (no search)
  const techniciansForKPI = applyTypeAndSpecFilters(technicians);
  const totalTechnicians = techniciansForKPI.length;

  // Directory list (search + filters)
  const filteredTechnicians = applyTypeAndSpecFilters(technicians).filter(
    (tech) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        tech.name.toLowerCase().includes(q) ||
        tech.specialty.toLowerCase().includes(q) ||
        tech.id.toLowerCase().includes(q)
      );
    }
  );

  const freelancers = techniciansForKPI.filter(
    (t) => t.employmentType === "Freelancer"
  ).length;
  const employees = techniciansForKPI.filter(
    (t) => t.employmentType === "Internal Employee"
  ).length;

  const specCountMap = techniciansForKPI.reduce((acc, t) => {
    acc[t.specialty] = (acc[t.specialty] || 0) + 1;
    return acc;
  }, {});

  const orderedSpecs = ["Electrical", "General", "HVAC", "Plumbing"].filter(
    (s) => allSpecializations.includes(s)
  );
  const extraSpecs = allSpecializations.filter(
    (s) => !orderedSpecs.includes(s)
  );

  const specializationCounts = [...orderedSpecs, ...extraSpecs].map((name) => {
    const value = specCountMap[name] || 0;
    const percentage =
      totalTechnicians > 0
        ? Math.round((value / totalTechnicians) * 100)
        : 0;
    return { name, value, percentage };
  });

  const toggleSpecialization = (spec) => {
    setSelectedSpecializations((prev) =>
      prev.includes(spec)
        ? prev.filter((s) => s !== spec)
        : [...prev, spec]
    );
  };

  const clearSpecializationFilters = () => {
    setSelectedSpecializations([]);
  };

  // ---------- actions ----------

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Specialty",
      "Phone",
      "Email",
      "Status",
      "Employment Type",
      "Active Work Orders",
      "Completed Jobs",
      "Join Date",
    ];

    const rows = technicians.map((t) => [
      t.id,
      t.name,
      t.specialty,
      t.phone,
      t.email,
      t.status,
      t.employmentType,
      t.activeWorkOrders,
      t.completedJobs,
      t.joinDate,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `technicians_${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "CSV exported",
      text: "Technician list has been downloaded.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleAddNew = () => {
    setEditingTechnician(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditClick = (tech) => {
    setEditingTechnician(tech);
    setIsAddEditModalOpen(true);
  };

  const handleSaveTechnician = (data) => {
    if (editingTechnician) {
      // update
      setTechnicians((prev) =>
        prev.map((t) =>
          t.id === editingTechnician.id ? { ...t, ...data } : t
        )
      );
      Swal.fire({
        icon: "success",
        title: "Technician updated",
        timer: 1400,
        showConfirmButton: false,
      });
    } else {
      // add
      const newTech = {
        id: `TECH-${String(technicians.length + 1).padStart(3, "0")}`,
        activeWorkOrders: 0,
        completedJobs: 0,
        blockedReason: null,
        blockedDate: null,
        ...data,
      };
      setTechnicians((prev) => [...prev, newTech]);
      Swal.fire({
        icon: "success",
        title: "Technician added",
        timer: 1400,
        showConfirmButton: false,
      });
    }

    setIsAddEditModalOpen(false);
    setEditingTechnician(null);
  };

  const handleBlockClick = (tech) => {
    setSelectedTechnician(tech);
    setModalAction("block");
  };

  const handleUnblockClick = (tech) => {
    setSelectedTechnician(tech);
    setModalAction("unblock");
  };

  const handleConfirmBlockUnblock = (technicianId, reason) => {
    if (modalAction === "block") {
      const today = new Date().toISOString().split("T")[0];
      setTechnicians((prev) =>
        prev.map((t) =>
          t.id === technicianId
            ? {
                ...t,
                status: "Blocked",
                blockedReason: reason || "",
                blockedDate: today,
              }
            : t
        )
      );
      Swal.fire({
        icon: "success",
        title: "Technician blocked",
        text: "Technician can no longer receive new work orders.",
      });
    } else if (modalAction === "unblock") {
      setTechnicians((prev) =>
        prev.map((t) =>
          t.id === technicianId
            ? { ...t, status: "Active" }
            : t
        )
      );
      Swal.fire({
        icon: "success",
        title: "Technician unblocked",
      });
    }

    setSelectedTechnician(null);
    setModalAction(null);
  };

  // ---------- badge helpers ----------

  const getEmploymentTypeBadge = (type) => {
    if (type === "Freelancer") {
      return (
        <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-xs">
          <BriefcaseBusiness className="w-3 h-3 mr-1" />
          Freelancer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">
        <UsersIcon className="w-3 h-3 mr-1" />
        Employee
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === "Active") {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs">
        <Ban className="w-3 h-3 mr-1" />
        Blocked
      </span>
    );
  };

  // ================== RENDER ==================

  return (
    <div className="space-y-6">
      {/* Technician Overview - ADMIN ONLY */}
      {userRole === "admin" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#c20001]">
                Technician Overview
              </h2>
              <p className="text-sm text-gray-500">
                Filter by specialization and view distribution statistics
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-[#c20001] text-white text-xs px-3 py-1">
              Admin only
            </span>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* filter chips + actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 mr-1">Filter by:</span>

                {/* All chip */}
                <button
                  type="button"
                  onClick={clearSpecializationFilters}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    selectedSpecializations.length === 0
                      ? "bg-[#c20001] text-white border-[#c20001]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  All
                </button>

                {allSpecializations.map((spec) => {
                  const active = selectedSpecializations.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialization(spec)}
                      className={`px-3 py-1.5 rounded-full text-sm border flex items-center gap-1 ${
                        active
                          ? "bg-[#c20001] text-white border-[#c20001]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <span>{spec}</span>
                      {active && <span className="text-xs">✕</span>}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center px-3 py-2 border border-[#c20001] text-[#c20001] rounded-lg text-sm hover:bg-[#c20001] hover:text-white transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={handleAddNew}
                  className="inline-flex items-center px-3 py-2 rounded-lg bg-[#c20001] text-white text-sm hover:bg-[#c20001]/90"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Technician
                </button>
              </div>
            </div>

            {/* KPI + donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* KPI cards */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div className="border-2 border-[#c20001] rounded-2xl px-4 py-6 flex flex-col items-center justify-center bg-white">
                  <p className="text-3xl font-semibold text-[#c20001]">
                    {totalTechnicians}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">Total</p>
                </div>

                {specializationCounts.map((item, idx) => (
                  <div
                    key={item.name}
                    className="border border-gray-200 rounded-2xl px-4 py-6 flex flex-col items-center justify-center bg-white"
                  >
                    <p
                      className="text-3xl font-semibold"
                      style={{ color: COLORS[idx % COLORS.length] }}
                    >
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{item.name}</p>
                  </div>
                ))}
              </div>

              {/* donut */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                <h3 className="text-sm text-gray-700 mb-4 text-center">
                  Distribution by Specialization
                </h3>

                {totalTechnicians > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={specializationCounts.filter((s) => s.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {specializationCounts
                          .filter((s) => s.value > 0)
                          .map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, _name, props) => [
                          `${value} (${props.payload.percentage}%)`,
                          props.payload.name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
                    No data to display
                  </div>
                )}

                {totalTechnicians > 0 && (
                  <div className="mt-4 space-y-1 text-xs">
                    {specializationCounts
                      .filter((s) => s.value > 0)
                      .map((item, idx) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: COLORS[idx % COLORS.length],
                              }}
                            />
                            <span className="text-gray-700">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-gray-600">
                            {item.value} ({item.percentage}%)
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* employment type filter row (bottom) */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600 mr-2">
                Employment Type:
              </span>

              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  filterType === "all"
                    ? "bg-[#c20001] text-white border-[#c20001]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                All ({totalTechnicians})
              </button>

              <button
                type="button"
                onClick={() => setFilterType("Freelancer")}
                className={`px-3 py-1.5 rounded-full text-sm border inline-flex items-center gap-1 ${
                  filterType === "Freelancer"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                <BriefcaseBusiness className="w-3 h-3" />
                Freelancers ({freelancers})
              </button>

              <button
                type="button"
                onClick={() => setFilterType("Internal Employee")}
                className={`px-3 py-1.5 rounded-full text-sm border inline-flex items-center gap-1 ${
                  filterType === "Internal Employee"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                <UsersIcon className="w-3 h-3" />
                Employees ({employees})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Technicians Directory
              </h2>
              <p className="text-sm text-gray-500">
                {filteredTechnicians.length} technician
                {filteredTechnicians.length !== 1 ? "s" : ""} found
                {userRole === "admin" &&
                  selectedSpecializations.length > 0 && (
                    <span>
                      {" "}
                      (filtered by:{" "}
                      {selectedSpecializations.join(", ")})
                    </span>
                  )}
              </p>
            </div>

            {userRole === "dispatcher" && (
              <button
                type="button"
                onClick={handleAddNew}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-[#c20001] text-white text-sm hover:bg-[#c20001]/90"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Technician
              </button>
            )}
          </div>

          {userRole === "dispatcher" && (
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-600 mr-2">
                Employment Type:
              </span>

              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  filterType === "all"
                    ? "bg-[#c20001] text-white border-[#c20001]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                All ({totalTechnicians})
              </button>

              <button
                type="button"
                onClick={() => setFilterType("Freelancer")}
                className={`px-3 py-1.5 rounded-full text-sm border inline-flex items-center gap-1 ${
                  filterType === "Freelancer"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                <BriefcaseBusiness className="w-3 h-3" />
                Freelancers ({freelancers})
              </button>

              <button
                type="button"
                onClick={() => setFilterType("Internal Employee")}
                className={`px-3 py-1.5 rounded-full text-sm border inline-flex items-center gap-1 ${
                  filterType === "Internal Employee"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                <UsersIcon className="w-3 h-3" />
                Employees ({employees})
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-5">
          {/* search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, specialty, or ID..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c20001] focus:border-[#c20001]"
              />
            </div>
          </div>

          {/* list */}
          {filteredTechnicians.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No technicians found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTechnicians.map((tech) => (
                <div
                  key={tech.id}
                  className={`border rounded-xl p-4 ${
                    tech.status === "Blocked"
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-[#c20001]">
                          {tech.name}
                        </h3>
                        {getStatusBadge(tech.status)}
                        {tech.hasCompensationOverride && (
                          <span className="inline-flex items-center rounded-full border border-[#c20001] text-[#c20001] px-2 py-0.5 text-xs">
                            Override
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{tech.id}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="inline-flex items-center rounded-full border border-[#ffb111] text-[#ffb111] px-2 py-0.5 text-xs">
                        {tech.specialty}
                      </span>
                      {getEmploymentTypeBadge(tech.employmentType)}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Phone:</span>
                      <span>{tech.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email:</span>
                      <span>{tech.email}</span>
                    </div>

                    {tech.employmentType === "Freelancer" &&
                      tech.commissionRate && (
                        <div className="flex items-center justify-between">
                          <span>Commission Rate:</span>
                          <span className="text-purple-600">
                            {tech.commissionRate}%
                          </span>
                        </div>
                      )}

                    {tech.employmentType === "Internal Employee" && (
                      <>
                        {tech.salary && (
                          <div className="flex items-center justify-between">
                            <span>Monthly Salary:</span>
                            <span className="text-blue-600">
                              ${tech.salary.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {tech.bonusRate && (
                          <div className="flex items-center justify-between">
                            <span>Bonus Rate:</span>
                            <span className="text-blue-600">
                              {tech.bonusRate}%
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex items-center justify-between">
                      <span>Active Work Orders:</span>
                      <span className="text-[#c20001]">
                        {tech.activeWorkOrders}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Completed Jobs:</span>
                      <span className="text-green-600">
                        {tech.completedJobs}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Open Work Orders:</span>
                      <span className="text-gray-900">
                        {tech.openWorkOrders?.length || 0}
                      </span>
                    </div>
                  </div>

                  {tech.status === "Blocked" && tech.blockedReason && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded">
                      <p className="text-xs text-red-900">
                        Blocked on {tech.blockedDate}
                      </p>
                      <p className="text-sm text-red-800 mt-1">
                        Reason: {tech.blockedReason}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(tech)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </button>

                    {tech.status === "Active" ? (
                      <button
                        type="button"
                        onClick={() => handleBlockClick(tech)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-600 text-red-600 rounded-lg text-sm hover:bg-red-600 hover:text-white"
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Block
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUnblockClick(tech)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Unblock
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Block / Unblock modal */}
      {selectedTechnician && modalAction && (
        <BlockTechnicianModal
          technician={selectedTechnician}
          action={modalAction}
          onClose={() => {
            setSelectedTechnician(null);
            setModalAction(null);
          }}
          onConfirm={handleConfirmBlockUnblock}
        />
      )}

      {/* Add / Edit modal */}
      {isAddEditModalOpen && (
        <AddEditTechnicianModal
          isOpen={isAddEditModalOpen}
          onClose={() => {
            setIsAddEditModalOpen(false);
            setEditingTechnician(null);
          }}
          onSave={handleSaveTechnician}
          technician={editingTechnician}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default DispatcherTechnicians;
