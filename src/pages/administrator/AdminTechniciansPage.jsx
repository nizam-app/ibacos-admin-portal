import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
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

import TechniciansAPI from "../../api/techniciansApi";

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
// API ⇨ UI mapping helpers
// -----------------------------
// এখানে backend response থেকে local technician object বানাচ্ছি.
// তোমার আসল response অনুযায়ী field নাম গুলো চাইলে adjust করবে।
function mapApiTechnician(api) {
  return {
    id: String(api.id), // অথবা api.employeeCode হলে সেটাও ব্যবহার করতে পারো
    name: api.fullName || api.name || "Unnamed technician",
    specialty: api.specialty || api.expertise || "General",

    phone: api.phone || api.phoneNumber || "",
    email: api.email || "",

    status: api.isBlocked ? "Blocked" : "Active",
    blockedReason: api.blockedReason || "",
    blockedDate: api.blockedAt ? api.blockedAt.slice(0, 10) : "",

    activeWorkOrders: api.activeWorkOrdersCount ?? 0,
    completedJobs: api.completedJobsCount ?? 0,

    employmentType:
      api.employmentType === "EMPLOYEE"
        ? "Internal Employee"
        : "Freelancer",

    commissionRate: api.commissionRate ?? null,
    salary: api.salary ?? null,
    bonusRate: api.bonusRate ?? null,
    hasCompensationOverride: api.hasCompensationOverride ?? false,
    commissionRateOverride: api.commissionRateOverride ?? null,
    salaryOverride: api.salaryOverride ?? null,
    bonusRateOverride: api.bonusRateOverride ?? null,

    joinDate: (api.joinDate || api.createdAt || "").slice(0, 10),

    openWorkOrders: api.openWorkOrders || [],
  };
}

// Add/Edit form থেকে payload বানানো
function buildUserPayloadFromForm(form) {
  return {
    fullName: form.name,
    phone: form.phone,
    email: form.email,
    specialty: form.specialty,
    employmentType:
      form.employmentType === "Internal Employee" ? "EMPLOYEE" : "FREELANCER",
    role: "TECH_FREELANCER",
  };
}

function buildProfilePayloadFromForm(form) {
  return {
    commissionRate: form.commissionRate ?? null,
    salary: form.salary ?? null,
    bonusRate: form.bonusRate ?? null,
    hasCompensationOverride: !!form.hasCompensationOverride,
    commissionRateOverride: form.commissionRateOverride ?? null,
    salaryOverride: form.salaryOverride ?? null,
    bonusRateOverride: form.bonusRateOverride ?? null,
  };
}

