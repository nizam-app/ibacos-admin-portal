// src/pages/dispatcher/DispatcherTechnicians.jsx

import React, { useMemo, useState, useEffect } from "react";
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
import TechnicianAPI from "../../api/TechnicianAPI";

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

// map backend technician → UI technician
const mapApiTechToUi = (t) => {
  const status =
    t.isBlocked === true
      ? "Blocked"
      : t.status === "INACTIVE"
        ? "Inactive"
        : "Active";

  const employmentType =
    t.type === "INTERNAL" || t.employmentType === "Employee"
      ? "Internal Employee"
      : "Freelancer";

  // commission / bonus can be string "10%" or number 0.1 etc.
  const normalizePercent = (val) => {
    if (val === null || val === undefined) return null;
    const str = String(val);
    if (str.endsWith("%")) {
      const num = parseFloat(str.replace("%", ""));
      return isNaN(num) ? null : num;
    }
    const num = parseFloat(str);
    return isNaN(num) ? null : num * 100; // if backend sends decimal (0.1) convert → 10
  };

  // Support both flat and nested technicianProfile (from directory vs details)
  const profile = t.technicianProfile ?? t;
  const commissionRate = normalizePercent(profile.commissionRate ?? t.commissionRate);
  const salary = profile.baseSalary ?? t.monthlySalary ?? t.baseSalary ?? null;
  const bonusRate = normalizePercent(profile.bonusRate ?? t.bonusRate);
  const useCustomRate = profile.useCustomRate === true || t.useCustomRate === true;

  return {
    // backend id
    id: t.id, // numeric DB id (for API calls / React key)
    techId: t.techId, // "TECH-061" (for display)

    name: t.name,
    specialty: profile.specialization ?? t.specialization ?? "General",
    phone: t.phone,
    email: t.email,
    status,
    employmentType,

    activeWorkOrders: t.activeWorkOrders || 0,
    completedJobs: t.completedJobs || 0,
    openWorkOrders: t.openWorkOrders ?? 0,

    commissionRate,
    salary: salary != null ? Number(salary) : null,
    bonusRate,

    joinDate: (profile.joinDate ?? t.joinDate)?.slice(0, 10) ?? "",
    blockedReason: t.blockedReason || null,
    blockedDate: t.blockedAt ? t.blockedAt.slice(0, 10) : null,

    homeAddress: profile.homeAddress ?? t.homeAddress ?? "",
    academicTitle: profile.academicTitle ?? t.academicTitle ?? "",

    photoUrl: profile.photoUrl ?? t.photoUrl ?? null,
    idCardUrl: profile.idCardUrl ?? t.idCardUrl ?? null,
    degreesUrl: profile.degreesUrl ?? t.degreesUrl ?? null,

    // Custom compensation: expose so modal can show customized vs global
    hasCompensationOverride: useCustomRate,
    commissionRateOverride: useCustomRate && employmentType === "Freelancer" ? commissionRate : undefined,
    salaryOverride: useCustomRate && employmentType === "Internal Employee" ? (salary != null ? Number(salary) : undefined) : undefined,
    bonusRateOverride: useCustomRate && employmentType === "Internal Employee" ? bonusRate : undefined,
  };
};

