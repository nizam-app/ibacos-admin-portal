// src/pages/dispatcher/DispatcherTechnicians.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  UserCheck,
  UserX,
  Briefcase,
  Users,
  Search,
  Phone,
  Mail,
  ClipboardList,
  BarChart3,
  Filter,
  Eye,
  Plus,
  X as XIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import TechniciansAPI from "../../api/techniciansApi";

// -----------------------------
// Helper small components
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

function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
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

// -----------------------------
// Block / Unblock Modal
// -----------------------------
function BlockTechnicianModal({ technician, mode, onClose, onConfirm }) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "block" && !reason.trim()) return;
    onConfirm(reason.trim());
  };

  if (!technician) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-[#c20001]">
              {mode === "block" ? "Block Technician" : "Unblock Technician"}
            </h2>
            <p className="text-xs text-gray-500">
              {mode === "block"
                ? "Technician will stop receiving new work orders."
                : "Technician will again be available for assignment."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{technician.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Technician ID</p>
              <p className="font-medium text-gray-900">
                {technician.code || technician.id}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Specialty</p>
              <p className="font-medium text-gray-900">
                {technician.specialty}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Active Work Orders</p>
              <p className="font-medium text-[#c20001]">
                {technician.activeWorkOrders}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {mode === "block" ? (
            <>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                Blocking will not cancel current open work orders but technician
                will not be assigned to any new job.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for blocking *
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Write short but clear reason..."
                  required
                />
              </div>
            </>
          ) : (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-800">
              Technician will be available again for dispatcher assignment.
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 h-10 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1 ${
                mode === "block"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {mode === "block" ? (
                <>
                  <UserX className="w-4 h-4" /> Confirm Block
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" /> Confirm Unblock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -----------------------------
// Add / Edit Modal (dispatcher version – basic info only)
// -----------------------------
function AddEditTechnicianModal({ open, technician, onClose, onSave }) {
  const isEdit = !!technician;
  const [form, setForm] = useState(
    technician || {
      name: "",
      specialty: "",
      phone: "",
      email: "",
      employmentType: "Freelancer",
    }
  );

  React.useEffect(() => {
    if (technician) {
      setForm({
        name: technician.name || "",
        specialty: technician.specialty || "",
        phone: technician.phone || "",
        email: technician.email || "",
        employmentType: technician.employmentType || "Freelancer",
      });
    } else {
      setForm({
        name: "",
        specialty: "",
        phone: "",
        email: "",
        employmentType: "Freelancer",
      });
    }
  }, [technician, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.specialty.trim() || !form.phone.trim()) {
      Swal.fire(
        "Missing fields",
        "Name, specialty and phone are required.",
        "warning"
      );
      return;
    }
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-[#c20001]">
              {isEdit ? "Edit Technician" : "Add Technician"}
            </h2>
            <p className="text-xs text-gray-500">
              Basic technician profile. Compensation is managed globally by
              Admin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Specialty <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                value={form.specialty}
                onChange={(e) => handleChange("specialty", e.target.value)}
              >
                <option value="">Select specialty</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC</option>
                <option value="General">General</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Painting">Painting</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+971 50 123 4567"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                value={form.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="optional"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Employment Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleChange("employmentType", "Freelancer")
                  }
                  className={
                    "flex-1 h-10 rounded-lg border text-xs font-medium flex items-center justify-center gap-1 " +
                    (form.employmentType === "Freelancer"
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-gray-300 text-gray-700")
                  }
                >
                  <Briefcase className="w-4 h-4" />
                  Freelancer
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleChange("employmentType", "Internal Employee")
                  }
                  className={
                    "flex-1 h-10 rounded-lg border text-xs font-medium flex items-center justify-center gap-1 " +
                    (form.employmentType === "Internal Employee"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700")
                  }
                >
                  <Users className="w-4 h-4" />
                  Employee
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Commission / salary values are configured globally from Admin
                side.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-[#c20001] text-sm font-medium text-white hover:bg-[#a80001]"
            >
              {isEdit ? "Update Technician" : "Add Technician"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -----------------------------
// Workload Modal
// -----------------------------
function TechnicianWorkloadModal({ technician, onClose }) {
  if (!technician) return null;

  const workOrders = technician.openWorkOrders || [];
  const workOrdersCount =
    technician.openWorkOrdersCount ??
    (technician.openWorkOrders?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-[#c20001]">
              Open Work Orders – {technician.name}
            </h2>
            <p className="text-xs text-gray-500">
              Currently assigned work orders ({workOrdersCount})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto px-6 py-4 space-y-3 text-sm">
          {workOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No open work orders list available from API.
            </div>
          ) : (
            workOrders.map((wo) => (
              <div
                key={wo.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-[#c20001]">
                      {wo.id}
                    </p>
                    {wo.customerName && (
                      <p className="text-xs text-gray-600">
                        {wo.customerName}
                      </p>
                    )}
                    {wo.category && (
                      <p className="text-[11px] text-gray-500">
                        {wo.category}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-gray-900 text-white">
                    {wo.status}
                  </Badge>
                </div>
                {(wo.scheduledDate || wo.scheduledTime) && (
                  <div className="flex gap-4 text-xs text-gray-600 mt-1">
                    {wo.scheduledDate && <span>{wo.scheduledDate}</span>}
                    {wo.scheduledTime && <span>{wo.scheduledTime}</span>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end px-6 py-3 border-t">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Main Page – DispatcherTechnicians
// -----------------------------
export default function DispatcherTechnicians() {
  const [technicians, setTechnicians] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | freelancer | employee

  const [blockTarget, setBlockTarget] = useState(null);
  const [blockMode, setBlockMode] = useState("block"); // block | unblock

  const [editTarget, setEditTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [workloadTarget, setWorkloadTarget] = useState(null);

  // -----------------------------
  // API loading helpers
  // -----------------------------
  const mapTechnicianFromApi = (u) => {
    const profile = u.technicianProfile || {};
    const specialization = profile.specialization || "";
    const mainSpecialty = specialization.split(",")[0] || specialization;

    return {
      id: u.id, // backend id
      code: `TECH-${String(u.id).padStart(3, "0")}`, // display id
      name: u.name,
      specialty: mainSpecialty.trim() || "General",
      phone: u.phone,
      email: u.email,
      status: u.isBlocked ? "Blocked" : "Active",
      blockedReason: u.blockedReason || "",
      blockedDate: u.blockedAt ? u.blockedAt.split("T")[0] : "",
      activeWorkOrders: u.activeWorkOrders ?? 0,
      completedJobs: u.completedJobs ?? 0,
      openWorkOrdersCount: u.openWorkOrders ?? 0,
      openWorkOrders: [], // details nai backend theke
      employmentType:
        profile.type === "FREELANCER"
          ? "Freelancer"
          : "Internal Employee",
      commissionRate: profile.commissionRate
        ? Math.round(profile.commissionRate * 100)
        : u.commissionRate
        ? Math.round(u.commissionRate * 100)
        : null,
      salary: profile.baseSalary ?? null,
      bonusRate: profile.bonusRate
        ? Math.round(profile.bonusRate * 100)
        : null,
      joinDate:
        profile.joinDate?.split("T")[0] ||
        (u.createdAt ? u.createdAt.split("T")[0] : ""),
    };
  };

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      const res = await TechniciansAPI.listTechnicians();

      // API theke jodi direct array ashe, oita handle korar jonno
      const raw = Array.isArray(res.data)
        ? res.data
        : res.data?.users || res.data || [];

      const mapped = raw.map(mapTechnicianFromApi);
      setTechnicians(mapped);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load technicians", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadOverview = async () => {
    try {
      const res = await TechniciansAPI.getStatusOverview();
      setOverview(res.data);
    } catch (err) {
      console.error(err);
      // optional: no popup, just console
    }
  };

  useEffect(() => {
    loadTechnicians();
    loadOverview();
  }, []);

  // Derived stats (from list)
  const stats = useMemo(() => {
    const active = technicians.filter((t) => t.status === "Active").length;
    const blocked = technicians.filter((t) => t.status === "Blocked").length;
    const freelancers = technicians.filter(
      (t) => t.employmentType === "Freelancer"
    ).length;
    const employees = technicians.filter(
      (t) => t.employmentType === "Internal Employee"
    ).length;
    return { active, blocked, freelancers, employees };
  }, [technicians]);

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        (t.name || "").toLowerCase().includes(q) ||
        (t.specialty || "").toLowerCase().includes(q) ||
        (t.code || String(t.id)).toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (typeFilter === "freelancer") {
        return t.employmentType === "Freelancer";
      }
      if (typeFilter === "employee") {
        return t.employmentType === "Internal Employee";
      }
      return true;
    });
  }, [technicians, searchTerm, typeFilter]);

  // Actions
  const openAddModal = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEditModal = (tech) => {
    setEditTarget(tech);
    setModalOpen(true);
  };

  const handleSaveTechnician = async (data) => {
    try {
      if (editTarget) {
        // Update basic info
        await TechniciansAPI.updateTechnician(editTarget.id, {
          name: data.name,
          phone: data.phone,
          email: data.email,
        });
        Swal.fire("Updated", "Technician updated successfully.", "success");
      } else {
        // Create technician – dispatcher version, simple defaults
        await TechniciansAPI.createTechnician({
          phone: data.phone,
          password: "tech123", // TODO: backend e real password / invite flow handle korbe
          name: data.name,
          role: "TECH_FREELANCER",
          technicianProfile: {
            type:
              data.employmentType === "Freelancer"
                ? "FREELANCER"
                : "EMPLOYEE",
            commissionRate: 0.2,
            bonusRate: 0.05,
          },
        });
        Swal.fire("Technician added", "New technician created.", "success");
      }

      setModalOpen(false);
      setEditTarget(null);
      await loadTechnicians();
      await loadOverview();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save technician", "error");
    }
  };

  const handleBlockStart = (tech) => {
    setBlockTarget(tech);
    setBlockMode("block");
  };

  const handleUnblockStart = (tech) => {
    setBlockTarget(tech);
    setBlockMode("unblock");
  };

  const handleConfirmBlock = async (reason) => {
    if (!blockTarget) return;
    try {
      if (blockMode === "block") {
        await TechniciansAPI.blockTechnician(blockTarget.id, reason);
        Swal.fire(
          "Technician blocked",
          "Technician will no longer receive new work orders.",
          "success"
        );
      } else {
        await TechniciansAPI.unblockTechnician(blockTarget.id);
        Swal.fire(
          "Technician unblocked",
          "Technician is available again for assignment.",
          "success"
        );
      }
      setBlockTarget(null);
      await loadTechnicians();
      await loadOverview();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update technician status", "error");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "Active") {
      return (
        <Badge className="bg-green-100 text-green-800 border border-green-200">
          <UserCheck className="w-3 h-3 mr-1" /> Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800 border border-red-200">
        <UserX className="w-3 h-3 mr-1" /> Blocked
      </Badge>
    );
  };

  const getEmploymentBadge = (type) => {
    if (type === "Freelancer") {
      return (
        <Badge className="bg-purple-100 text-purple-800 border border-purple-200">
          <Briefcase className="w-3 h-3 mr-1" /> Freelancer
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
        <Users className="w-3 h-3 mr-1" /> Employee
      </Badge>
    );
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
            Dispatcher view – manage technicians, block/unblock and check
            workload.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#c20001] text-white text-sm font-medium hover:bg-[#a80001]"
        >
          <Plus className="w-4 h-4" />
          Add Technician
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Technicians"
          value={overview?.activeTechnicians ?? stats.active}
          icon={UserCheck}
          colorClass="bg-green-500"
        />
        <StatCard
          title="Blocked Technicians"
          value={overview?.blockedTechnicians ?? stats.blocked}
          icon={UserX}
          colorClass="bg-red-500"
        />
        <StatCard
          title="Freelancers"
          value={stats.freelancers}
          icon={Briefcase}
          colorClass="bg-purple-500"
        />
        <StatCard
          title="Employees"
          value={stats.employees}
          icon={Users}
          colorClass="bg-blue-500"
        />
      </div>

      {/* Filter + Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 mr-2">Employment Type:</span>
          <button
            className={
              "h-8 px-3 rounded-full text-xs font-medium border " +
              (typeFilter === "all"
                ? "bg-[#c20001] text-white border-[#c20001]"
                : "border-gray-300 text-gray-700 hover:bg-gray-50")
            }
            onClick={() => setTypeFilter("all")}
          >
            All ({technicians.length})
          </button>
          <button
            className={
              "h-8 px-3 rounded-full text-xs font-medium border " +
              (typeFilter === "freelancer"
                ? "bg-purple-600 text-white border-purple-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-50")
            }
            onClick={() => setTypeFilter("freelancer")}
          >
            Freelancers ({stats.freelancers})
          </button>
          <button
            className={
              "h-8 px-3 rounded-full text-xs font-medium border " +
              (typeFilter === "employee"
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-50")
            }
            onClick={() => setTypeFilter("employee")}
          >
            Employees ({stats.employees})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, specialty, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001]"
          />
        </div>
      </div>

      {/* Technicians list */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-gray-500" />
            <p className="text-sm text-gray-700">
              {filteredTechnicians.length} technician
              {filteredTechnicians.length !== 1 && "s"} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            Loading technicians...
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No technicians match your search/filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTechnicians.map((t) => (
              <div
                key={t.id}
                className={
                  "rounded-xl border p-4 space-y-3 " +
                  (t.status === "Blocked"
                    ? "border-red-200 bg-red-50/60"
                    : "border-gray-200 bg-white")
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#c20001]">
                        {t.name}
                      </p>
                      {getStatusBadge(t.status)}
                      {getEmploymentBadge(t.employmentType)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.code || t.id}
                    </p>
                  </div>
                  <Badge className="bg-amber-50 text-amber-800 border border-amber-200">
                    {t.specialty}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone
                    </span>
                    <span className="font-medium text-gray-800">
                      {t.phone}
                    </span>
                  </div>
                  {t.email && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </span>
                      <span className="font-medium text-gray-800 truncate max-w-[180px] text-right">
                        {t.email}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Active work orders</span>
                    <span className="font-semibold text-[#c20001]">
                      {t.activeWorkOrders}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed jobs</span>
                    <span className="font-semibold text-green-600">
                      {t.completedJobs}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Open work orders</span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {t.openWorkOrdersCount ??
                          (t.openWorkOrders?.length || 0)}
                      </span>
                      {t.openWorkOrders &&
                        t.openWorkOrders.length > 0 && (
                          <button
                            className="text-xs text-[#c20001] hover:underline flex items-center gap-1"
                            onClick={() => setWorkloadTarget(t)}
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        )}
                    </span>
                  </div>
                </div>

                {t.employmentType === "Freelancer" && t.commissionRate && (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-purple-50 border border-purple-100 px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 text-purple-800">
                      <BarChart3 className="w-4 h-4" />
                      <span>Commission</span>
                    </div>
                    <span className="font-semibold">
                      {t.commissionRate}% (global)
                    </span>
                  </div>
                )}

                {t.employmentType === "Internal Employee" && (
                  <div className="mt-2 flex flex-col gap-1 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-blue-800">
                        <BarChart3 className="w-4 h-4" />
                        Salary
                      </span>
                      {t.salary && (
                        <span className="font-semibold">
                          {t.salary.toLocaleString()} AED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800">Bonus</span>
                      {t.bonusRate && (
                        <span className="font-semibold">
                          {t.bonusRate}% (global)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {t.status === "Blocked" && t.blockedReason && (
                  <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-800">
                    <p className="font-semibold">
                      Blocked on {t.blockedDate || "-"}
                    </p>
                    <p className="mt-1">{t.blockedReason}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => openEditModal(t)}
                    className="flex-1 h-9 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    Edit
                  </button>
                  {t.status === "Active" ? (
                    <button
                      onClick={() => handleBlockStart(t)}
                      className="flex-1 h-9 rounded-lg border border-red-500 text-xs font-medium text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center gap-1"
                    >
                      <UserX className="w-4 h-4" />
                      Block
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnblockStart(t)}
                      className="flex-1 h-9 rounded-lg bg-green-600 text-xs font-medium text-white hover:bg-green-700 flex items-center justify-center gap-1"
                    >
                      <UserCheck className="w-4 h-4" />
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
          onConfirm={handleConfirmBlock}
        />
      )}

      <AddEditTechnicianModal
        open={modalOpen}
        technician={editTarget}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSaveTechnician}
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
