import React, { useMemo, useState } from "react";
import {
  UserCheck,
  UserX,
  Briefcase,
  Users,
  Search,
  Filter,
  Download,
  BarChart3,
  Percent,
  DollarSign,
  Info,
  Plus,
  Phone,
  Mail,
  Eye,
  Calendar,
} from "lucide-react";

import BlockTechnicianModal from "../../components/technicians/BlockTechnicianModal";
import AddEditTechnicianModal from "../../components/technicians/AddEditTechnicianModal";
import TechnicianWorkloadModal from "../../components/technicians/TechnicianWorkloadModal";

// -----------------------------
// Global compensation defaults
// -----------------------------
export const GLOBAL_COMMISSION_RATE = 10; // %
export const GLOBAL_BASE_SALARY = 5000;   // $  
export const GLOBAL_BONUS_RATE = 5;       // %

// -----------------------------
// Mock Data (replace with API later)
// -----------------------------
const initialTechnicians = [
  {
    id: "TECH-001",
    name: "Ahmed Khan",
    specialty: "Electrical",
    phone: "+971 50 123 4567",
    email: "ahmed.khan@example.com",
    status: "Active", // Active | Blocked
    blockedReason: "",
    blockedDate: "",
    activeWorkOrders: 2,
    completedJobs: 18,
    employmentType: "Freelancer", // Freelancer | Internal Employee
    commissionRate: GLOBAL_COMMISSION_RATE,
    salary: null,
    bonusRate: null,
    hasCompensationOverride: true,
    commissionRateOverride: 12.5,
    salaryOverride: null,
    bonusRateOverride: null,
    joinDate: "2024-06-01",
    openWorkOrders: [
      {
        id: "WO-1023",
        status: "Assigned",
        scheduledDate: "2025-03-10",
        scheduledTime: "10:30 AM",
        customerName: "John Doe",
        category: "Electrical",
      },
      {
        id: "WO-1027",
        status: "In Progress",
        scheduledDate: "2025-03-11",
        scheduledTime: "02:00 PM",
        customerName: "Sarah Lee",
        category: "Electrical",
      },
    ],
  },
  {
    id: "TECH-002",
    name: "Maria Garcia",
    specialty: "Plumbing",
    phone: "+971 50 987 6543",
    email: "maria.plumb@example.com",
    status: "Active",
    blockedReason: "",
    blockedDate: "",
    activeWorkOrders: 1,
    completedJobs: 25,
    employmentType: "Internal Employee",
    commissionRate: null,
    salary: GLOBAL_BASE_SALARY,
    bonusRate: GLOBAL_BONUS_RATE,
    hasCompensationOverride: false,
    commissionRateOverride: null,
    salaryOverride: null,
    bonusRateOverride: null,
    joinDate: "2023-11-15",
    openWorkOrders: [
      {
        id: "WO-1101",
        status: "Pending",
        scheduledDate: "2025-03-12",
        scheduledTime: "09:00 AM",
        customerName: "ACME Corp.",
        category: "Plumbing",
      },
    ],
  },
  {
    id: "TECH-003",
    name: "Omar Ali",
    specialty: "HVAC",
    phone: "+971 55 111 2222",
    email: "omar.hvac@example.com",
    status: "Blocked",
    blockedReason: "Repeated no-shows for scheduled jobs.",
    blockedDate: "2025-01-15",
    activeWorkOrders: 0,
    completedJobs: 9,
    employmentType: "Freelancer",
    commissionRate: GLOBAL_COMMISSION_RATE,
    salary: null,
    bonusRate: null,
    hasCompensationOverride: false,
    commissionRateOverride: null,
    salaryOverride: null,
    bonusRateOverride: null,
    joinDate: "2024-01-10",
    openWorkOrders: [],
  },
];

// -----------------------------
// Small helper components
// -----------------------------
function Badge({ className = "", children }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
        className
      }
    >
      {children}
    </span>
  );
}

function StatCard({ title, value, subtitle, colorClass, icon: Icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-400 whitespace-nowrap">
            {subtitle}
          </p>
        )}
      </div>
      <div
        className={
          "p-3 rounded-lg flex items-center justify-center " + colorClass
        }
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}