const DispatcherTechnicians = () => {

  const [defaultFreelancerRate, setDefaultFreelancerRate] = useState(null);
const [defaultInternalBonusRate, setDefaultInternalBonusRate] = useState(null);


  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all | Freelancer | Internal Employee
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [modalAction, setModalAction] = useState(null); // "block" | "unblock"
  const [userRole] = useState(getUserRoleFromStorage);

  // ---------- load technicians from API ----------
  const loadTechnicians = async () => {
    try {
      setLoading(true);

      // NOTE: now we are keeping filters client-side,
      // so we call directory with broad params.
      const res = await TechnicianAPI.getDirectory({
        search: "",
        specialization: "All",
        type: "All",
        // status: "All"  // optional – backend may treat missing as all
      });

      const apiTechs = res.data?.technicians || [];
      setTechnicians(apiTechs.map(mapApiTechToUi));
    } catch (err) {
      console.error("Failed to load technicians", err);
      Swal.fire(
        "Error",
        "Failed to load technicians. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };
  const loadDefaultRates = async () => {
  try {
    const [freelancerRes, internalRes] = await Promise.all([
      TechnicianAPI.getDefaultRate("FREELANCER"),
      TechnicianAPI.getDefaultRate("INTERNAL"),
    ]);

    setDefaultFreelancerRate(
      freelancerRes.data?.ratePercentage ?? null // e.g. 14
    );
    setDefaultInternalBonusRate(
      internalRes.data?.ratePercentage ?? null // e.g. 5
    );
  } catch (err) {
    console.error("Failed to load default rates", err);
    // eta optional: alert deoya lagbe na, silent thakleo chole
  }
};


  useEffect(() => {
    loadTechnicians();
    loadDefaultRates();
  }, []);

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

  // KPI base list (no search, but respects current filters)
  const techniciansForKPI = applyTypeAndSpecFilters(technicians);
  const totalTechniciansFiltered = techniciansForKPI.length;

  // ✅ Global counts: always from FULL list, no filters
  const totalTechniciansAll = technicians.length;
  const freelancersCount = technicians.filter(
    (t) => t.employmentType === "Freelancer"
  ).length;
  const employeesCount = technicians.filter(
    (t) => t.employmentType === "Internal Employee"
  ).length;

  // Directory list (search + filters)
  const filteredTechnicians = applyTypeAndSpecFilters(technicians).filter(
    (tech) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        tech.name.toLowerCase().includes(q) ||
        tech.specialty.toLowerCase().includes(q) ||
        (tech.techId || String(tech.id)).toLowerCase().includes(q)
      );
    }
  );

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
      totalTechniciansFiltered > 0
        ? Math.round((value / totalTechniciansFiltered) * 100)
        : 0;
    return { name, value, percentage };
  });

  const toggleSpecialization = (spec) => {
    setSelectedSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const clearSpecializationFilters = () => {
    setSelectedSpecializations([]);
  };

  // ---------- actions ----------

  const [exportingCsv, setExportingCsv] = useState(false);

  const escapeCsvValue = (val) => {
    if (val == null || val === "") return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExportCSV = async () => {
    try {
      setExportingCsv(true);

      const apiType =
        filterType === "all"
          ? "All"
          : filterType === "Freelancer"
            ? "FREELANCER"
            : "INTERNAL";

      const specParam =
        selectedSpecializations.length === 1
          ? selectedSpecializations[0]
          : "All";

      const dirRes = await TechnicianAPI.getDirectory({
        search: "",
        specialization: specParam,
        type: apiType,
      });

      const apiTechs = dirRes.data?.technicians || [];

      const detailsPromises = apiTechs.map((t) =>
        TechnicianAPI.getDetails(t.id).catch(() => ({ data: t }))
      );
      const detailsResults = await Promise.all(detailsPromises);

      const extractDocUrl = (obj, key) => {
        if (!obj || typeof obj !== "object") return "";
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
        const fromObj = (o) => o?.[key] ?? o?.[snakeKey] ?? o?.technicianProfile?.[key] ?? o?.technicianProfile?.[snakeKey];
        return fromObj(obj) ?? "";
      };

      const techsWithDocs = detailsResults.map((res, idx) => {
        const apiTech = apiTechs[idx];
        const raw = res.data?.technician ?? res.data?.data ?? res.data ?? apiTech;
        const profile = raw?.technicianProfile ?? raw ?? {};
        const src = typeof profile === "object" ? profile : {};
        const t = typeof raw === "object" ? raw : {};

        let photoUrl = extractDocUrl(src, "photoUrl") || extractDocUrl(t, "photoUrl") || extractDocUrl(apiTech, "photoUrl");
        let idCardUrl = extractDocUrl(src, "idCardUrl") || extractDocUrl(t, "idCardUrl") || extractDocUrl(apiTech, "idCardUrl");
        let degreesUrl = extractDocUrl(src, "degreesUrl") || extractDocUrl(t, "degreesUrl") || extractDocUrl(apiTech, "degreesUrl");

        if (Array.isArray(degreesUrl)) {
          degreesUrl = degreesUrl.join("; ");
        } else if (typeof degreesUrl === "string" && degreesUrl.startsWith("[")) {
          try {
            const parsed = JSON.parse(degreesUrl);
            degreesUrl = Array.isArray(parsed) ? parsed.join("; ") : degreesUrl;
          } catch {
            degreesUrl = String(degreesUrl ?? "");
          }
        } else if (degreesUrl && typeof degreesUrl !== "string") {
          degreesUrl = String(degreesUrl);
        }

        return {
          techId: apiTech?.techId ?? t?.techId ?? "",
          name: apiTech?.name ?? t?.name ?? "",
          phone: apiTech?.phone ?? t?.phone ?? "",
          email: apiTech?.email ?? t?.email ?? "",
          specialization: apiTech?.specialization ?? t?.specialization ?? src?.specialization ?? "",
          type: apiTech?.type ?? t?.type ?? "",
          status: apiTech?.status ?? t?.status ?? "",
          photoUrl: photoUrl || "",
          idCardUrl: idCardUrl || "",
          degreesUrl: degreesUrl || "",
        };
      });

      const headers = [
        "Tech ID",
        "Name",
        "Phone",
        "Email",
        "Specialization",
        "Type",
        "Status",
        "Photo URL",
        "ID Card URL",
        "Degrees URL",
      ];

      const rows = techsWithDocs.map((t) => [
        escapeCsvValue(t.techId),
        escapeCsvValue(t.name),
        escapeCsvValue(t.phone),
        escapeCsvValue(t.email),
        escapeCsvValue(t.specialization),
        escapeCsvValue(t.type),
        escapeCsvValue(t.status),
        escapeCsvValue(t.photoUrl),
        escapeCsvValue(t.idCardUrl),
        escapeCsvValue(t.degreesUrl),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((r) => r.join(",")),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `technicians_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "CSV exported",
        text: "Technician list has been downloaded.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Export CSV failed", err);
      Swal.fire("Error", "Failed to export CSV. Please try again.", "error");
    } finally {
      setExportingCsv(false);
    }
  };

  const handleAddNew = () => {
    setEditingTechnician(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditClick = (tech) => {
    setEditingTechnician(tech);
    setIsAddEditModalOpen(true);
  };

  // build API payload from modal form values
  const buildPayloadFromForm = (data) => {
    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      joinDate: data.joinDate,
      specialization: data.specialty,
      type:
        data.employmentType === "Internal Employee"
          ? "INTERNAL"
          : "FREELANCER",
      homeAddress: data.homeAddress || null,
      academicTitle: data.academicTitle || null,
    };
    if (data.password) {
      payload.password = data.password;
    }

    if (data.employmentType === "Freelancer") {
      const rateSrc =
        data.commissionRateOverride != null &&
          data.commissionRateOverride !== ""
          ? data.commissionRateOverride
          : data.commissionRate;
      const rateNumber = rateSrc ? Number(rateSrc) : null;
      if (rateNumber !== null && !Number.isNaN(rateNumber)) {
        payload.commissionRate = rateNumber / 100; // convert 10 → 0.10
      }
    } else {
      const salarySrc =
        data.salaryOverride != null && data.salaryOverride !== ""
          ? data.salaryOverride
          : data.salary;
      const bonusSrc =
        data.bonusRateOverride != null && data.bonusRateOverride !== ""
          ? data.bonusRateOverride
          : data.bonusRate;

      const salaryNumber = salarySrc ? Number(salarySrc) : null;
      const bonusNumber = bonusSrc ? Number(bonusSrc) : null;

      if (salaryNumber !== null && !Number.isNaN(salaryNumber)) {
        payload.baseSalary = salaryNumber;
      }
      if (bonusNumber !== null && !Number.isNaN(bonusNumber)) {
        payload.bonusRate = bonusNumber / 100; // 5 → 0.05
      }
    }

    return payload;
  };

  const handleSaveTechnician = async (formValues) => {
    try {
      if (editingTechnician) {
        // Update existing technician
        const payload = buildPayloadFromForm(formValues);

        // When documents are uploaded, use single PATCH with FormData (matches API: form-data to /technicians/:id)
        if (formValues.documentsFormData && formValues.documentsFormData instanceof FormData) {
          const formData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            if (value != null && value !== "") {
              formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
            }
          });
          // Only append API-supported file fields: photo, idCardUrl, degreesUrl (avoids "Unexpected field")
          const allowedFileKeys = ["photo", "idCardUrl", "degreesUrl"];
          for (const [key, value] of formValues.documentsFormData.entries()) {
            if (value instanceof File && allowedFileKeys.includes(key)) {
              formData.append(key, value);
            } else if (typeof value === "string" && (key === "residencePermitFrom" || key === "residencePermitTo")) {
              formData.append(key, value);
            }
          }
          await TechnicianAPI.updateTechnician(editingTechnician.id, formData);
        } else {
          await TechnicianAPI.updateTechnician(editingTechnician.id, payload);
        }

        Swal.fire({
          icon: "success",
          title: "Technician updated",
          timer: 1400,
          showConfirmButton: false,
        });
      } else {
        // Create new technician
        const payload = buildPayloadFromForm(formValues);

        // If documents (photo, idCard, certificates) are uploaded, send as FormData
        if (formValues.documentsFormData && formValues.documentsFormData instanceof FormData) {
          const formData = new FormData();
          // Append all payload fields
          Object.entries(payload).forEach(([key, value]) => {
            if (value != null && value !== "") {
              formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
            }
          });
          // Append files from documentsFormData (photo, idCardUrl, degreesUrl, residencePermitUrl)
          for (const [key, value] of formValues.documentsFormData.entries()) {
            if (value instanceof File) {
              formData.append(key, value);
            } else if (typeof value === "string" && (key === "residencePermitFrom" || key === "residencePermitTo")) {
              formData.append(key, value);
            }
          }
          await TechnicianAPI.createTechnician(formData);
        } else {
          await TechnicianAPI.createTechnician(payload);
        }

        Swal.fire({
          icon: "success",
          title: "Technician added",
          timer: 1400,
          showConfirmButton: false,
        });
      }

      await loadTechnicians();
      setIsAddEditModalOpen(false);
      setEditingTechnician(null);
    } catch (err) {
      console.error("Save technician failed", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to save technician. Please try again.";
      Swal.fire("Error", msg, "error");
    }
  };

  const handleBlockClick = (tech) => {
    setSelectedTechnician(tech);
    setModalAction("block");
  };

  const handleUnblockClick = (tech) => {
    setSelectedTechnician(tech);
    setModalAction("unblock");
  };

  const handleConfirmBlockUnblock = async (technicianId, reason) => {
    try {
      const isBlocking = modalAction === "block";
      await TechnicianAPI.blockTechnician(technicianId, {
        isBlocked: isBlocking,
        reason: isBlocking ? reason : null,
      });

      await loadTechnicians();

      if (isBlocking) {
        Swal.fire({
          icon: "success",
          title: "Technician blocked",
          text: "Technician can no longer receive new work orders.",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Technician unblocked",
        });
      }
    } catch (err) {
      console.error("Block/unblock failed", err);
      Swal.fire(
        "Error",
        "Failed to change technician status. Please try again.",
        "error"
      );
    } finally {
      setSelectedTechnician(null);
      setModalAction(null);
    }
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
    if (status === "Blocked") {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs">
          <Ban className="w-3 h-3 mr-1" />
          Blocked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
        {status}
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
                  className={`px-3 py-1.5 rounded-full text-sm border ${selectedSpecializations.length === 0
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
                      className={`px-3 py-1.5 rounded-full text-sm border flex items-center gap-1 ${active
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
                  disabled={exportingCsv}
                  className="inline-flex items-center px-3 py-2 border border-[#c20001] text-[#c20001] rounded-lg text-sm hover:bg-[#c20001] hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportingCsv ? "Exporting..." : "Export CSV"}
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
                    {totalTechniciansFiltered}
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

                {totalTechniciansFiltered > 0 ? (
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

                {totalTechniciansFiltered > 0 && (
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
                className={`px-3 py-1.5 rounded-full text-sm border ${filterType === "all"
                  ? "bg-[#c20001] text-white border-[#c20001]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
              >
                All ({totalTechniciansAll})
              </button>

              <button
                type="button"
                onClick={() => setFilterType("Freelancer")}
                className={`px-3 py-1.5 rounded-full text-sm border inline-flex items-center gap-1 ${filterType === "Freelancer"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
              >
                <BriefcaseBusiness className="w-3 h-3" />
                Freelancers ({freelancersCount})
              </button>

              <button
                type="button"
                onClick={() => setFilterType("Internal Employee")}
                className={`px-3 py-1.5 rounded-full text-sm border inline-flex items-center gap-1 ${filterType === "Internal Employee"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
              >
                <UsersIcon className="w-3 h-3" />
                Employees ({employeesCount})
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
                className={`px-3 py-1.5 rounded-full text-sm border ${filterType === "all"
                  ? "bg-[#c20001] text-white border-[#c20001]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
              >
                All ({totalTechniciansAll})
              </button>

              <button
                type="button"
                onClick={() => setFilterType("Freelancer")}
                className={`px-3 py-1.5 rounded-full text-sm border inline-flex items-center gap-1 ${filterType === "Freelancer"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
              >
                <BriefcaseBusiness className="w-3 h-3" />
                Freelancers ({freelancersCount})
              </button>

              <button
                type="button"
                onClick={() => setFilterType("Internal Employee")}
                className={`px-3 py-1.5 rounded-full text-sm border inline-flex items-center gap-1 ${filterType === "Internal Employee"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
              >
                <UsersIcon className="w-3 h-3" />
                Employees ({employeesCount})
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

          {loading ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              Loading technicians...
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No technicians found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTechnicians.map((tech) => (
                <div
                  key={tech.id}
                  className={`border rounded-xl p-4 ${tech.status === "Blocked"
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
                      <p className="text-xs text-gray-500">
                        {tech.techId || tech.id}
                      </p>
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
                      <span>{tech.email || "—"}</span>
                    </div>

                    {tech.employmentType === "Freelancer" &&
                      tech.commissionRate != null && (
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
                        {tech.bonusRate != null && (
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
                        {Array.isArray(tech.openWorkOrders)
                          ? tech.openWorkOrders.length
                          : tech.openWorkOrders ?? 0}
                      </span>
                    </div>
                  </div>

                  {tech.status === "Blocked" && tech.blockedReason && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded">
                      <p className="text-xs text-red-900">
                        Blocked on {tech.blockedDate || "—"}
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
          defaultFreelancerRate={defaultFreelancerRate}
          defaultInternalBonusRate={defaultInternalBonusRate}
        />
      )}
    </div>
  );
};

export default DispatcherTechnicians;
