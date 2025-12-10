// src/components/technicians/AddEditTechnicianModal.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Briefcase,
  Users,
  DollarSign,
  Percent,
  Lock,
  Info,
  ChevronDown,
  ChevronUp,
  Upload,
  X as XIcon,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

// Basic small UI helpers (Tailwind based)
const ModalShell = ({ open, onClose, children, maxWidth = "max-w-2xl" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-end p-3 border-b border-gray-100">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        </div>
        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
};

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

const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001] ${
      props.className || ""
    }`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001] ${
      props.className || ""
    }`}
  />
);

const Label = ({ children, ...props }) => (
  <label
    {...props}
    className={`block text-xs font-medium text-gray-700 ${
      props.className || ""
    }`}
  >
    {children}
  </label>
);

const Switch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
      checked ? "bg-[#c20001]" : "bg-gray-300"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-4" : "translate-x-1"
      }`}
    />
  </button>
);

const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

const Collapsible = ({ open, onToggle, header, children }) => (
  <div>
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {header}
      {open ? (
        <ChevronUp className="w-5 h-5 text-gray-600" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-600" />
      )}
    </button>
    {open && <div className="pt-4 space-y-6">{children}</div>}
  </div>
);

// ---------------------- MAIN MODAL --------------------------

/**
 * props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSave: (data) => void
 * - technician?: existing tech object
 * - userRole?: 'admin' | 'dispatcher'
 */
const AddEditTechnicianModal = ({
  isOpen,
  onClose,
  onSave,
  technician,
  userRole = "dispatcher",
}) => {
  // Global rates (could also come from parent)
  const GLOBAL_COMMISSION_RATE = 10; // %
  const GLOBAL_BASE_SALARY = 5000; // $
  const GLOBAL_BONUS_RATE = 5; // %

  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
    employmentType: "Freelancer",
    status: "Active",
    joinDate: new Date().toISOString().split("T")[0],
  });

  const [initialData, setInitialData] = useState(formData);
  const [hasChanges, setHasChanges] = useState(false);

  // compensation override
  const [useCompensationOverride, setUseCompensationOverride] = useState(false);
  const [overrideCommissionRate, setOverrideCommissionRate] = useState("");
  const [overrideSalary, setOverrideSalary] = useState("");
  const [overrideBonusRate, setOverrideBonusRate] = useState("");
  const [compensationErrors, setCompensationErrors] = useState({});

  // additional info
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [personalPhoto, setPersonalPhoto] = useState(null);
  const [personalPhotoPreview, setPersonalPhotoPreview] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [isForeigner, setIsForeigner] = useState(false);
  const [residencePermit, setResidencePermit] = useState(null);
  const [permitValidFrom, setPermitValidFrom] = useState("");
  const [permitValidTo, setPermitValidTo] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [academicTitle, setAcademicTitle] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [fileErrors, setFileErrors] = useState({});

  // init from technician
  useEffect(() => {
    if (technician) {
      const data = {
        name: technician.name || "",
        specialty: technician.specialty || "",
        phone: technician.phone || "",
        email: technician.email || "",
        employmentType: technician.employmentType || "Freelancer",
        status: technician.status || "Active",
        joinDate: technician.joinDate || new Date().toISOString().split("T")[0],
      };
      setFormData(data);
      setInitialData(data);

      // extra fields
      setHomeAddress(technician.homeAddress || "");
      setAcademicTitle(technician.academicTitle || "");

      if (technician.hasCompensationOverride) {
        setUseCompensationOverride(true);
        if (
          technician.employmentType === "Freelancer" &&
          technician.commissionRateOverride != null
        ) {
          setOverrideCommissionRate(
            String(technician.commissionRateOverride)
          );
        }
        if (technician.employmentType === "Internal Employee") {
          if (technician.salaryOverride != null) {
            setOverrideSalary(String(technician.salaryOverride));
          }
          if (technician.bonusRateOverride != null) {
            setOverrideBonusRate(String(technician.bonusRateOverride));
          }
        }
      }
    } else {
      // new
      const empty = {
        name: "",
        specialty: "",
        phone: "",
        email: "",
        employmentType: "Freelancer",
        status: "Active",
        joinDate: new Date().toISOString().split("T")[0],
      };
      setFormData(empty);
      setInitialData(empty);
      setUseCompensationOverride(false);
      setOverrideBonusRate("");
      setOverrideCommissionRate("");
      setOverrideSalary("");
      setHomeAddress("");
      setAcademicTitle("");
    }
  }, [technician]);

  useEffect(() => {
    if (!technician) {
      setHasChanges(true);
      return;
    }
    const changed =
      formData.name !== initialData.name ||
      formData.specialty !== initialData.specialty ||
      formData.phone !== initialData.phone ||
      formData.email !== initialData.email ||
      formData.joinDate !== initialData.joinDate;
    setHasChanges(changed);
  }, [formData, initialData, technician]);

  // -------- file helpers ----------
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFileErrors((prev) => ({
        ...prev,
        photo: "Only .jpg, .png, .webp files are allowed",
      }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileErrors((prev) => ({
        ...prev,
        photo: "File size must be less than 2MB",
      }));
      return;
    }
    setFileErrors((prev) => ({ ...prev, photo: "" }));
    setPersonalPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPersonalPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleIdDocumentUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setFileErrors((prev) => ({
        ...prev,
        idDoc: "Only .jpg, .png, .pdf files are allowed",
      }));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setFileErrors((prev) => ({
        ...prev,
        idDoc: "File size must be less than 4MB",
      }));
      return;
    }
    setFileErrors((prev) => ({ ...prev, idDoc: "" }));
    setIdDocument(file);
  };

  const handleResidencePermitUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setFileErrors((prev) => ({
        ...prev,
        permit: "Only .jpg, .png, .pdf files are allowed",
      }));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setFileErrors((prev) => ({
        ...prev,
        permit: "File size must be less than 4MB",
      }));
      return;
    }
    setFileErrors((prev) => ({ ...prev, permit: "" }));
    setResidencePermit(file);
  };

  const handleCertificatesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (certificates.length + files.length > 5) {
      setFileErrors((prev) => ({
        ...prev,
        certificates: "Maximum 5 files allowed",
      }));
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    const validFiles = [];
    for (const f of files) {
      if (!validTypes.includes(f.type)) {
        setFileErrors((prev) => ({
          ...prev,
          certificates: "Only .jpg, .png, .pdf files are allowed",
        }));
        return;
      }
      if (f.size > 4 * 1024 * 1024) {
        setFileErrors((prev) => ({
          ...prev,
          certificates: "Each file must be less than 4MB",
        }));
        return;
      }
      validFiles.push(f);
    }
    setFileErrors((prev) => ({ ...prev, certificates: "" }));
    setCertificates((prev) => [...prev, ...validFiles]);
  };

  const removeCertificate = (idx) => {
    setCertificates((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---------- compensation validation ----------
  const validateCompOverride = () => {
    const errors = {};
    if (useCompensationOverride) {
      if (formData.employmentType === "Freelancer") {
        const rate = parseFloat(overrideCommissionRate);
        if (!overrideCommissionRate || isNaN(rate) || rate < 0 || rate > 100) {
          errors.commission = "Commission rate must be between 0 and 100";
        }
      } else {
        const salary = parseFloat(overrideSalary);
        const bonus = parseFloat(overrideBonusRate);
        if (!overrideSalary || isNaN(salary) || salary < 0) {
          errors.salary = "Base salary must be a positive number";
        }
        if (!overrideBonusRate || isNaN(bonus) || bonus < 0 || bonus > 100) {
          errors.bonus = "Bonus rate must be between 0 and 100";
        }
      }
    }
    setCompensationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---------- submit / close ----------
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.specialty || !formData.phone) {
      Swal.fire("Required", "Please fill all required fields", "error");
      return;
    }
    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      Swal.fire("Invalid Email", "Please enter a valid email address", "error");
      return;
    }
    if (userRole === "admin" && useCompensationOverride) {
      if (!validateCompOverride()) return;
    }

    const data = {
      name: formData.name,
      specialty: formData.specialty,
      phone: formData.phone,
      email: formData.email,
      status: formData.status,
      employmentType: formData.employmentType,
      joinDate: formData.joinDate,
    };

    if (userRole === "admin" && useCompensationOverride) {
      data.hasCompensationOverride = true;
      if (formData.employmentType === "Freelancer") {
        data.commissionRateOverride = parseFloat(overrideCommissionRate);
        data.commissionRate = GLOBAL_COMMISSION_RATE;
      } else {
        data.salaryOverride = parseFloat(overrideSalary);
        data.bonusRateOverride = parseFloat(overrideBonusRate);
        data.salary = GLOBAL_BASE_SALARY;
        data.bonusRate = GLOBAL_BONUS_RATE;
      }
    } else {
      data.hasCompensationOverride = false;
      if (formData.employmentType === "Freelancer") {
        data.commissionRate =
          (technician && technician.commissionRate) ||
          GLOBAL_COMMISSION_RATE;
      } else {
        data.salary = (technician && technician.salary) || GLOBAL_BASE_SALARY;
        data.bonusRate =
          (technician && technician.bonusRate) || GLOBAL_BONUS_RATE;
      }
    }

    // include additional info for backend
    data.homeAddress = homeAddress || "";
    data.academicTitle = academicTitle || "";

    // NOTE: additional files/info (photo, documents, etc.) future e API te pathate parba
    // (DispatcherTechnicians.jsx e /documents endpoint er jonno TODO akare rakha jay)

    onSave(data);
  };

  const handleClose = () => {
    // reset most extra fields
    setAdditionalOpen(false);
    setPersonalPhoto(null);
    setPersonalPhotoPreview(null);
    setIdDocument(null);
    setIsForeigner(false);
    setResidencePermit(null);
    setPermitValidFrom("");
    setPermitValidTo("");
    setHomeAddress("");
    setAcademicTitle("");
    setCertificates([]);
    setFileErrors({});
    onClose();
  };

  const employmentReadOnly = !!technician; // edit mode e type change off

  return (
    <ModalShell open={isOpen} onClose={handleClose} maxWidth="max-w-3xl">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        {technician ? "Edit Technician" : "Add New Technician"}
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        {technician
          ? "Update basic information. Compensation & employment type only Admin can manage."
          : "Enter technician details and choose employment type."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-[#c20001] font-medium">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="specialty">Specialty *</Label>
              <select
                id="specialty"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, specialty: e.target.value }))
                }
                className="w-full mt-0.5 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001]"
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
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+971 50 123 4567"
              />
            </div>
            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="technician@serviopro.com"
              />
            </div>
            <div>
              <Label htmlFor="joinDate">Join Date *</Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, joinDate: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        {/* Employment Type */}
        {/* ... (rest of the component remains exactly same as your version) ... */}
        {/* I am not repeating below to keep message shorter; you can keep your existing
            Employment, Compensation, Additional sections unchanged */}
        {/* paste the rest of your previous code from here downwards, unchanged */}

        {/* --- I kept the bottom buttons identical --- */}
        {useCompensationOverride && (
          <p className="text-xs text-gray-500 text-center">
            Changes apply to new jobs and new payment verifications.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button
            type="submit"
            disabled={technician && !hasChanges && !useCompensationOverride}
          >
            {technician ? "Update Technician" : "Add Technician"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};

export default AddEditTechnicianModal;
