// src/pages/administrator/AdminCommissionRatesPage.jsx
import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  Percent,
  BriefcaseBusiness,
  Users,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

// ---------------------------------------------------------
// Small Tailwind UI helpers (no shadcn imports)
// ---------------------------------------------------------
const Card = ({ className = "", children }) => (
  <div
    className={
      "bg-white rounded-xl border border-gray-200 shadow-sm " + className
    }
  >
    {children}
  </div>
);

const CardHeader = ({ className = "", children }) => (
  <div className={"px-6 pt-5 pb-3 border-b border-gray-100 " + className}>
    {children}
  </div>
);

const CardContent = ({ className = "", children }) => (
  <div className={"px-6 pb-6 pt-4 " + className}>{children}</div>
);

const CardTitle = ({ className = "", children }) => (
  <h2 className={"text-base font-semibold text-gray-900 " + className}>
    {children}
  </h2>
);

const CardDescription = ({ className = "", children }) => (
  <p className={"text-xs text-gray-500 " + className}>{children}</p>
);

const Badge = ({ className = "", children }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
      className
    }
  >
    {children}
  </span>
);

const Button = ({
  children,
  variant = "solid",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors";
  const variants = {
    solid: "bg-[#c20001] text-white hover:bg-[#a00001]",
    outline:
      "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={
      "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#c20001] focus:ring-2 focus:ring-[#c20001]/40 outline-none " +
      className
    }
    {...props}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={
      "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#c20001] focus:ring-2 focus:ring-[#c20001]/40 outline-none resize-none " +
      className
    }
    {...props}
  />
);

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-medium text-gray-700 mb-1"
  >
    {children}
  </label>
);

