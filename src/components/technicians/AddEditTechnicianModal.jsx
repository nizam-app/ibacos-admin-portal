import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Users,
  Percent,
  DollarSign,
  Info,
  X as XIcon,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AddEditTechnicianModal({
  open,
  technician,
  onClose,
  onSave,
  globalCommissionRate,
  globalBaseSalary,
  globalBonusRate,
}) {
  if (!open) return null;

  const isEdit = !!technician;

  const [form, setForm] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
    employmentType: "Freelancer",
    status: "Active",
    joinDate: new Date().toISOString().split("T")[0],
  });

  const [useOverride, setUseOverride] = useState(false);
  const [overrideCommission, setOverrideCommission] = useState("");
  const [overrideSalary, setOverrideSalary] = useState("");
  const [overrideBonus, setOverrideBonus] = useState("");

  useEffect(() => {
    if (technician) {
      setForm({
        name: technician.name,
        specialty: technician.specialty,
        phone: technician.phone,
        email: technician.email || "",
        employmentType: technician.employmentType,
        status: technician.status,
        joinDate: technician.joinDate,
      });

      if (technician.hasCompensationOverride) {
        setUseOverride(true);
        if (technician.employmentType === "Freelancer") {
          setOverrideCommission(
            technician.commissionRateOverride != null
              ? String(technician.commissionRateOverride)
              : ""
          );
        } else {
          setOverrideSalary(
            technician.salaryOverride != null
              ? String(technician.salaryOverride)
              : ""
          );
          setOverrideBonus(
            technician.bonusRateOverride != null
              ? String(technician.bonusRateOverride)
              : ""
          );
        }
      } else {
        setUseOverride(false);
        setOverrideCommission("");
        setOverrideSalary("");
        setOverrideBonus("");
      }
    } else {
      setForm({
        name: "",
        specialty: "",
        phone: "",
        email: "",
        employmentType: "Freelancer",
        status: "Active",
        joinDate: new Date().toISOString().split("T")[0],
      });
      setUseOverride(false);
      setOverrideCommission("");
      setOverrideSalary("");
      setOverrideBonus("");
    }
  }, [technician, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.name.trim() || !form.specialty.trim() || !form.phone.trim()) {
      Swal.fire(
        "Missing fields",
        "Name, specialty & phone are required.",
        "warning"
      );
      return false;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      Swal.fire("Invalid email", "Please enter a valid email.", "warning");
      return false;
    }

    if (useOverride) {
      if (form.employmentType === "Freelancer") {
        const rate = parseFloat(overrideCommission);
        if (!overrideCommission || isNaN(rate) || rate < 0 || rate > 100) {
          Swal.fire(
            "Invalid commission",
            "Commission rate must be between 0 and 100.",
            "warning"
          );
          return false;
        }
      } else {
        const salary = parseFloat(overrideSalary);
        const bonus = parseFloat(overrideBonus);
        if (!overrideSalary || isNaN(salary) || salary <= 0) {
          Swal.fire(
            "Invalid salary",
            "Salary must be a positive number.",
            "warning"
          );
          return false;
        }
        if (!overrideBonus || isNaN(bonus) || bonus < 0 || bonus > 100) {
          Swal.fire(
            "Invalid bonus",
            "Bonus rate must be between 0 and 100.",
            "warning"
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: form.name.trim(),
      specialty: form.specialty.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      employmentType: form.employmentType,
      status: form.status,
      joinDate: form.joinDate,
      hasCompensationOverride: useOverride,
    };

    if (form.employmentType === "Freelancer") {
      data.commissionRate = globalCommissionRate;
      data.salary = null;
      data.bonusRate = null;
      data.salaryOverride = null;
      data.bonusRateOverride = null;

      if (useOverride) {
        data.commissionRateOverride = parseFloat(overrideCommission);
      } else {
        data.commissionRateOverride = null;
      }
    } else {
      data.commissionRate = null;
      data.salary = globalBaseSalary;
      data.bonusRate = globalBonusRate;
      data.commissionRateOverride = null;

      if (useOverride) {
        data.salaryOverride = parseFloat(overrideSalary);
        data.bonusRateOverride = parseFloat(overrideBonus);
      } else {
        data.salaryOverride = null;
        data.bonusRateOverride = null;
      }
    }

    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-[#c20001]">
              {isEdit ? "Edit Technician" : "Add New Technician"}
            </h2>
            <p className="text-xs text-gray-500">
              Basic profile + compensation rule (global vs override).
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6 text-sm">
          {/* Basic info */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Basic Information
            </h3>
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
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="optional"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Join Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                  value={form.joinDate}
                  onChange={(e) => handleChange("joinDate", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Status</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employment type */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Employment Type
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <Info className="w-3 h-3" />
                <span>Changes impact new payments only</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange("employmentType", "Freelancer")}
                className={
                  "border rounded-lg p-3 flex items-center justify-between text-xs " +
                  (form.employmentType === "Freelancer"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-300 hover:bg-gray-50")
                }
              >
                <div className="flex items-center gap-2">
                  <div
                    className={
                      "p-2 rounded-lg " +
                      (form.employmentType === "Freelancer"
                        ? "bg-purple-600"
                        : "bg-gray-200")
                    }
                  >
                    <Briefcase
                      className={
                        "w-4 h-4 " +
                        (form.employmentType === "Freelancer"
                          ? "text-white"
                          : "text-gray-700")
                      }
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Freelancer</p>
                    <p className="text-[11px] text-gray-500">
                      Commission based
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-gray-500">
                  {globalCommissionRate}% global
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleChange("employmentType", "Internal Employee")
                }
                className={
                  "border rounded-lg p-3 flex items-center justify-between text-xs " +
                  (form.employmentType === "Internal Employee"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50")
                }
              >
                <div className="flex items-center gap-2">
                  <div
                    className={
                      "p-2 rounded-lg " +
                      (form.employmentType === "Internal Employee"
                        ? "bg-blue-600"
                        : "bg-gray-200")
                    }
                  >
                    <Users
                      className={
                        "w-4 h-4 " +
                        (form.employmentType === "Internal Employee"
                          ? "text-white"
                          : "text-gray-700")
                      }
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Employee</p>
                    <p className="text-[11px] text-gray-500">
                      Salary + bonus
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-gray-500">
                  {globalBaseSalary.toLocaleString()} / {globalBonusRate}%
                </span>
              </button>
            </div>
          </div>

          {/* Compensation override */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Compensation
              </h3>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#c20001] focus:ring-[#c20001]"
                  checked={useOverride}
                  onChange={(e) => setUseOverride(e.target.checked)}
                />
                <span>Use individual override (otherwise global)</span>
              </label>
            </div>

            {!useOverride && (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
                {form.employmentType === "Freelancer" ? (
                  <p>
                    <Percent className="inline w-3 h-3 mr-1 text-purple-600" />
                    Global commission:&nbsp;
                    <span className="font-semibold text-purple-700">
                      {globalCommissionRate}%
                    </span>
                  </p>
                ) : (
                  <>
                    <p>
                      <DollarSign className="inline w-3 h-3 mr-1 text-blue-600" />
                      Base salary:&nbsp;
                      <span className="font-semibold text-blue-700">
                        {globalBaseSalary.toLocaleString()} AED
                      </span>
                    </p>
                    <p>
                      <Percent className="inline w-3 h-3 mr-1 text-blue-600" />
                      Bonus:&nbsp;
                      <span className="font-semibold text-blue-700">
                        {globalBonusRate}%
                      </span>
                    </p>
                  </>
                )}
              </div>
            )}

            {useOverride && (
              <div className="space-y-3">
                {form.employmentType === "Freelancer" ? (
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Commission rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                      value={overrideCommission}
                      onChange={(e) =>
                        setOverrideCommission(e.target.value)
                      }
                      placeholder="e.g. 12.5"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Overrides global {globalCommissionRate}% for this
                      technician.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 mb-1">
                        Base salary (AED)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                        value={overrideSalary}
                        onChange={(e) =>
                          setOverrideSalary(e.target.value)
                        }
                        placeholder="e.g. 6000"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">
                        Bonus rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c20001]"
                        value={overrideBonus}
                        onChange={(e) => setOverrideBonus(e.target.value)}
                        placeholder="e.g. 7.5"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
