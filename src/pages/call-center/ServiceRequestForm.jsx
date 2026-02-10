// src/pages/call-center/ServiceRequestForm.jsx
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Search,
  User,
  Mail,
  MapPin,
  FileText,
  Upload,
  X,
  Map,
} from "lucide-react";

import axiosClient from "../../api/axiosClient";
import {
  fetchCategories,
  fetchSubservices,
  fetchServices,
} from "../../api/serviceMetaApi";
import LocationPickerMap from "../../components/map/LocationPickerMap";

// 👉 Nouakchott default location
const DEFAULT_LATITUDE = 18.0735;
const DEFAULT_LONGITUDE = -15.9582;
const MIN_LOOKUP_DIGITS = 8;

function ServiceRequestForm() {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    landmark: "",
    latitude: DEFAULT_LATITUDE,   // 👈 Nouakchott
    longitude: DEFAULT_LONGITUDE, // 👈 Nouakchott
    customerNotes: "",
    categoryId: "",
    subserviceId: "",
    serviceId: "",
    description: "",
    priority: "",
    attachments: [],
    preferredDate: "",
    preferredTime: "",
  });

  // ---- customer & state ----
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [saveAsDefaultAddress, setSaveAsDefaultAddress] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [pinPlaced, setPinPlaced] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // ---- meta: category / service / subservice ----
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [subservices, setSubservices] = useState([]);
  const [metaError, setMetaError] = useState("");

  // ---- submit status ----
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // helper
  const normalizePhone = (phone) => phone.replace(/\D/g, "");

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
    
    setFormData((prev) => ({ ...prev, phone: limitedValue }));
    
    // Validate and set error
    if (limitedValue.length > 0) {
      const error = validatePhone(limitedValue);
      setPhoneError(error);
    } else {
      setPhoneError("");
    }
  };

  const buildFullAddress = (data) => {
    const parts = [data.address, data.city, data.landmark]
      .map((x) => x && x.trim())
      .filter(Boolean);
    return parts.join(", ");
  };

  // =========================
  //   LOAD META DATA
  // =========================
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await fetchCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
        setMetaError("Failed to load categories.");
      }
    };

    loadCategories();
  }, []);

  // category change → load services
  useEffect(() => {
    if (!formData.categoryId) {
      setServices([]);
      setSubservices([]);
      setFormData((prev) => ({
        ...prev,
        serviceId: "",
        subserviceId: "",
      }));
      return;
    }

    const loadServicesForCategory = async () => {
      try {
        const { data } = await fetchServices(formData.categoryId);
        setServices(data || []);
        setSubservices([]);
        setFormData((prev) => ({
          ...prev,
          serviceId: "",
          subserviceId: "",
        }));
      } catch (err) {
        console.error("Failed to load services", err);
        setMetaError("Failed to load services.");
      }
    };

    loadServicesForCategory();
  }, [formData.categoryId]);

  // service change → load subservices
  useEffect(() => {
    if (!formData.serviceId) {
      setSubservices([]);
      setFormData((prev) => ({ ...prev, subserviceId: "" }));
      return;
    }

    const loadSubservicesForService = async () => {
      try {
        const { data } = await fetchSubservices(formData.serviceId);
        setSubservices(data || []);
      } catch (err) {
        console.error("Failed to load subservices", err);
        setMetaError("Failed to load subservices.");
      }
    };

    loadSubservicesForService();
  }, [formData.serviceId]);

  // =========================
  //   PHONE → SEARCH CUSTOMER
  // =========================
  useEffect(() => {
    const raw = formData.phone;
    const normalized = normalizePhone(raw);

    // ⬇️ এখন ৮ digit এর কম হলে search করবে না
    if (!normalized || normalized.length < MIN_LOOKUP_DIGITS) {
      setFoundCustomer(null);
      setShowNewCustomerForm(false);
      setUseSavedAddress(true);
      setSaveAsDefaultAddress(false);
      setSearchError("");
      return;
    }

    let cancelled = false;

    const runSearch = async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        const { data } = await axiosClient.get("/sr/search-customer", {
          params: { phone: normalized },
        });

        if (cancelled) return;

        if (data.exists && data.customer) {
          // 🔴 customer পাওয়া গেছে → পুরনো logic একই থাকবে
          const c = data.customer;
          const homeAddress = (c.homeAddress || "").trim();
          const hasSavedAddress = homeAddress.length > 0;
          const parts = homeAddress.split(",");
          const street = parts[0]?.trim() || "";
          const city = parts.slice(1).join(",").trim() || "";

          setFoundCustomer(c);
          setShowNewCustomerForm(false);
          // Use saved address only if customer has one; otherwise require manual entry
          setUseSavedAddress(hasSavedAddress);
          setSaveAsDefaultAddress(false);

          setFormData((prev) => ({
            ...prev,
            customerName: c.name || prev.customerName,
            address: street || prev.address,
            city: city || prev.city,
            latitude: c.latitude ?? prev.latitude,
            longitude: c.longitude ?? prev.longitude,
          }));
          setPinPlaced(hasSavedAddress);
        } else {
          // 🟢 customer নাই → সাথে সাথেই New Customer form দেখাও
          setFoundCustomer(null);
          setShowNewCustomerForm(true);
          setUseSavedAddress(false);
          setSaveAsDefaultAddress(true);
          setPinPlaced(false);
        }
      } catch (err) {
        console.error("Customer search failed", err);
        if (!cancelled) {
          setSearchError(
            err.response?.data?.message || "Customer search failed."
          );
        }
      } finally {
        !cancelled && setSearchLoading(false);
      }
    };

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [formData.phone]);


  // =========================
  //   MAP: use saved address
  // =========================
  const toggleUseSavedAddress = () => {
    if (!foundCustomer) return;

    setUseSavedAddress((prev) => {
      const next = !prev;

      if (next) {
        // back to saved address
        const homeAddress = foundCustomer.homeAddress || "";
        const parts = homeAddress.split(",");
        const street = parts[0]?.trim() || "";
        const city = parts.slice(1).join(",").trim() || "";

        setFormData((fd) => ({
          ...fd,
          address: street,
          city,
          latitude: foundCustomer.latitude ?? fd.latitude,
          longitude: foundCustomer.longitude ?? fd.longitude,
        }));
        setPinPlaced(true);
      } else {
        // editable now – require pin
        setPinPlaced(false);
      }

      return next;
    });
  };

  // =========================
  //   FILE HANDLERS (UI only)
  // =========================
  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newFiles],
    }));
  };

  const handleRemoveFile = (index) => {
    const updated = [...(formData.attachments || [])];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, attachments: updated }));
  };

  // =========================
  //   SUBMIT → CREATE SR
  // =========================
  const resetForm = () => {
    setFormData({
      customerName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      landmark: "",
      latitude: DEFAULT_LATITUDE,   // 👈 reset to Nouakchott
      longitude: DEFAULT_LONGITUDE, // 👈 reset to Nouakchott
      customerNotes: "",
      categoryId: "",
      subserviceId: "",
      serviceId: "",
      description: "",
      priority: "",
      attachments: [],
      preferredDate: "",   // 👈
      preferredTime: "",   // 👈
    });
    setFoundCustomer(null);
    setUseSavedAddress(true);
    setSaveAsDefaultAddress(false);
    setShowNewCustomerForm(false);
    setPinPlaced(true);
    setPhoneError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");
    setSuccessMessage("");

    if (!pinPlaced) {
      setGlobalError("Please drop the pin on the map to set the job location.");
      return;
    }

    if (!formData.phone) {
      setGlobalError("Phone number is required.");
      return;
    }

    // Validate phone number
    const phoneValidationError = validatePhone(formData.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      setGlobalError(phoneValidationError);
      return;
    }
    if (!formData.preferredDate || !formData.preferredTime) {
      setGlobalError("Please select preferred date and time.");
      return;
    }

    if (
      !formData.categoryId ||
      !formData.serviceId ||
      !formData.subserviceId
    ) {
      setGlobalError("Please select category, service and subservice.");
      return;
    }

    if (!formData.priority) {
      setGlobalError("Please select priority.");
      return;
    }

    // Validate address: either use saved (when available) or manual entry
    const isUsingSavedAddress = Boolean(foundCustomer && useSavedAddress);
    const finalAddressCheck = isUsingSavedAddress
      ? (foundCustomer?.homeAddress || "").trim()
      : buildFullAddress(formData).trim();
    if (!finalAddressCheck) {
      setGlobalError(
        "Address is required. Please enter street address and city, or use customer's saved address."
      );
      return;
    }

    setSubmitting(true);

    try {
      const normalizedPhone = normalizePhone(formData.phone);

      // ---------- 1) ensure customer ----------
      let customerId = foundCustomer?.id;
      let customerPhone = foundCustomer?.phone || normalizedPhone;

      if (!foundCustomer) {
        const customerPayload = {
          name: formData.customerName || "New Customer",
          phone: normalizedPhone,
          email: formData.email || null,
          password: "customer123", // TODO: দরকার মতো change করো
          homeAddress: buildFullAddress(formData),
          latitude: formData.latitude,
          longitude: formData.longitude,
          registrationSource: "CALL_CENTER"
        };

        const { data: newCustomer } = await axiosClient.post(
          "/callcenter/customers",
          customerPayload
        );

        customerId = newCustomer.id;
        customerPhone = newCustomer.phone || normalizedPhone;
      }

      // ---------- 2) create SR ----------
      const customerNameToSend =
        foundCustomer?.name || formData.customerName || "New Customer";
      const preferredDateIso = formData.preferredDate
        ? new Date(formData.preferredDate).toISOString()
        : null;


      const isUsingSavedAddress = Boolean(foundCustomer && useSavedAddress);

      const finalAddress = isUsingSavedAddress
        ? (foundCustomer?.homeAddress || buildFullAddress(formData))
        : buildFullAddress(formData);

      const finalLat = isUsingSavedAddress
        ? (foundCustomer?.latitude ?? formData.latitude)
        : formData.latitude;

      const finalLng = isUsingSavedAddress
        ? (foundCustomer?.longitude ?? formData.longitude)
        : formData.longitude;

      const srPayload = {
        phone: customerPhone,
        name: customerNameToSend,
        email: formData.email || null,

        // ✅ এখানেই change
        address: finalAddress,
        latitude: finalLat,
        longitude: finalLng,

        categoryId: Number(formData.categoryId),
        subserviceId: Number(formData.subserviceId),
        serviceId: Number(formData.serviceId),
        description: formData.description,
        paymentType: "CASH",
        priority: formData.priority.toUpperCase(),
        preferredDate: preferredDateIso,
        preferredTime: formData.preferredTime,
      };

      console.log("SR payload:", srPayload);

      const { data: createdSR } = await axiosClient.post("/sr", srPayload);

      setSuccessMessage(
        `Service Request ${createdSR.srNumber || createdSR.id
        } created successfully.`
      );
      resetForm();
    } catch (err) {
      console.error("SR create failed", err);
      setGlobalError(
        err.response?.data?.message ||
        "Failed to create Service Request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };
  const selectedSubservice = subservices.find(
    (s) => String(s.id) === String(formData.subserviceId)
  );


  const isUsingSavedAddress = Boolean(foundCustomer && useSavedAddress);
  const shouldRequireAddressFields = !isUsingSavedAddress;

  // =========================
  //   RENDER
  // =========================
  return (
    <div className="min-h-full py-4">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          {/* Header */}
          <header className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900">
              Create New Service Request
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Log a new customer service request received via phone, WhatsApp,
              or email
            </p>
          </header>

          {metaError && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {metaError}
            </div>
          )}

          {globalError && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {globalError}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PHONE LOOKUP */}
            <section className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="flex items-center gap-2 text-sm font-medium text-gray-800"
                >
                  <Search className="h-4 w-4 text-[#c20001]" />
                  Phone Number (Customer Lookup)
                  <span className="text-[#c20001]">*</span>
                </label>

                <input
                  id="phone"
                  type="tel"
                  placeholder="23456789"
                  maxLength={8}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111] ${
                    phoneError
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                />

                {phoneError && (
                  <p className="text-xs text-red-600 mt-1">{phoneError}</p>
                )}
                {!phoneError && formData.phone.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 8 digits starting with 2, 3, or 4
                  </p>
                )}
                {searchLoading && (
                  <p className="text-xs text-gray-500">
                    Searching customer...
                  </p>
                )}
                {searchError && (
                  <p className="text-xs text-red-500">{searchError}</p>
                )}
              </div>

              {/* Existing customer info */}
              {foundCustomer && (
                <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Existing Customer Found
                      </span>
                    </div>

                    <div className="grid gap-x-4 gap-y-2 pl-6 md:grid-cols-2 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="mt-0.5 h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Name</p>
                          <p className="text-gray-900">
                            {foundCustomer.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Mail className="mt-0.5 h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="text-gray-900">
                            {foundCustomer.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 md:col-span-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Address</p>
                          <p className="text-gray-900">
                            {foundCustomer.homeAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* New customer card */}
              {showNewCustomerForm && !foundCustomer && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <h2 className="text-sm font-semibold text-blue-800">
                      Create New Customer
                    </h2>
                    <span className="rounded-full border border-blue-400 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                      Customer record will be created
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <label
                        htmlFor="newCustomerName"
                        className="text-xs font-medium text-gray-700"
                      >
                        Full Name *
                      </label>
                      <input
                        id="newCustomerName"
                        type="text"
                        placeholder="Enter customer name"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="newCustomerEmail"
                        className="text-xs font-medium text-gray-700"
                      >
                        Email (optional)
                      </label>
                      <input
                        id="newCustomerEmail"
                        type="email"
                        placeholder="customer@example.com"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="customerNotes"
                      className="text-xs font-medium text-gray-700"
                    >
                      Notes (Optional)
                    </label>
                    <textarea
                      id="customerNotes"
                      rows={2}
                      placeholder="Any additional customer information..."
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                      value={formData.customerNotes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerNotes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </section>

            {/* ADDRESS & MAP */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Map className="h-5 w-5 text-[#c20001]" />
                <h2 className="text-sm font-medium text-gray-700">
                  Address &amp; Map
                </h2>
              </div>

              {/* Toggle for existing customer address */}
              {foundCustomer && (
                <div className="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2 text-sm">
                  <span className="text-gray-700">
                    Use customer&apos;s saved address
                  </span>
                  <button
                    type="button"
                    onClick={toggleUseSavedAddress}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useSavedAddress ? "bg-[#c20001]" : "bg-gray-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${useSavedAddress ? "translate-x-4" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="address"
                    className="text-xs font-medium text-gray-700"
                  >
                    Street Address {!isUsingSavedAddress && <span className="text-[#c20001]">*</span>}
                  </label>
                  <input
                    id="address"
                    type="text"
                    placeholder="Enter street address"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    disabled={isUsingSavedAddress}
                    required={shouldRequireAddressFields}
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="city"
                    className="text-xs font-medium text-gray-700"
                  >
                    City {!isUsingSavedAddress && <span className="text-[#c20001]">*</span>}
                  </label>
                  <input
                    id="city"
                    type="text"
                    placeholder="Enter city"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    disabled={isUsingSavedAddress}
                    required={shouldRequireAddressFields}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="landmark"
                  className="text-xs font-medium text-gray-700"
                >
                  Landmark (Optional)
                </label>
                <input
                  id="landmark"
                  type="text"
                  placeholder="e.g., Near Central Mall, Behind City Park"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                  value={formData.landmark}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      landmark: e.target.value,
                    }))
                  }
                  disabled={foundCustomer && useSavedAddress}
                />
              </div>

              {/* Google Map */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">
                  Job Location (Drag pin to adjust)
                </p>

                <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                  <LocationPickerMap
                    lat={formData.latitude}
                    lng={formData.longitude}
                    disabled={foundCustomer && useSavedAddress}
                    // 👉 আগের মতই object payload নেবে
                    onChange={({ lat, lng }) => {
                      setFormData((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                      }));
                      setPinPlaced(true);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border bg-gray-50 px-3 py-2 text-sm">
                  <div className="flex flex-1 items-center gap-3">
                    <span className="text-gray-600">
                      Lat:{" "}
                      <span className="text-gray-900">
                        {Number(formData.latitude).toFixed(6)}
                      </span>
                      {", "}
                      Lng:{" "}
                      <span className="text-gray-900">
                        {Number(formData.longitude).toFixed(6)}
                      </span>
                    </span>

                    {!pinPlaced && (
                      <span className="flex items-center gap-1 text-sm text-red-600">
                        <span>●</span>
                        Please drop the pin to set job location
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPinPlaced(true)}
                    disabled={foundCustomer && useSavedAddress}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Use current pin
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <input
                  id="saveAsDefaultAddress"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#c20001] focus:ring-[#c20001]"
                  checked={saveAsDefaultAddress}
                  onChange={(e) => setSaveAsDefaultAddress(e.target.checked)}
                  disabled={foundCustomer && useSavedAddress}
                />
                <label
                  htmlFor="saveAsDefaultAddress"
                  className="cursor-pointer text-gray-700"
                >
                  Save this as customer&apos;s default address
                </label>
              </div>
            </section>

            {/* SERVICE DETAILS */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <h2 className="text-sm font-medium text-gray-700">
                  Service Details
                </h2>
              </div>

              {/* row 1: category + subservice */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="category"
                    className="text-xs font-medium text-gray-700"
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                        serviceId: "",
                        subserviceId: "",
                      }))
                    }
                    required
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="service"
                    className="text-xs font-medium text-gray-700"
                  >
                    Service *
                  </label>
                  <select
                    id="service"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111] disabled:bg-gray-100"
                    value={formData.serviceId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        serviceId: e.target.value,
                        subserviceId: "",
                      }))
                    }
                    required
                    disabled={!formData.categoryId || services.length === 0}
                  >
                    <option value="" disabled>
                      {formData.categoryId
                        ? "Select service"
                        : "Select category first"}
                    </option>
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* row 2: service + priority */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="subservice"
                    className="text-xs font-medium text-gray-700"
                  >
                    Subservice *
                  </label>
                  <select
                    id="subservice"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111] disabled:bg-gray-100"
                    value={formData.subserviceId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subserviceId: e.target.value,
                      }))
                    }
                    required
                    disabled={!formData.serviceId || subservices.length === 0}
                  >
                    <option value="" disabled>
                      {formData.serviceId
                        ? "Select subservice"
                        : "Select service first"}
                    </option>
                    {subservices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  {/* 🔹 এখানে base price দেখাচ্ছি */}
                  {selectedSubservice && (
                    <p className="text-xs text-gray-600 mt-1">
                      Base price:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedSubservice.baseRate} MRU
                      </span>
                    </p>
                  )}
                </div>


                {/* priority select – আগের মতোই */}
                <div className="space-y-1">
                  <label
                    htmlFor="priority"
                    className="text-xs font-medium text-gray-700"
                  >
                    Priority Level *
                  </label>
                  <select
                    id="priority"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="" disabled>
                      Select priority
                    </option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              {/* row 3: preferred date + time */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="preferredDate"
                    className="text-xs font-medium text-gray-700"
                  >
                    Preferred Date *
                  </label>
                  <input
                    id="preferredDate"
                    type="date"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                    value={formData.preferredDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferredDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="preferredTime"
                    className="text-xs font-medium text-gray-700"
                  >
                    Preferred Time *
                  </label>
                  <select
                    id="preferredTime"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                    value={formData.preferredTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferredTime: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="" disabled>
                      Select time
                    </option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
              </div>


              <div className="space-y-1">
                <label
                  htmlFor="description"
                  className="text-xs font-medium text-gray-700"
                >
                  Problem Description *
                </label>
                <textarea
                  id="description"
                  rows={5}
                  placeholder="Provide detailed description of the service request..."
                  className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Attachments – only UI side now */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">
                  Attachments (Optional)
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id="attachments"
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("attachments")?.click()
                    }
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files (Images/PDF)
                  </button>
                  <span className="text-xs text-gray-500">Max 5 files</span>
                </div>

                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="grid gap-2 md:grid-cols-2">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2 text-sm"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="truncate text-gray-800">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-red-100"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* SUBMIT */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#c20001] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#a80000] focus:outline-none focus:ring-2 focus:ring-[#ffb111] focus:ring-offset-1 disabled:opacity-70"
              >
                {submitting ? "Creating..." : "Create SR"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ServiceRequestForm;