// Simple modal component (instead of Dialog)
const Modal = ({ open, title, description, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200">
          <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-gray-500 mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-gray-100 text-gray-500"
            >
              ✕
            </button>
          </div>
          <div className="px-6 py-4 max-h-[65vh] overflow-y-auto space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------

/**
 * @typedef {"Commission" | "Bonus"} RateType
 * @typedef {"Freelancer" | "Internal Employee"} EmploymentType
 */

/**
 * @typedef {Object} Rate
 * @property {string} id
 * @property {RateType} type
 * @property {EmploymentType} employmentType
 * @property {number} rate
 * @property {string} description
 */

const AdminCommissionRatesPage = () => {
  /** @type {[Rate[], Function]} */
  const [rates, setRates] = useState([
    {
      id: "RATE001",
      type: "Commission",
      employmentType: "Freelancer",
      rate: 10,
      description: "Standard commission for freelance technicians",
    },
    {
      id: "RATE002",
      type: "Commission",
      employmentType: "Freelancer",
      rate: 12,
      description: "Premium commission for senior freelance technicians",
    },
    {
      id: "RATE003",
      type: "Bonus",
      employmentType: "Internal Employee",
      rate: 5,
      description: "Performance bonus for junior employees",
    },
    {
      id: "RATE004",
      type: "Bonus",
      employmentType: "Internal Employee",
      rate: 6,
      description: "Performance bonus for senior employees",
    },
  ]);

  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  /** @type {[Rate|null, Function]} */
  const [editingRate, setEditingRate] = useState(null);

  const [rateForm, setRateForm] = useState({
    type: /** @type {RateType} */ ("Commission"),
    employmentType: /** @type {EmploymentType} */ ("Freelancer"),
    rate: "",
    description: "",
  });

  // -----------------------------------------------------
  // Helpers
  // -----------------------------------------------------
  const commissionRates = useMemo(
    () => rates.filter((r) => r.type === "Commission"),
    [rates]
  );
  const bonusRates = useMemo(
    () => rates.filter((r) => r.type === "Bonus"),
    [rates]
  );

  const avgCommission =
    commissionRates.length > 0
      ? (
          commissionRates.reduce((sum, r) => sum + r.rate, 0) /
          commissionRates.length
        ).toFixed(1)
      : "0";

  const avgBonus =
    bonusRates.length > 0
      ? (
          bonusRates.reduce((sum, r) => sum + r.rate, 0) / bonusRates.length
        ).toFixed(1)
      : "0";

  // -----------------------------------------------------
  // Rate management
  // -----------------------------------------------------
  const handleAddRate = () => {
    setEditingRate(null);
    setRateForm({
      type: "Commission",
      employmentType: "Freelancer",
      rate: "",
      description: "",
    });
    setIsRateModalOpen(true);
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setRateForm({
      type: rate.type,
      employmentType: rate.employmentType,
      rate: String(rate.rate),
      description: rate.description,
    });
    setIsRateModalOpen(true);
  };

  const handleSaveRate = async () => {
    if (!rateForm.rate || !rateForm.description) {
      await Swal.fire({
        icon: "error",
        title: "Missing fields",
        text: "Please fill in rate and description.",
        confirmButtonColor: "#c20001",
      });
    } else {
      const rateVal = parseFloat(rateForm.rate);
      if (Number.isNaN(rateVal) || rateVal < 0 || rateVal > 100) {
        await Swal.fire({
          icon: "error",
          title: "Invalid rate",
          text: "Rate must be a number between 0 and 100.",
          confirmButtonColor: "#c20001",
        });
      } else {
        if (editingRate) {
          setRates((prev) =>
            prev.map((r) =>
              r.id === editingRate.id
                ? {
                    ...r,
                    type: rateForm.type,
                    employmentType: rateForm.employmentType,
                    rate: rateVal,
                    description: rateForm.description,
                  }
                : r
            )
          );
          await Swal.fire({
            icon: "success",
            title: "Rate updated",
            confirmButtonColor: "#c20001",
          });
        } else {
          const newRate = {
            id: `RATE${String(rates.length + 1).padStart(3, "0")}`,
            type: rateForm.type,
            employmentType: rateForm.employmentType,
            rate: rateVal,
            description: rateForm.description,
          };
          setRates((prev) => [...prev, newRate]);
          await Swal.fire({
            icon: "success",
            title: "Rate created",
            confirmButtonColor: "#c20001",
          });
        }
        setIsRateModalOpen(false);
      }
    }
  };

  const handleDeleteRate = async (id) => {
    const rate = rates.find((r) => r.id === id);
    if (!rate) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete rate?",
      text: `Are you sure you want to delete this ${rate.type.toLowerCase()} ${
        rate.rate
      }% for ${rate.employmentType}?`,
      showCancelButton: true,
      confirmButtonColor: "#c20001",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    setRates((prev) => prev.filter((r) => r.id !== id));
    await Swal.fire({
      icon: "success",
      title: "Rate deleted",
      confirmButtonColor: "#c20001",
    });
  };

  const handleTypeChange = (type) => {
    setRateForm((prev) => ({
      ...prev,
      type,
      employmentType:
        type === "Commission" ? "Freelancer" : "Internal Employee",
    }));
  };

  // -----------------------------------------------------
  // Render
  // -----------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Percent className="w-6 h-6 text-[#c20001]" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Commission &amp; Bonus Rates
          </h1>
        </div>
        <p className="text-sm text-gray-600">
          Configure payment rates for{" "}
          <span className="font-semibold">freelancers</span> and{" "}
          <span className="font-semibold">internal employees</span>.
        </p>
        <p className="mt-1 text-xs text-amber-800 bg-amber-50 border border-amber-100 inline-flex items-center px-2 py-1 rounded-lg">
          Only{" "}
          <span className="mx-1 font-semibold">Administrators</span> should
          change live commission structures.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Commission Rates</CardDescription>
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-3xl text-purple-600">
                {commissionRates.length}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Commission</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {avgCommission}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Bonus Rates</CardDescription>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-3xl text-blue-600">
                {bonusRates.length}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Bonus</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {avgBonus}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Commission Rates (Freelancers) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BriefcaseBusiness className="w-5 h-5 text-purple-600" />
              <CardTitle>Commission Rates (Freelancers)</CardTitle>
            </div>
            <CardDescription>
              Commission percentages applied to freelance technicians.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              handleAddRate();
              setRateForm((prev) => ({
                ...prev,
                type: "Commission",
                employmentType: "Freelancer",
              }));
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add commission rate
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commissionRates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BriefcaseBusiness className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No commission rates configured yet.</p>
                <p className="text-sm mt-1">
                  Click{" "}
                  <span className="font-semibold">Add commission rate</span> to
                  create your first rule.
                </p>
              </div>
            ) : (
              commissionRates.map((rate) => (
                <div
                  key={rate.id}
                  className="p-4 border rounded-lg border-purple-200 bg-purple-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <span className="text-2xl font-semibold text-purple-600">
                          {rate.rate}%
                        </span>
                        <Badge className="bg-purple-100 text-purple-800">
                          <BriefcaseBusiness className="w-3 h-3 mr-1" />
                          {rate.employmentType}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800">
                          {rate.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {rate.description}
                      </p>
                      <p className="text-xs text-gray-500">ID: {rate.id}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-300"
                        onClick={() => handleEditRate(rate)}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteRate(rate.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bonus Rates (Internal Employees) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-blue-600" />
              <CardTitle>Bonus Rates (Internal Employees)</CardTitle>
            </div>
            <CardDescription>
              Performance bonus percentages for internal employees.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              handleAddRate();
              setRateForm((prev) => ({
                ...prev,
                type: "Bonus",
                employmentType: "Internal Employee",
              }));
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add bonus rate
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bonusRates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No bonus rates configured yet.</p>
                <p className="text-sm mt-1">
                  Click{" "}
                  <span className="font-semibold">Add bonus rate</span> to
                  create your first rule.
                </p>
              </div>
            ) : (
              bonusRates.map((rate) => (
                <div
                  key={rate.id}
                  className="p-4 border rounded-lg border-blue-200 bg-blue-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <span className="text-2xl font-semibold text-blue-600">
                          {rate.rate}%
                        </span>
                        <Badge className="bg-blue-100 text-blue-800">
                          <Users className="w-3 h-3 mr-1" />
                          {rate.employmentType}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800">
                          {rate.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {rate.description}
                      </p>
                      <p className="text-xs text-gray-500">ID: {rate.id}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300"
                        onClick={() => handleEditRate(rate)}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteRate(rate.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rate Modal */}
      <Modal
        open={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        title={editingRate ? "Edit rate" : "Add rate"}
        description={
          editingRate
            ? "Update commission or bonus rate for your technicians."
            : "Create a new commission or bonus rate rule."
        }
      >
        <div className="space-y-4">
          {/* Type */}
          <div>
            <Label>Rate type *</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange("Commission")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                  rateForm.type === "Commission"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <BriefcaseBusiness className="w-4 h-4" />
                Commission (Freelancers)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("Bonus")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                  rateForm.type === "Bonus"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Users className="w-4 h-4" />
                Bonus (Employees)
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {rateForm.type === "Commission"
                ? "Commission is paid to freelance technicians based on job payment."
                : "Bonus is paid to internal employees based on job payment or KPIs."}
            </p>
          </div>

          {/* Employment type (read-only) */}
          <div>
            <Label>Employment type</Label>
            <Input
              value={rateForm.employmentType}
              disabled
              className="bg-gray-50 text-gray-700"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Automatically set based on rate type.
            </p>
          </div>

          {/* Rate */}
          <div>
            <Label htmlFor="rate">Rate (%) *</Label>
            <Input
              id="rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={rateForm.rate}
              onChange={(e) =>
                setRateForm((prev) => ({
                  ...prev,
                  rate: e.target.value,
                }))
              }
              placeholder="e.g. 10"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Enter percentage between 0 and 100.
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="desc">Description *</Label>
            <Textarea
              id="desc"
              rows={3}
              value={rateForm.description}
              onChange={(e) =>
                setRateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={
                rateForm.type === "Commission"
                  ? "e.g. Standard commission for freelance technicians."
                  : "e.g. Performance bonus for internal employees."
              }
            />
          </div>

          {/* Example box */}
          {rateForm.rate && !Number.isNaN(parseFloat(rateForm.rate)) && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">Example: </span>
                For a job payment of{" "}
                <span className="font-semibold">$1,000</span>, the{" "}
                {rateForm.type.toLowerCase()} would be{" "}
                <span
                  className={
                    rateForm.type === "Commission"
                      ? "text-purple-600 font-semibold"
                      : "text-blue-600 font-semibold"
                  }
                >
                  $
                  {(
                    (1000 * (parseFloat(rateForm.rate) || 0)) /
                    100
                  ).toFixed(2)}
                </span>
                .
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRate}
              className={
                rateForm.type === "Commission"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {editingRate ? "Update rate" : "Create rate"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCommissionRatesPage;
