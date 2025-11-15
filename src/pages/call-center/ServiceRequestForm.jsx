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

const CATEGORY_SUBSERVICES = {
  Electrical: [
    "Wiring Repair",
    "Panel Upgrade",
    "Outlet Installation",
    "Lighting Fixtures",
    "Circuit Breaker",
  ],
  Plumbing: [
    "Leak Repair",
    "Drain Cleaning",
    "Pipe Installation",
    "Water Heater",
    "Fixture Replacement",
  ],
  HVAC: [
    "AC Repair",
    "Heating Repair",
    "Maintenance",
    "Installation",
    "Duct Cleaning",
  ],
  General: [
    "Home Inspection",
    "Maintenance",
    "Consultation",
    "Emergency Service",
    "Other",
  ],
};

function ServiceRequestForm({ onSubmit, customers = [] }) {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    landmark: "",
    latitude: 40.4406,
    longitude: -79.9959,
    customerNotes: "",
    category: "",
    subservice: "",
    description: "",
    priority: "",
    attachments: [],
  });

  const [foundCustomer, setFoundCustomer] = useState(null);
  const [previousSRCount, setPreviousSRCount] = useState(0);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [saveAsDefaultAddress, setSaveAsDefaultAddress] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [pinPlaced, setPinPlaced] = useState(true);

  // phone normalize
  const normalizePhone = (phone) => phone.replace(/\D/g, "");

  // phone lookup
  useEffect(() => {
    if (formData.phone.length >= 10) {
      const normalized = normalizePhone(formData.phone);
      const customer = customers.find(
        (c) => normalizePhone(c.phone || "") === normalized
      );

      if (customer) {
        setFoundCustomer(customer);
        setShowNewCustomerForm(false);
        setUseSavedAddress(true);
        setSaveAsDefaultAddress(false);
        setPreviousSRCount(Math.floor(Math.random() * 9));

        setFormData((prev) => ({
          ...prev,
          address: customer.address.split(",")[0].trim() || "",
          city: customer.address.split(",").slice(1).join(",").trim() || "",
          latitude: 40.4406 + (Math.random() - 0.5) * 0.02,
          longitude: -79.9959 + (Math.random() - 0.5) * 0.02,
        }));
        setPinPlaced(true);
      } else {
        setFoundCustomer(null);
        setShowNewCustomerForm(true);
        setUseSavedAddress(false);
        setSaveAsDefaultAddress(true);
        setPinPlaced(false);
      }
    } else {
      setFoundCustomer(null);
      setShowNewCustomerForm(false);
    }
  }, [formData.phone, customers]);

  // reset subservice when category changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, subservice: "" }));
  }, [formData.category]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!pinPlaced) {
      alert("Please place the pin on the map to set the job location.");
      return;
    }

    if (foundCustomer) {
      const dataToSubmit = {
        ...formData,
        customerName: foundCustomer.name,
        email: foundCustomer.email,
        address: foundCustomer.address,
      };
      onSubmit && onSubmit(dataToSubmit, foundCustomer.id);
    } else {
      onSubmit && onSubmit(formData, undefined);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      landmark: "",
      latitude: 40.4406,
      longitude: -79.9959,
      customerNotes: "",
      category: "",
      subservice: "",
      description: "",
      priority: "",
      attachments: [],
    });
    setFoundCustomer(null);
    setUseSavedAddress(true);
    setSaveAsDefaultAddress(false);
    setShowNewCustomerForm(false);
    setPinPlaced(true);
  };

  const handleUseCustomer = () => {
    if (!foundCustomer) return;
    setFormData((prev) => ({
      ...prev,
      customerName: foundCustomer.name,
      email: foundCustomer.email,
      address: foundCustomer.address,
    }));
  };

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

  const availableSubservices = formData.category
    ? CATEGORY_SUBSERVICES[formData.category] || []
    : [];

  const toggleUseSavedAddress = () => {
    if (!foundCustomer) return;
    setUseSavedAddress((prev) => {
      const next = !prev;
      if (next) {
        // back to saved address
        setFormData((fd) => ({
          ...fd,
          address: foundCustomer.address.split(",")[0].trim() || "",
          city:
            foundCustomer.address.split(",").slice(1).join(",").trim() || "",
        }));
        setPinPlaced(true);
      } else {
        // editable now – require pin
        setPinPlaced(false);
      }
      return next;
    });
  };

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
                  placeholder="Enter phone number to search customer..."
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
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
                          <p className="text-gray-900">{foundCustomer.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Mail className="mt-0.5 h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="text-gray-900">
                            {foundCustomer.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 md:col-span-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Address</p>
                          <p className="text-gray-900">
                            {foundCustomer.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-500">Previous SRs</p>
                          <p className="text-gray-900">
                            {previousSRCount} service requests
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pl-6">
                    <button
                      type="button"
                      onClick={handleUseCustomer}
                      className="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Use this customer
                    </button>
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
                          setFormData({
                            ...formData,
                            customerName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="newCustomerEmail"
                        className="text-xs font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        id="newCustomerEmail"
                        type="email"
                        placeholder="customer@example.com"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
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
                        setFormData({
                          ...formData,
                          customerNotes: e.target.value,
                        })
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
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      useSavedAddress ? "bg-[#c20001]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        useSavedAddress ? "translate-x-4" : "translate-x-1"
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
                    Street Address *
                  </label>
                  <input
                    id="address"
                    type="text"
                    placeholder="Enter street address"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={foundCustomer && useSavedAddress}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="city"
                    className="text-xs font-medium text-gray-700"
                  >
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    placeholder="Enter city"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111] focus:border-[#ffb111]"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    disabled={foundCustomer && useSavedAddress}
                    required
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
                    setFormData({ ...formData, landmark: e.target.value })
                  }
                  disabled={foundCustomer && useSavedAddress}
                />
              </div>

              {/* Map mock */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">
                  Job Location (Drag pin to adjust)
                </p>
                <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                  <div
                    className="relative flex w-full items-center justify-center bg-gradient-to-br from-blue-100 to-green-100"
                    style={{ height: "320px" }}
                  >
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, gray 1px, transparent 1px),
                          linear-gradient(to bottom, gray 1px, transparent 1px)
                        `,
                        backgroundSize: "20px 20px",
                      }}
                    />

                    <div
                      className={`absolute ${
                        foundCustomer && useSavedAddress
                          ? "cursor-default"
                          : "cursor-move"
                      }`}
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -100%)",
                      }}
                      draggable={!(foundCustomer && useSavedAddress)}
                      onDragEnd={(e) => {
                        if (foundCustomer && useSavedAddress) return;
                        const rect =
                          e.currentTarget.parentElement?.getBoundingClientRect();
                        if (!rect) return;

                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        const lat =
                          40.4406 + 0.01 * ((rect.height / 2 - y) / 50);
                        const lng =
                          -79.9959 + 0.01 * ((x - rect.width / 2) / 50);

                        setFormData((prev) => ({
                          ...prev,
                          latitude: parseFloat(lat.toFixed(6)),
                          longitude: parseFloat(lng.toFixed(6)),
                        }));
                        setPinPlaced(true);
                      }}
                      onClick={() => {
                        if (foundCustomer && useSavedAddress) return;
                        setPinPlaced(true);
                      }}
                    >
                      <MapPin
                        className="h-8 w-8 text-[#c20001] drop-shadow-lg"
                        fill="#c20001"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border bg-gray-50 px-3 py-2 text-sm">
                  <div className="flex flex-1 items-center gap-3">
                    <span className="text-gray-600">
                      Lat:{" "}
                      <span className="text-gray-900">
                        {formData.latitude.toFixed(6)}
                      </span>
                      {", "}
                      Lng:{" "}
                      <span className="text-gray-900">
                        {formData.longitude.toFixed(6)}
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

                <input type="hidden" value={formData.latitude} />
                <input type="hidden" value={formData.longitude} />
              </div>

              <div className="flex items-center gap-2 text-sm">
                <input
                  id="saveAsDefaultAddress"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#c20001] focus:ring-[#c20001]"
                  checked={saveAsDefaultAddress}
                  onChange={(e) =>
                    setSaveAsDefaultAddress(e.target.checked)
                  }
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
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="HVAC">HVAC</option>
                    <option value="General">General</option>
                  </select>
                </div>

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
                    value={formData.subservice}
                    onChange={(e) =>
                      setFormData({ ...formData, subservice: e.target.value })
                    }
                    required
                    disabled={!formData.category}
                  >
                    <option value="" disabled>
                      {formData.category
                        ? "Select subservice"
                        : "Select category first"}
                    </option>
                    {availableSubservices.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Select priority
                  </option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
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
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* Attachments */}
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
                className="w-full rounded-lg bg-[#c20001] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#a80000] focus:outline-none focus:ring-2 focus:ring-[#ffb111] focus:ring-offset-1"
              >
                Create SR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ServiceRequestForm;