// -----------------------------
// Main Page – AdminTechniciansPage
// -----------------------------
export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingTech, setIsSavingTech] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedSpecs, setSelectedSpecs] = useState([]);

  // modal state
  const [blockTarget, setBlockTarget] = useState(null);
  const [blockMode, setBlockMode] = useState("block");

  const [editTarget, setEditTarget] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const [workloadTarget, setWorkloadTarget] = useState(null);

  // -----------------------------
  // Load list from API
  // -----------------------------
  const loadTechnicians = async () => {
    try {
      setIsLoading(true);
      const res = await TechniciansAPI.listTechnicians();
      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTechnicians(arr.map(mapApiTechnician));
    } catch (err) {
      console.error("Failed to load technicians", err);
      await Swal.fire({
        icon: "error",
        title: "Failed to load technicians",
        text: "Please check the API or your network and try again.",
        confirmButtonColor: "#c20001",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

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
  // Filters + export
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

  // -----------------------------
  // Block / Unblock from small modal
  // -----------------------------
  const openBlockModal = (technician, mode) => {
    setBlockTarget(technician);
    setBlockMode(mode);
  };

const handleConfirmBlockAction = async (reason) => {
  if (!blockTarget) return;

  try {
    if (blockMode === "block") {
      // API call
      await TechniciansAPI.blockTechnician(blockTarget.id, reason);
    } else {
      await TechniciansAPI.unblockTechnician(blockTarget.id);
    }

    // local state update
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

        return {
          ...t,
          status: "Active",
          blockedReason: "",
          blockedDate: "",
        };
      })
    );

    setBlockTarget(null);
  } catch (err) {
    console.error(err);
    await Swal.fire({
      icon: "error",
      title: "Action failed",
      text:
        err?.response?.data?.message ||
        "Could not update technician status.",
      confirmButtonColor: "#c20001",
    });
  }
};


  // -----------------------------
  // Add / Edit technician from big modal
  // -----------------------------
  const openEditModal = (technician = null) => {
    setEditTarget(technician);
    setEditOpen(true);
  };

// -----------------------------
// Actions
// -----------------------------

const handleSaveTechnician = async (formData) => {
  try {
    // UI status → API status
    const apiStatus =
      formData.status === "Active" ? "ACTIVE" : "INACTIVE";

    // role determine (এখন সব TECH_FREELANCER, চাইলে employee আলাদা role ব্যবহার করতে পারো)
    const role =
      formData.employmentType === "Freelancer"
        ? "TECH_FREELANCER"
        : "TECH_FREELANCER"; // TODO: চাইলে এখানে "TECH_EMPLOYEE" ইত্যাদি দিবে

    // --------------------------
    // 1) basic user payload
    // --------------------------
    const userPayload = {
      name: formData.name,
      phone: formData.phone,
      role,
    };

    if (formData.email) {
      userPayload.email = formData.email;
    }

    // --------------------------
    // 2) profile payload
    // (backend commissionRate, bonusRate = 0.xx format)
    // --------------------------
    const profilePayload = {
      status: apiStatus,
    };

    if (formData.employmentType === "Freelancer") {
      // freelancer → commissionRate use
      const commissionPercent = formData.hasCompensationOverride
        ? formData.commissionRateOverride ?? GLOBAL_COMMISSION_RATE
        : GLOBAL_COMMISSION_RATE;

      profilePayload.commissionRate = commissionPercent / 100;
      // optional: bonusRate null রাখছি, চাইলে backend যেভাবে handle করে
      profilePayload.bonusRate = null;
    } else {
      // employee → salary + bonus
      const salary = formData.hasCompensationOverride
        ? formData.salaryOverride ?? GLOBAL_BASE_SALARY
        : GLOBAL_BASE_SALARY;

      const bonusPercent = formData.hasCompensationOverride
        ? formData.bonusRateOverride ?? GLOBAL_BONUS_RATE
        : GLOBAL_BONUS_RATE;

      profilePayload.salary = salary;
      profilePayload.bonusRate = bonusPercent / 100;
      profilePayload.commissionRate = null;
    }

    // ==========================
    // EDIT EXISTING TECHNICIAN
    // ==========================
    if (editTarget) {
      // 1) update user
      await TechniciansAPI.updateTechnician(editTarget.id, userPayload);

      // 2) update profile
      await TechniciansAPI.updateTechnicianProfile(
        editTarget.id,
        profilePayload
      );

      // 3) local state update (UI)
      setTechnicians((prev) =>
        prev.map((t) =>
          t.id === editTarget.id
            ? {
                ...t,
                name: formData.name,
                specialty: formData.specialty,
                phone: formData.phone,
                email: formData.email,
                employmentType: formData.employmentType,
                status: formData.status,
                joinDate: formData.joinDate,
                hasCompensationOverride: formData.hasCompensationOverride,
                commissionRate: formData.employmentType === "Freelancer"
                  ? GLOBAL_COMMISSION_RATE
                  : null,
                salary:
                  formData.employmentType === "Internal Employee"
                    ? GLOBAL_BASE_SALARY
                    : null,
                bonusRate:
                  formData.employmentType === "Internal Employee"
                    ? GLOBAL_BONUS_RATE
                    : null,
                commissionRateOverride:
                  formData.employmentType === "Freelancer"
                    ? formData.hasCompensationOverride
                      ? formData.commissionRateOverride
                      : null
                    : null,
                salaryOverride:
                  formData.employmentType === "Internal Employee"
                    ? formData.hasCompensationOverride
                      ? formData.salaryOverride
                      : null
                    : null,
                bonusRateOverride:
                  formData.employmentType === "Internal Employee"
                    ? formData.hasCompensationOverride
                      ? formData.bonusRateOverride
                      : null
                    : null,
              }
            : t
        )
      );

      await Swal.fire({
        icon: "success",
        title: "Technician updated",
        confirmButtonColor: "#c20001",
      });
    } else {
      // ==========================
      // CREATE NEW TECHNICIAN
      // ==========================

      // 1) create user
      const { data: createdUser } = await TechniciansAPI.createTechnician(
        userPayload
      );

      // 2) create/update profile for this new user
      await TechniciansAPI.updateTechnicianProfile(
        createdUser.id,
        profilePayload
      );

      // 3) add to UI list
      const newTech = {
        id: createdUser.id,
        name: createdUser.name,
        specialty: formData.specialty,
        phone: createdUser.phone,
        email: createdUser.email || "",
        status: formData.status,
        blockedReason:
          formData.status === "Blocked" ? "Blocked by admin" : "",
        blockedDate:
          formData.status === "Blocked"
            ? new Date().toISOString().split("T")[0]
            : "",
        activeWorkOrders: 0,
        completedJobs: 0,
        employmentType: formData.employmentType,
        commissionRate:
          formData.employmentType === "Freelancer"
            ? GLOBAL_COMMISSION_RATE
            : null,
        salary:
          formData.employmentType === "Internal Employee"
            ? GLOBAL_BASE_SALARY
            : null,
        bonusRate:
          formData.employmentType === "Internal Employee"
            ? GLOBAL_BONUS_RATE
            : null,
        hasCompensationOverride: formData.hasCompensationOverride,
        commissionRateOverride:
          formData.employmentType === "Freelancer" &&
          formData.hasCompensationOverride
            ? formData.commissionRateOverride
            : null,
        salaryOverride:
          formData.employmentType === "Internal Employee" &&
          formData.hasCompensationOverride
            ? formData.salaryOverride
            : null,
        bonusRateOverride:
          formData.employmentType === "Internal Employee" &&
          formData.hasCompensationOverride
            ? formData.bonusRateOverride
            : null,
        joinDate: formData.joinDate,
        openWorkOrders: [],
      };

      setTechnicians((prev) => [...prev, newTech]);

      await Swal.fire({
        icon: "success",
        title: "Technician created",
        confirmButtonColor: "#c20001",
      });
    }

    // modal close
    setEditOpen(false);
    setEditTarget(null);
  } catch (err) {
    console.error(err);
    await Swal.fire({
      icon: "error",
      title: "Save failed",
      text:
        err?.response?.data?.message ||
        "Could not save technician. Please try again.",
      confirmButtonColor: "#c20001",
    });
  }
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
          {isLoading && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Loading technicians...
            </p>
          )}
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
                      Joined: {tech.joinDate || "-"}
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
                            : tech.commissionRate != null
                            ? `${tech.commissionRate}%`
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
                            : tech.salary != null
                            ? `${tech.salary.toLocaleString()} AED`
                            : `${GLOBAL_BASE_SALARY.toLocaleString()} AED`}
                        </span>
                        <span className="flex items-center gap-1 text-blue-700">
                          <Percent className="w-3 h-3" />
                          {tech.hasCompensationOverride &&
                          tech.bonusRateOverride != null
                            ? `${tech.bonusRateOverride}%`
                            : tech.bonusRate != null
                            ? `${tech.bonusRate}%`
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
                    className="flex-1 h-9 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    disabled={isSavingTech || isBlocking}
                  >
                    Edit
                  </button>

                  {tech.status === "Active" ? (
                    <button
                      type="button"
                      onClick={() => openBlockModal(tech, "block")}
                      className="flex-1 h-9 rounded-lg border border-red-500 text-xs font-medium text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={isBlocking}
                    >
                      Block
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openBlockModal(tech, "unblock")}
                      className="flex-1 h-9 rounded-lg border border-green-600 text-xs font-medium text-green-700 hover:bg-green-600 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={isBlocking}
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

      {/* Modals – existing components, kono change লাগে নাই */}
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