function statusBadge(status) {
  if (status === "Active") {
    return (
      <Badge className="bg-green-100 text-green-800 border border-green-200">
        Active
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border border-red-200">
      Blocked
    </Badge>
  );
}

function employmentBadge(type) {
  if (type === "Freelancer") {
    return (
      <Badge className="bg-purple-100 text-purple-800 border border-purple-200">
        <Briefcase className="w-3 h-3 mr-1" />
        Freelancer
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
      <Users className="w-3 h-3 mr-1" />
      Employee
    </Badge>
  );
}

// -----------------------------
// Main Page – AdminTechniciansPage
// -----------------------------
export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState(initialTechnicians);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | freelancer | employee
  const [selectedSpecs, setSelectedSpecs] = useState([]); // specialization chips

  // modal state
  const [blockTarget, setBlockTarget] = useState(null);
  const [blockMode, setBlockMode] = useState("block"); // block | unblock

  const [editTarget, setEditTarget] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const [workloadTarget, setWorkloadTarget] = useState(null);

  // list of all specializations
  const allSpecializations = useMemo(
    () => Array.from(new Set(technicians.map((t) => t.specialty))).sort(),
    [technicians]
  );

  // Top stats
  const stats = useMemo(() => {
    const total = technicians.length;
    const active = technicians.filter((t) => t.status === "Active").length;
    const blocked = technicians.filter((t) => t.status === "Blocked").length;
    const freelancers = technicians.filter(
      (t) => t.employmentType === "Freelancer"
    ).length;
    const employees = technicians.filter(
      (t) => t.employmentType === "Internal Employee"
    ).length;

    return { total, active, blocked, freelancers, employees };
  }, [technicians]);

  // Filtered list
  const filteredTechnicians = useMemo(() => {
    return technicians.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.specialty.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (typeFilter === "freelancer" && t.employmentType !== "Freelancer")
        return false;
      if (typeFilter === "employee" && t.employmentType !== "Internal Employee")
        return false;

      if (selectedSpecs.length > 0 && !selectedSpecs.includes(t.specialty))
        return false;

      return true;
    });
  }, [technicians, searchTerm, typeFilter, selectedSpecs]);

  const specializationCounts = useMemo(() => {
    const total = filteredTechnicians.length || 1;
    return allSpecializations.map((spec) => {
      const count = filteredTechnicians.filter(
        (t) => t.specialty === spec
      ).length;
      return {
        name: spec,
        value: count,
        percentage: Math.round((count / total) * 100),
      };
    });
  }, [filteredTechnicians, allSpecializations]);

  // -----------------------------
  // Actions
  // -----------------------------
  const toggleSpec = (spec) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const clearSpecFilter = () => setSelectedSpecs([]);

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

    const rows = filteredTechnicians.map((t) => [
      t.id,
      t.name,
      t.specialty,
      t.phone,
      t.email || "",
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
    const today = new Date().toISOString().split("T")[0];

    link.href = url;
    link.download = `technicians_${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openBlockModal = (technician, mode) => {
    setBlockTarget(technician);
    setBlockMode(mode);
  };

  const handleConfirmBlockAction = (reason) => {
    if (!blockTarget) return;

    setTechnicians((prev) =>
      prev.map((t) => {
        if (t.id !== blockTarget.id) return t;

        if (blockMode === "block") {
          return {
            ...t,
            status: "Blocked",
            blockedReason: reason || "",
            blockedDate: new Date().toISOString().split("T")[0],
          };
        }

        // unblock
        return {
          ...t,
          status: "Active",
          blockedReason: "",
          blockedDate: "",
        };
      })
    );

    setBlockTarget(null);
  };

  const openEditModal = (technician = null) => {
    setEditTarget(technician);
    setEditOpen(true);
  };

  const handleSaveTechnician = (data) => {
    if (editTarget) {
      // update existing
      setTechnicians((prev) =>
        prev.map((t) =>
          t.id === editTarget.id
            ? {
                ...t,
                ...data,
              }
            : t
        )
      );
    } else {
      // add new
      const nextNumber = technicians.length + 1;
      const newId = `TECH-${String(nextNumber).padStart(3, "0")}`;
      const newTech = {
        id: newId,
        activeWorkOrders: 0,
        completedJobs: 0,
        blockedReason: data.status === "Blocked" ? "Blocked by admin" : "",
        blockedDate:
          data.status === "Blocked"
            ? new Date().toISOString().split("T")[0]
            : "",
        openWorkOrders: [],
        ...data,
      };
      setTechnicians((prev) => [...prev, newTech]);
    }

    setEditOpen(false);
    setEditTarget(null);
  };

  const openWorkloadModal = (technician) => {
    setWorkloadTarget(technician);
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Technicians Management
          </h1>
          <p className="text-sm text-gray-500">
            Admin-only overview of all technicians, compensation and workload.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center h-9 px-3 rounded-lg border border-[#c20001] text-sm font-medium text-[#c20001] hover:bg-[#c20001] hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => openEditModal(null)}
            className="inline-flex items-center h-9 px-3 rounded-lg bg-[#c20001] text-sm font-medium text-white hover:bg-[#a80001]"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Technician
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Technicians"
          value={stats.total}
          subtitle="Across all categories"
          colorClass="bg-[#c20001]"
          icon={Users}
        />
        <StatCard
          title="Active"
          value={stats.active}
          subtitle="Available for new jobs"
          colorClass="bg-green-600"
          icon={UserCheck}
        />
        <StatCard
          title="Blocked"
          value={stats.blocked}
          subtitle="Restricted from new jobs"
          colorClass="bg-red-600"
          icon={UserX}
        />
        <StatCard
          title="Freelancer vs Employee"
          value={`${stats.freelancers}/${stats.employees}`}
          subtitle="Freelancers / Employees"
          colorClass="bg-indigo-600"
          icon={BarChart3}
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
        {/* Row 1: Search + type filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search */}
          <div className="relative md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, specialty, or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Employment type filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center text-xs text-gray-500 mr-1">
              <Filter className="w-3 h-3 mr-1" />
              Employment:
            </span>
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={
                "h-8 px-3 rounded-full text-xs border " +
                (typeFilter === "all"
                  ? "bg-[#c20001] border-[#c20001] text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50")
              }
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("freelancer")}
              className={
                "h-8 px-3 rounded-full text-xs border flex items-center gap-1 " +
                (typeFilter === "freelancer"
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50")
              }
            >
              <Briefcase className="w-3 h-3" />
              Freelancers ({stats.freelancers})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("employee")}
              className={
                "h-8 px-3 rounded-full text-xs border flex items-center gap-1 " +
                (typeFilter === "employee"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50")
              }
            >
              <Users className="w-3 h-3" />
              Employees ({stats.employees})
            </button>
          </div>
        </div>

        {/* Row 2: Specialization chips + distribution summary */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 mr-1">Specialization:</span>

            <button
              type="button"
              onClick={clearSpecFilter}
              className={
                "h-7 px-3 rounded-full text-xs border " +
                (selectedSpecs.length === 0
                  ? "bg-[#c20001] border-[#c20001] text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50")
              }
            >
              All
            </button>

            {allSpecializations.map((spec) => {
              const active = selectedSpecs.includes(spec);
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpec(spec)}
                  className={
                    "h-7 px-3 rounded-full text-xs border " +
                    (active
                      ? "bg-[#c20001] border-[#c20001] text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50")
                  }
                >
                  {spec}
                </button>
              );
            })}
          </div>

          {/* Distribution mini-summary */}
          <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
            {specializationCounts.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full px-2 py-1"
              >
                <span className="font-medium text-gray-700">
                  {item.name}:
                </span>
                <span>
                  {item.value} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technicians list */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-gray-900">Technicians Directory</p>
            <p className="text-xs text-gray-500">
              {filteredTechnicians.length} technician
              {filteredTechnicians.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {filteredTechnicians.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            No technicians match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTechnicians.map((tech) => (
              <div
                key={tech.id}
                className={
                  "border rounded-xl p-4 flex flex-col justify-between gap-3 " +
                  (tech.status === "Blocked"
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-gray-200")
                }
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-[#c20001]">
                        {tech.name}
                      </p>
                      {statusBadge(tech.status)}
                      {tech.hasCompensationOverride && (
                        <Badge className="border border-[#c20001] text-[#c20001] bg-white">
                          Override
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{tech.id}</p>
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined: {tech.joinDate}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                      {tech.specialty}
                    </Badge>
                    {employmentBadge(tech.employmentType)}
                  </div>
                </div>

                {/* Contact + metrics */}
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone
                    </span>
                    <span>{tech.phone}</span>
                  </div>
                  {tech.email && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </span>
                      <span className="truncate max-w-[170px] text-right">
                        {tech.email}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Active Work Orders</span>
                    <span className="font-semibold text-[#c20001]">
                      {tech.activeWorkOrders}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed Jobs</span>
                    <span className="font-semibold text-green-600">
                      {tech.completedJobs}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Open Work Orders</span>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">
                        {tech.openWorkOrders?.length || 0}
                      </span>
                      {tech.openWorkOrders &&
                        tech.openWorkOrders.length > 0 && (
                          <button
                            type="button"
                            onClick={() => openWorkloadModal(tech)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#c20001] hover:text-[#a80001]"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        )}
                    </span>
                  </div>

                  {/* Compensation quick info */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2 text-[11px]">
                    {tech.employmentType === "Freelancer" ? (
                      <>
                        <span className="flex items-center gap-1 text-purple-700">
                          <Percent className="w-3 h-3" />
                          {tech.hasCompensationOverride &&
                          tech.commissionRateOverride != null
                            ? `${tech.commissionRateOverride}% (override)`
                            : `${GLOBAL_COMMISSION_RATE}% global`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1 text-blue-700">
                          <DollarSign className="w-3 h-3" />
                          {tech.hasCompensationOverride &&
                          tech.salaryOverride != null
                            ? `${tech.salaryOverride.toLocaleString()} AED`
                            : `${GLOBAL_BASE_SALARY.toLocaleString()} AED`}
                        </span>
                        <span className="flex items-center gap-1 text-blue-700">
                          <Percent className="w-3 h-3" />
                          {tech.hasCompensationOverride &&
                          tech.bonusRateOverride != null
                            ? `${tech.bonusRateOverride}%`
                            : `${GLOBAL_BONUS_RATE}%`}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Block reason */}
                {tech.status === "Blocked" && tech.blockedReason && (
                  <div className="mt-1 p-2 bg-red-100 border border-red-200 rounded text-[11px] text-red-800">
                    <p className="font-semibold">
                      Blocked on {tech.blockedDate || "-"}
                    </p>
                    <p className="mt-1">{tech.blockedReason}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => openEditModal(tech)}
                    className="flex-1 h-9 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  {tech.status === "Active" ? (
                    <button
                      type="button"
                      onClick={() => openBlockModal(tech, "block")}
                      className="flex-1 h-9 rounded-lg border border-red-500 text-xs font-medium text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      Block
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openBlockModal(tech, "unblock")}
                      className="flex-1 h-9 rounded-lg border border-green-600 text-xs font-medium text-green-700 hover:bg-green-600 hover:text-white"
                    >
                      Unblock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {blockTarget && (
        <BlockTechnicianModal
          technician={blockTarget}
          mode={blockMode}
          onClose={() => setBlockTarget(null)}
          onConfirm={handleConfirmBlockAction}
        />
      )}

      <AddEditTechnicianModal
        open={editOpen}
        technician={editTarget}
        onClose={() => {
          setEditOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSaveTechnician}
        globalCommissionRate={GLOBAL_COMMISSION_RATE}
        globalBaseSalary={GLOBAL_BASE_SALARY}
        globalBonusRate={GLOBAL_BONUS_RATE}
      />

      {workloadTarget && (
        <TechnicianWorkloadModal
          technician={workloadTarget}
          onClose={() => setWorkloadTarget(null)}
        />
      )}
    </div>
  );
}
