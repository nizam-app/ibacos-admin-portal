// src/pages/admin/AdminCustomerManagement.jsx
import React, { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Smartphone,
  Download,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import Swal from "sweetalert2";

// ------------------ Demo Data ------------------
const demoCustomers = [
  {
    id: "CUST-1001",
    name: "John Doe",
    phone: "01711-000000",
    email: "john.doe@example.com",
    address: "House 10, Road 5, Dhanmondi, Dhaka",
    createdDate: "2025-12-10T08:30:00.000Z",
    source: "agent", // 'agent' | 'mobile-app'
  },
  {
    id: "CUST-1002",
    name: "Sarah Ahmed",
    phone: "01722-111111",
    email: "sarah.ahmed@example.com",
    address: "Uttara Sector 7, Dhaka",
    createdDate: "2025-12-11T10:15:00.000Z",
    source: "mobile-app",
  },
  {
    id: "CUST-1003",
    name: "Mahmud Hasan",
    phone: "01733-222222",
    email: "mahmud.hasan@example.com",
    address: "Mirpur DOHS, Dhaka",
    createdDate: "2025-12-11T14:45:00.000Z",
    source: "agent",
  },
];

const AdminCustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  // ------------- Stats -------------
  const totalCustomers = demoCustomers.length;

  const agentCreatedCount = useMemo(
    () => demoCustomers.filter((c) => c.source === "agent").length,
    []
  );

  const mobileAppCreatedCount = useMemo(
    () => demoCustomers.filter((c) => c.source === "mobile-app").length,
    []
  );

  // ------------- Filtering -------------
  const filteredCustomers = useMemo(() => {
    return demoCustomers.filter((customer) => {
      const matchesSource =
        sourceFilter === "all" || customer.source === sourceFilter;

      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        customer.name.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term) ||
        (customer.email || "").toLowerCase().includes(term) ||
        customer.id.toLowerCase().includes(term);

      return matchesSource && matchesSearch;
    });
  }, [searchTerm, sourceFilter]);

  // ------------- Export CSV -------------
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      Swal.fire(
        "No data",
        "There are no customers to export for the current filters.",
        "info"
      );
      return;
    }

    const header = [
      "ID",
      "Name",
      "Phone",
      "Email",
      "Address",
      "Source",
      "Created Date",
    ];

    const rows = filteredCustomers.map((c) => [
      c.id,
      c.name,
      c.phone,
      c.email || "",
      c.address || "",
      c.source === "agent" ? "Agent" : "Mobile App",
      new Date(c.createdDate).toLocaleString(),
    ]);

    const csvContent =
      [header, ...rows]
        .map((row) =>
          row
            .map((field) => {
              const value = String(field ?? "");
              // Escape quotes and wrap with quotes
              const escaped = value.replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    Swal.fire("Exported", "Customer list has been exported as CSV.", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Customer Management
        </h2>
        <p className="text-sm text-gray-600">
          View and manage all customers in the system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Customers */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-4 pb-3 pt-4">
            <p className="text-xs font-medium uppercase text-gray-500">
              Total Customers
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {totalCustomers}
            </p>
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-600">All registered customers</p>
          </div>
        </div>

        {/* Agent Created */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-4 pb-3 pt-4">
            <p className="flex items-center gap-2 text-xs font-medium uppercase text-gray-500">
              <UserPlus className="h-4 w-4" />
              Agent Created
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {agentCreatedCount}
            </p>
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-600">
              {totalCustomers > 0
                ? `${((agentCreatedCount / totalCustomers) * 100).toFixed(
                    1
                  )}% of total`
                : "0% of total"}
            </p>
          </div>
        </div>

        {/* Self-Registered */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-4 pb-3 pt-4">
            <p className="flex items-center gap-2 text-xs font-medium uppercase text-gray-500">
              <Smartphone className="h-4 w-4" />
              Self-Registered
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {mobileAppCreatedCount}
            </p>
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-600">
              {totalCustomers > 0
                ? `${(
                    (mobileAppCreatedCount / totalCustomers) *
                    100
                  ).toFixed(1)}% of total`
                : "0% of total"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#c20001] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c20001]"
              />
            </div>

            {/* Right side filters + export */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#c20001] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c20001] md:w-44"
              >
                <option value="all">All Sources</option>
                <option value="agent">Agent Created</option>
                <option value="mobile-app">Self-Registered</option>
              </select>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center justify-center rounded-lg border border-[#c20001] px-3 py-2 text-sm font-medium text-[#c20001] transition hover:bg-[#c20001] hover:text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Results count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredCustomers.length} of {totalCustomers} customers
            </p>
          </div>

          {/* Customers List */}
          <div className="space-y-4">
            {filteredCustomers.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500">
                  No customers found matching your criteria
                </p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    {/* Customer Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {customer.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ID: {customer.id}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{customer.email || "N/A"}</span>
                        </div>
                        <div className="md:col-span-2 flex items-start gap-2 text-sm text-gray-800">
                          <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                          <span>{customer.address || "N/A"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>
                          Created:{" "}
                          {new Date(customer.createdDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Source Badge */}
                    <div className="flex items-start">
                      {customer.source === "agent" ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          <UserPlus className="mr-1 h-3 w-3" />
                          Call Center Agent
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                          <Smartphone className="mr-1 h-3 w-3" />
                          Mobile App
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerManagement;
