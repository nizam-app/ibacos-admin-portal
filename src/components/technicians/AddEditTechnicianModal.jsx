import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import TechnicianAPI from "../../api/TechnicianAPI";

// ------------ Icon components (same as TSX, but JS) ------------
const Briefcase = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const Users = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const DollarSign = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Percent = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7L7 9m0 0l2 2M7 9h12M9 17l-2-2m0 0l-2 2m2-2h12"
    />
  </svg>
);

const Lock = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const Info = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUp = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const Upload = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

const X = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FileText = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const ImageIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

// ---------- Small helpers ----------
const Label = ({ htmlFor, children, className = "" }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
  >
    {children}
  </label>
);

const TextInput = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c20001] focus:border-[#c20001] ${className}`}
  />
);

const TextArea = ({ className = "", ...props }) => (
  <textarea
    {...props}
    className={`mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c20001] focus:border-[#c20001] ${className}`}
  />
);

// ---------- Switch (custom) ----------
const SwitchControl = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${checked ? "bg-emerald-500" : "bg-gray-300"
      }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${checked ? "translate-x-4" : "translate-x-1"
        }`}
    />
  </button>
);

// ---------- Main Component ----------
export default function AddEditTechnicianModal({
  isOpen,
  onClose,
  onSave,
  technician,
  userRole = "dispatcher",
  defaultFreelancerRate,
  defaultInternalBonusRate,
  defaultBaseSalary,
}) {
  

  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
    employmentType: "Freelancer",
    status: "Active",
    joinDate: new Date().toISOString().split("T")[0],
    password: "", // ✅ NEW
  });

  const [initialData, setInitialData] = useState(formData);
  const [hasChanges, setHasChanges] = useState(false);

  // Specializations from API
  const [specializations, setSpecializations] = useState([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);

  // Compensation Override State (Admin only)
  const [useCompensationOverride, setUseCompensationOverride] = useState(false);
  const [overrideCommissionRate, setOverrideCommissionRate] = useState("");
  const [overrideSalary, setOverrideSalary] = useState("");
  const [overrideBonusRate, setOverrideBonusRate] = useState("");
  const [compensationErrors, setCompensationErrors] = useState({});
  const [phoneError, setPhoneError] = useState("");

  // Additional Information
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);
  const [personalPhoto, setPersonalPhoto] = useState(null);
  const [personalPhotoPreview, setPersonalPhotoPreview] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [existingIdCardUrl, setExistingIdCardUrl] = useState(null);
  const [isForeigner, setIsForeigner] = useState(false);
  const [residencePermit, setResidencePermit] = useState(null);
  const [permitValidFrom, setPermitValidFrom] = useState("");
  const [permitValidTo, setPermitValidTo] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [academicTitle, setAcademicTitle] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [existingCertificatesUrls, setExistingCertificatesUrls] = useState([]);
  const [fileErrors, setFileErrors] = useState({});

    // 🔹 Global values: API theke asle oita use, na ashley fallback
  const GLOBAL_COMMISSION_RATE = defaultFreelancerRate ?? 10;   // %
  const GLOBAL_BASE_SALARY = defaultBaseSalary ?? 5000;         // $
  const GLOBAL_BONUS_RATE = defaultInternalBonusRate ?? 5;      // %


  // ---------- Phone validation ----------
  const validatePhone = (phone) => {
    // Remove any non-digit characters
    const digitsOnly = phone.replace(/\D/g, "");
    
    // Check if it's exactly 8 digits
    if (digitsOnly.length !== 8) {
      return "Phone number must be exactly 8 digits";
    }
    
    // Check if it starts with 2, 3, or 4
    const firstDigit = digitsOnly[0];
    if (!["2", "3", "4"].includes(firstDigit)) {
      return "Phone number must start with 2, 3, or 4";
    }
    
    return "";
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "");
    // Limit to 8 digits
    const limitedValue = digitsOnly.slice(0, 8);
    
    setFormData({ ...formData, phone: limitedValue });
    
    // Validate and set error
    if (limitedValue.length > 0) {
      const error = validatePhone(limitedValue);
      setPhoneError(error);
    } else {
      setPhoneError("");
    }
  };

  // ---------- Effects ----------
  // Fetch specializations when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchSpecializations = async () => {
        try {
          setLoadingSpecializations(true);
          const response = await TechnicianAPI.getSpecializations(true);
          // Handle response structure: { success: true, data: [...] }
          const data = response.data?.data || response.data || [];
          setSpecializations(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to load specializations", err);
          Swal.fire({
            icon: "warning",
            title: "Failed to load specializations",
            text: "Please refresh the page or try again later.",
            timer: 3000,
            showConfirmButton: false,
          });
          setSpecializations([]);
        } finally {
          setLoadingSpecializations(false);
        }
      };

      fetchSpecializations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (technician) {
      // Normalize phone number - extract only digits
      const normalizedPhone = technician.phone
        ? technician.phone.replace(/\D/g, "").slice(0, 8)
        : "";
      
      const data = {
        name: technician.name,
        specialty: technician.specialty,
        phone: normalizedPhone,
        email: technician.email,
        employmentType: technician.employmentType,
        status: technician.status,
        joinDate: technician.joinDate,
        password: "",
      };
      setFormData(data);
      setInitialData(data);
      
      // Validate existing phone if present
      if (normalizedPhone) {
        const error = validatePhone(normalizedPhone);
        setPhoneError(error);
      }

      // Load existing document URLs
      if (technician.photoUrl) {
        setExistingPhotoUrl(technician.photoUrl);
      }
      if (technician.idCardUrl) {
        setExistingIdCardUrl(technician.idCardUrl);
      }
      if (technician.degreesUrl) {
        // Handle both array and single URL
        const degrees = Array.isArray(technician.degreesUrl)
          ? technician.degreesUrl
          : [technician.degreesUrl].filter(Boolean);
        setExistingCertificatesUrls(degrees);
      }
      if (technician.homeAddress) {
        setHomeAddress(technician.homeAddress);
      }
      if (technician.academicTitle) {
        setAcademicTitle(technician.academicTitle);
      }
      if (technician.isForeigner) {
        setIsForeigner(technician.isForeigner);
      }
      if (technician.residencePermitUrl) {
        // We'll show the existing permit URL if available
      }
      if (technician.residencePermitFrom) {
        setPermitValidFrom(technician.residencePermitFrom);
      }
      if (technician.residencePermitTo) {
        setPermitValidTo(technician.residencePermitTo);
      }

      if (technician.hasCompensationOverride) {
        setUseCompensationOverride(true);
        if (
          technician.employmentType === "Freelancer" &&
          technician.commissionRateOverride !== undefined
        ) {
          setOverrideCommissionRate(
            technician.commissionRateOverride.toString()
          );
        } else if (technician.employmentType === "Internal Employee") {
          if (technician.salaryOverride !== undefined) {
            setOverrideSalary(technician.salaryOverride.toString());
          }
          if (technician.bonusRateOverride !== undefined) {
            setOverrideBonusRate(technician.bonusRateOverride.toString());
          }
        }
      }
    }
  }, [technician]);

  useEffect(() => {
    if (technician) {
      const changed =
        formData.name !== initialData.name ||
        formData.specialty !== initialData.specialty ||
        formData.phone !== initialData.phone ||
        formData.email !== initialData.email ||
        formData.joinDate !== initialData.joinDate;
      setHasChanges(changed);
    }
  }, [formData, initialData, technician]);

  // ---------- File helpers ----------
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
    setExistingPhotoUrl(null); // Clear existing URL when new file is uploaded

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
    setExistingIdCardUrl(null); // Clear existing URL when new file is uploaded
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

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setFileErrors((prev) => ({
          ...prev,
          certificates: "Only .jpg, .png, .pdf files are allowed",
        }));
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        setFileErrors((prev) => ({
          ...prev,
          certificates: "Each file must be less than 4MB",
        }));
        return;
      }
      validFiles.push(file);
    }

    setFileErrors((prev) => ({ ...prev, certificates: "" }));
    setCertificates((prev) => [...prev, ...validFiles]);
  };

  const removeCertificate = (index) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // ---------- Compensation validation ----------
  const validateCompensationOverride = () => {
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

  // ---------- Submit ----------
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.specialty || !formData.phone) {
      Swal.fire({
        icon: "warning",
        title: "Missing required fields",
        text: "Please fill in all required fields.",
      });
      return;
    }

    // Validate phone number
    const phoneValidationError = validatePhone(formData.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      Swal.fire({
        icon: "error",
        title: "Invalid phone number",
        text: phoneValidationError,
      });
      return;
    }
    // ✅ NEW – only for create
    if (!technician) {
      if (!formData.password || formData.password.trim().length < 6) {
        Swal.fire({
          icon: "warning",
          title: "Invalid password",
          text: "Please set a password with at least 6 characters.",
        });
        return;
      }
    }


    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      Swal.fire({
        icon: "error",
        title: "Invalid email",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (userRole === "admin" && useCompensationOverride) {
      if (!validateCompensationOverride()) {
        Swal.fire({
          icon: "error",
          title: "Invalid compensation override",
          text: "Please fix the highlighted compensation fields.",
        });
        return;
      }
    }

    const data = {
      name: formData.name,
      specialty: formData.specialty,
      phone: formData.phone,
      email: formData.email,
      status: formData.status,
      employmentType: formData.employmentType,
      joinDate: formData.joinDate,
      homeAddress: homeAddress || null,
      academicTitle: academicTitle || null,
    };
    if (!technician) {
      data.password = formData.password;
    }

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
          technician?.commissionRate || GLOBAL_COMMISSION_RATE;
      } else {
        data.salary = technician?.salary || GLOBAL_BASE_SALARY;
        data.bonusRate = technician?.bonusRate || GLOBAL_BONUS_RATE;
      }
    }

    // handleSubmit er vitore, data create howar pore:

    const hasDocs =
      personalPhoto ||
      idDocument ||
      (isForeigner && residencePermit) ||
      certificates.length > 0 ||
      existingPhotoUrl ||
      existingIdCardUrl ||
      existingCertificatesUrls.length > 0;

    if (hasDocs) {
      const formDataDocs = new FormData();

      // New files take priority over existing URLs
      if (personalPhoto) {
        formDataDocs.append("photoUrl", personalPhoto);
      } else if (existingPhotoUrl && !personalPhoto) {
        // Keep existing photo if no new one is uploaded
        // Backend should handle this, but we can pass the URL if needed
        data.photoUrl = existingPhotoUrl;
      }

      if (idDocument) {
        formDataDocs.append("idCardUrl", idDocument);
      } else if (existingIdCardUrl && !idDocument) {
        // Keep existing ID card if no new one is uploaded
        data.idCardUrl = existingIdCardUrl;
      }

      if (isForeigner && residencePermit) {
        formDataDocs.append("residencePermitUrl", residencePermit);
      }
      
      if (certificates.length > 0) {
        certificates.forEach((file) => {
          formDataDocs.append("degreesUrl", file);
        });
      }
      
      // Include existing certificates URLs if no new ones are uploaded
      if (certificates.length === 0 && existingCertificatesUrls.length > 0) {
        data.degreesUrl = existingCertificatesUrls;
      }

      // optional: jodi date pathate chao
      if (isForeigner && permitValidFrom) {
        formDataDocs.append("residencePermitFrom", permitValidFrom);
      }
      if (isForeigner && permitValidTo) {
        formDataDocs.append("residencePermitTo", permitValidTo);
      }

      // ✅ onSave-e pathanor jonno
      data.documentsFormData = formDataDocs;
    }

    Swal.fire({
      icon: "success",
      title: technician ? "Technician updated" : "Technician added",
      text: "This is demo data – integrate your API here.",
    });

    if (onSave) onSave(data);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      specialty: "",
      phone: "",
      email: "",
      employmentType: "Freelancer",
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
      password: "", // ✅ NEW
    });

    setIsAdditionalInfoOpen(false);
    setPersonalPhoto(null);
    setPersonalPhotoPreview(null);
    setExistingPhotoUrl(null);
    setIdDocument(null);
    setExistingIdCardUrl(null);
    setIsForeigner(false);
    setResidencePermit(null);
    setPermitValidFrom("");
    setPermitValidTo("");
    setHomeAddress("");
    setAcademicTitle("");
    setCertificates([]);
    setExistingCertificatesUrls([]);
    setFileErrors({});
    setCompensationErrors({});
    setPhoneError("");
    setUseCompensationOverride(false);

    if (onClose) onClose();
  };

  if (!isOpen) return null;

  // ------------------------------------------------------------------
  // Modal Layout (Tailwind) – same design sections as your TSX version
  // ------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-200 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {technician ? "Edit Technician" : "Add New Technician"}
            </h2>
            {!technician && (
              <p className="text-sm text-gray-600">
                Enter technician details and select employment type.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-[#c20001] font-semibold text-sm uppercase tracking-wide">
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <TextInput
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="specialty">Specialty *</Label>
                <select
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) =>
                    setFormData({ ...formData, specialty: e.target.value })
                  }
                  disabled={loadingSpecializations}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c20001] focus:border-[#c20001] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">
                    {loadingSpecializations
                      ? "Loading specializations..."
                      : "Select specialty"}
                  </option>
                  {/* Show current specialty even if not in active list (for editing) */}
                  {technician &&
                    formData.specialty &&
                    !specializations.some(
                      (spec) => spec.name === formData.specialty
                    ) && (
                      <option value={formData.specialty}>
                        {formData.specialty} (Currently inactive)
                      </option>
                    )}
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.name}>
                      {spec.name}
                    </option>
                  ))}
                </select>
                {loadingSpecializations && (
                  <p className="text-xs text-gray-500 mt-1">
                    Loading specializations...
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <TextInput
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="23456789"
                  maxLength={8}
                  required
                  className={phoneError ? "border-red-500" : ""}
                />
                {phoneError && (
                  <p className="text-xs text-red-600 mt-1">{phoneError}</p>
                )}
                {!phoneError && formData.phone.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 8 digits starting with 2, 3, or 4
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <TextInput
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="technician@serviopro.com"
                />
              </div>

              <div>
                <Label htmlFor="joinDate">Join Date *</Label>
                <TextInput
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) =>
                    setFormData({ ...formData, joinDate: e.target.value })
                  }
                  required
                />
              </div>
              {!technician && (
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <TextInput
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Set login password"
                    required
                  />
                </div>
              )}

            </div>
          </div>

          {/* Employment Type */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[#c20001] font-semibold text-sm uppercase tracking-wide">
                Employment Type
              </h3>
              {technician && (
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Lock className="w-4 h-4" />
                  <span>Only Admin can change employment type and rates</span>
                </div>
              )}
            </div>

            {technician ? (
              <div className="flex items-center gap-3">
                {formData.employmentType === "Freelancer" ? (
                  <span className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Freelancer (Commission-based)
                  </span>
                ) : (
                  <span className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    Employee (Salary + Bonus)
                  </span>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.employmentType === "Freelancer"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                  onClick={() =>
                    setFormData({ ...formData, employmentType: "Freelancer" })
                  }
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${formData.employmentType === "Freelancer"
                        ? "bg-purple-500"
                        : "bg-gray-200"
                        }`}
                    >
                      <Briefcase
                        className={`w-5 h-5 ${formData.employmentType === "Freelancer"
                          ? "text-white"
                          : "text-gray-600"
                          }`}
                      />
                    </div>
                    <div>
                      <p
                        className={
                          formData.employmentType === "Freelancer"
                            ? "text-purple-900"
                            : "text-gray-900"
                        }
                      >
                        Freelancer
                      </p>
                      <p className="text-xs text-gray-600">
                        Commission based
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.employmentType === "Internal Employee"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      employmentType: "Internal Employee",
                    })
                  }
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${formData.employmentType === "Internal Employee"
                        ? "bg-blue-500"
                        : "bg-gray-200"
                        }`}
                    >
                      <Users
                        className={`w-5 h-5 ${formData.employmentType === "Internal Employee"
                          ? "text-white"
                          : "text-gray-600"
                          }`}
                      />
                    </div>
                    <div>
                      <p
                        className={
                          formData.employmentType === "Internal Employee"
                            ? "text-blue-900"
                            : "text-gray-900"
                        }
                      >
                        Employee
                      </p>
                      <p className="text-xs text-gray-600">
                        Salary + Bonus
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Compensation Details */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[#c20001] font-semibold text-sm uppercase tracking-wide">
                Compensation Details
              </h3>
              <div className="flex items-center gap-3">
                {userRole === "admin" && (
                  <div className="flex items-center gap-2 text-sm">
                    <SwitchControl
                      checked={useCompensationOverride}
                      onChange={(checked) => {
                        setUseCompensationOverride(checked);
                        if (!checked) {
                          setOverrideCommissionRate("");
                          setOverrideSalary("");
                          setOverrideBonusRate("");
                          setCompensationErrors({});
                        }
                      }}
                    />
                    <span
                      onClick={() =>
                        setUseCompensationOverride(!useCompensationOverride)
                      }
                      className="cursor-pointer"
                    >
                      Use individual override
                    </span>
                  </div>
                )}
                {userRole === "dispatcher" && (
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Lock className="w-4 h-4" />
                    <span>Editable by Admin only</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
              {formData.employmentType === "Freelancer" ? (
                <span>
                  Global Commission:{" "}
                  <strong className="text-purple-600">
                    {GLOBAL_COMMISSION_RATE}%
                  </strong>
                </span>
              ) : (
                <span>
                  Global Base Salary:{" "}
                  <strong className="text-blue-600">
                    ${GLOBAL_BASE_SALARY.toLocaleString()}
                  </strong>{" "}
                  · Global Bonus:{" "}
                  <strong className="text-blue-600">
                    {GLOBAL_BONUS_RATE}%
                  </strong>
                </span>
              )}
            </div>

            {userRole === "dispatcher" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                <Info className="w-4 h-4 inline mr-2" />
                Compensation is managed globally. Per-user overrides are
                available to Administrators only.
              </div>
            )}

            {userRole === "admin" && useCompensationOverride && (
              <div className="space-y-4">
                {formData.employmentType === "Freelancer" ? (
                  <div>
                    <Label htmlFor="commission-override">
                      Commission Rate (%) *
                    </Label>
                    <TextInput
                      id="commission-override"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={overrideCommissionRate}
                      onChange={(e) => {
                        setOverrideCommissionRate(e.target.value);
                        setCompensationErrors((prev) => ({
                          ...prev,
                          commission: undefined,
                        }));
                      }}
                      className={
                        compensationErrors.commission ? "border-red-500" : ""
                      }
                      placeholder="e.g., 12.5"
                    />
                    {compensationErrors.commission && (
                      <p className="text-xs text-red-600 mt-1">
                        {compensationErrors.commission}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="salary-override">
                        Base Salary ($) *
                      </Label>
                      <TextInput
                        id="salary-override"
                        type="number"
                        step="100"
                        min="0"
                        value={overrideSalary}
                        onChange={(e) => {
                          setOverrideSalary(e.target.value);
                          setCompensationErrors((prev) => ({
                            ...prev,
                            salary: undefined,
                          }));
                        }}
                        className={
                          compensationErrors.salary ? "border-red-500" : ""
                        }
                        placeholder="e.g., 6000"
                      />
                      {compensationErrors.salary && (
                        <p className="text-xs text-red-600 mt-1">
                          {compensationErrors.salary}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="bonus-override">
                        Bonus Rate (%) *
                      </Label>
                      <TextInput
                        id="bonus-override"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={overrideBonusRate}
                        onChange={(e) => {
                          setOverrideBonusRate(e.target.value);
                          setCompensationErrors((prev) => ({
                            ...prev,
                            bonus: undefined,
                          }));
                        }}
                        className={
                          compensationErrors.bonus ? "border-red-500" : ""
                        }
                        placeholder="e.g., 7.5"
                      />
                      {compensationErrors.bonus && (
                        <p className="text-xs text-red-600 mt-1">
                          {compensationErrors.bonus}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setUseCompensationOverride(false);
                    setOverrideCommissionRate("");
                    setOverrideSalary("");
                    setOverrideBonusRate("");
                    setCompensationErrors({});
                  }}
                  className="text-xs text-gray-600 hover:text-[#c20001]"
                >
                  Reset to Global
                </button>
              </div>
            )}

            {(userRole === "dispatcher" ||
              (userRole === "admin" && !useCompensationOverride)) &&
              (formData.employmentType === "Freelancer" ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-purple-900">
                    <Percent className="w-5 h-5" />
                    <span>Commission (Global)</span>
                  </div>
                  <p className="text-gray-800">
                    Configured by Admin:{" "}
                    <span className="text-purple-600">
                      {GLOBAL_COMMISSION_RATE}%
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 italic">
                    Applied automatically to all freelancers.{" "}
                    {userRole === "dispatcher" ? "Read-only." : ""}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-blue-900">
                    <DollarSign className="w-5 h-5" />
                    <span>Salary & Bonus (Global)</span>
                  </div>
                  <p className="text-gray-800">
                    Base Salary:{" "}
                    <span className="text-blue-600">
                      ${GLOBAL_BASE_SALARY.toLocaleString()}
                    </span>
                  </p>
                  <p className="text-gray-800">
                    Bonus Rate:{" "}
                    <span className="text-blue-600">
                      {GLOBAL_BONUS_RATE}%
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 italic">
                    Configured by Admin.{" "}
                    {userRole === "dispatcher"
                      ? "Read-only for Dispatcher."
                      : ""}
                  </p>
                </div>
              ))}
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsAdditionalInfoOpen((v) => !v)}
              className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h3 className="text-[#c20001] font-semibold text-sm">
                Additional Information (optional)
              </h3>
              {isAdditionalInfoOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {isAdditionalInfoOpen && (
              <div className="pt-4 space-y-6">
                {/* Personal Photo */}
                <div>
                  <Label>Personal Photo</Label>
                  <div className="mt-2">
                    {personalPhotoPreview ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={personalPhotoPreview}
                          alt="Preview"
                          className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPersonalPhoto(null);
                            setPersonalPhotoPreview(null);
                          }}
                          className="inline-flex items-center text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    ) : existingPhotoUrl ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={existingPhotoUrl}
                          alt="Current photo"
                          className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                        />
                        <div className="flex flex-col gap-2">
                          <span className="text-xs text-gray-500">Current photo</span>
                          <label className="inline-flex items-center text-xs px-3 py-1.5 rounded-full border border-[#c20001] text-[#c20001] hover:bg-[#c20001]/10 cursor-pointer">
                            <Upload className="w-3 h-3 mr-1" />
                            Replace
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#c20001] hover:bg-gray-50 transition-colors">
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              Click to upload photo
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              .jpg, .png, .webp • Max 2MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                        {fileErrors.photo && (
                          <p className="text-xs text-red-600 mt-1">
                            {fileErrors.photo}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ID Card / Passport */}
                <div>
                  <Label>ID Card / Passport</Label>
                  <div className="mt-2">
                    {idDocument ? (
                      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          {idDocument.type === "application/pdf" ? (
                            <FileText className="w-5 h-5 text-red-600" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                          )}
                          <div>
                            <p className="text-sm">{idDocument.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(idDocument.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIdDocument(null)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : existingIdCardUrl ? (
                      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          {existingIdCardUrl.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="w-5 h-5 text-red-600" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                          )}
                          <div>
                            <p className="text-sm">Current ID Document</p>
                            <a
                              href={existingIdCardUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#c20001] hover:underline"
                            >
                              View document
                            </a>
                          </div>
                        </div>
                        <label className="inline-flex items-center text-xs px-3 py-1.5 rounded-full border border-[#c20001] text-[#c20001] hover:bg-[#c20001]/10 cursor-pointer">
                          <Upload className="w-3 h-3 mr-1" />
                          Replace
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleIdDocumentUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div>
                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#c20001] hover:bg-gray-50 transition-colors">
                          <div className="text-center">
                            <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                            <p className="text-sm text-gray-600">
                              Upload ID document
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              .jpg, .png, .pdf • Max 4MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleIdDocumentUpload}
                            className="hidden"
                          />
                        </label>
                        {fileErrors.idDoc && (
                          <p className="text-xs text-red-600 mt-1">
                            {fileErrors.idDoc}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Foreigner / Residence permit */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Foreigner (requires residence permit)</Label>
                    <SwitchControl
                      checked={isForeigner}
                      onChange={setIsForeigner}
                    />
                  </div>

                  {isForeigner && (
                    <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                      <div>
                        <Label>Residence Permit Document</Label>
                        <div className="mt-2">
                          {residencePermit ? (
                            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                {residencePermit.type ===
                                  "application/pdf" ? (
                                  <FileText className="w-5 h-5 text-red-600" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-blue-600" />
                                )}
                                <div>
                                  <p className="text-sm">
                                    {residencePermit.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(residencePermit.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setResidencePermit(null)}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#c20001] hover:bg-gray-50 transition-colors">
                                <div className="text-center">
                                  <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                                  <p className="text-sm text-gray-600">
                                    Upload permit document
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    .jpg, .png, .pdf • Max 4MB
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={handleResidencePermitUpload}
                                  className="hidden"
                                />
                              </label>
                              {fileErrors.permit && (
                                <p className="text-xs text-red-600 mt-1">
                                  {fileErrors.permit}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="permitValidFrom">
                            Validity From
                          </Label>
                          <TextInput
                            id="permitValidFrom"
                            type="date"
                            value={permitValidFrom}
                            onChange={(e) =>
                              setPermitValidFrom(e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="permitValidTo">
                            Validity To
                          </Label>
                          <TextInput
                            id="permitValidTo"
                            type="date"
                            value={permitValidTo}
                            onChange={(e) =>
                              setPermitValidTo(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <p className="text-xs text-blue-600 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        System may remind before expiry.
                      </p>
                    </div>
                  )}
                </div>

                {/* Home Address */}
                <div>
                  <Label htmlFor="homeAddress">Home Address</Label>
                  <TextArea
                    id="homeAddress"
                    rows={3}
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    placeholder="Enter full home address (optional)"
                  />
                </div>

                {/* Academic Title */}
                <div>
                  <Label htmlFor="academicTitle">Academic Title</Label>
                  <TextInput
                    id="academicTitle"
                    value={academicTitle}
                    onChange={(e) => setAcademicTitle(e.target.value)}
                    placeholder="e.g., BSc, MSc, Engr."
                  />
                </div>

                {/* Certificates */}
                <div>
                  <Label>Degrees / Certificates</Label>
                  <div className="mt-2 space-y-3">
                    {/* Existing certificates */}
                    {existingCertificatesUrls.length > 0 && (
                      <div className="space-y-2">
                        {existingCertificatesUrls.map((url, index) => (
                          <div
                            key={`existing-${index}`}
                            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              {url.toLowerCase().endsWith('.pdf') ? (
                                <FileText className="w-5 h-5 text-red-600" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-blue-600" />
                              )}
                              <div>
                                <p className="text-sm">Certificate {index + 1}</p>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#c20001] hover:underline"
                                >
                                  View document
                                </a>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">Existing</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New certificates being uploaded */}
                    {certificates.length > 0 && (
                      <div className="space-y-2">
                        {certificates.map((file, index) => (
                          <div
                            key={`new-${index}`}
                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              {file.type === "application/pdf" ? (
                                <FileText className="w-5 h-5 text-red-600" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-blue-600" />
                              )}
                              <div>
                                <p className="text-sm">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCertificate(index)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {certificates.length + existingCertificatesUrls.length < 5 && (
                      <div>
                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#c20001] hover:bg-gray-50 transition-colors">
                          <div className="text-center">
                            <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                            <p className="text-sm text-gray-600">
                              Upload certificates
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              .jpg, .png, .pdf • Max 5 files, 4MB each (
                              {certificates.length + existingCertificatesUrls.length}/5 uploaded)
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            multiple
                            onChange={handleCertificatesUpload}
                            className="hidden"
                          />
                        </label>
                        {fileErrors.certificates && (
                          <p className="text-xs text-red-600 mt-1">
                            {fileErrors.certificates}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {useCompensationOverride && (
            <p className="text-xs text-gray-600 text-center">
              Changes apply to new jobs and new verifications.
            </p>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-[#c20001] hover:bg-[#c20001]/90 shadow-md disabled:opacity-60"
              disabled={technician && !hasChanges && !useCompensationOverride}
            >
              {technician ? "Update Technician" : "Add Technician"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
