// src/pages/admin/AdminCustomerManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
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
import CustomersAPI from "../../api/customersApi";

// registrationSource → nicer label
const mapRegistrationSourceLabel = (source) => {
  switch (source) {
    case "SELF_REGISTERED":
      return "Self-Registered (Mobile App)";
    case "CALL_CENTER":
      return "Call Center Agent";
    case "ADMIN":
      return "Admin Created";
    case "WEB_PORTAL":
      return "Web Portal";
    case "UNKNOWN":
    default:
      return "Unknown Source";
  }
};

const AdminCustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all"); // 'all' | 'SELF_REGISTERED' | 'CALL_CENTER' | ...

  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [statistics, setStatistics] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  // -------- API: load customers ----------
  const loadCustomers = async (filter = sourceFilter, pageToLoad = page) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: pageToLoad,
        limit,
      };
      if (filter !== "all") {
        params.registrationSource = filter;
      }

      const res = await CustomersAPI.getCustomers(params);
      const data = res.data || {};

      const list = Array.isArray(data.customers) ? data.customers : [];

      setTotalCustomers(data.total || list.length);
      setStatistics(data.statistics || null);

      const mapped = list.map((c) => ({
        id: c.id,
        name: c.name || "Unnamed Customer",
        phone: c.phone,
        email: c.email,
        address: c.homeAddress,
        createdDate: c.createdAt,
        registrationSource: c.registrationSource,
        isBlocked: c.isBlocked,
      }));

      setCustomers(mapped);

      // 🔹 calculate total pages (backend doesn't send pagination meta)
      const total = data.total || list.length || 0;
      const pages = total > 0 ? Math.ceil(total / limit) : 1;
      setTotalPages(pages || 1);
      setPage(pageToLoad);
    } catch (err) {
      console.error("Failed to load customers", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load customers. Please try again."
      );
      setCustomers([]);
      setTotalCustomers(0);
      setStatistics(null);
      setTotalPages(1);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 initial load + when filter changes → reset page = 1
  useEffect(() => {
    loadCustomers(sourceFilter, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilter]);

  // ------------- Stats from backend -------------
  const selfRegisteredCount =
    statistics?.selfRegistered?.count != null
      ? statistics.selfRegistered.count
      : 0;
  const callCenterCreatedCount =
    statistics?.callCenterCreated?.count != null
      ? statistics.callCenterCreated.count
      : 0;

  const selfRegisteredPercentage =
    statistics?.selfRegistered?.percentage ?? "0.0";
  const callCenterCreatedPercentage =
    statistics?.callCenterCreated?.percentage ?? "0.0";

  // ------------- Filtering (search – current page only) -------------
  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return customers.filter((customer) => {
      // sourceFilter already applied on API level, tai ekhane mainly search
      const matchesSearch =
        !term ||
        (customer.name || "").toLowerCase().includes(term) ||
        (customer.phone || "").toLowerCase().includes(term) ||
        (customer.email || "").toLowerCase().includes(term) ||
        String(customer.id).toLowerCase().includes(term);

      return matchesSearch;
    });
  }, [customers, searchTerm]);

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
      "Blocked",
      "Created Date",
    ];

    const rows = filteredCustomers.map((c) => [
      c.id,
      c.name,
      c.phone,
      c.email || "",
      c.address || "",
      mapRegistrationSourceLabel(c.registrationSource),
      c.isBlocked ? "Yes" : "No",
      c.createdDate ? new Date(c.createdDate).toLocaleString() : "",
    ]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row
          .map((field) => {
            const value = String(field ?? "");
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

    Swal.fire(
      "Exported",
      "Customer list for the current view has been exported as CSV.",
      "success"
    );
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
            <p className="text-sm text-gray-600">
              Based on current source filter
            </p>
          </div>
        </div>

        {/* Call Center / Agent Created */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-4 pb-3 pt-4">
            <p className="flex items-center gap-2 text-xs font-medium uppercase text-gray-500">
              <UserPlus className="h-4 w-4" />
              Call Center Created
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {callCenterCreatedCount}
            </p>
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-600">
              {totalCustomers > 0
                ? `${callCenterCreatedPercentage}% of total`
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
              {selfRegisteredCount}
            </p>
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-600">
              {totalCustomers > 0
                ? `${selfRegisteredPercentage}% of total`
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
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  // page reset useEffect e handle hochhe
                }}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#c20001] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c20001] md:w-44"
              >
                <option value="all">All Sources</option>
                <option value="SELF_REGISTERED">Self-Registered</option>
                <option value="CALL_CENTER">Call Center</option>
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
          {/* Results count / loading / error */}
          <div className="mb-4">
            {loading ? (
              <p className="text-sm text-gray-600">Loading customers…</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <p className="text-sm text-gray-600">
                Showing {filteredCustomers.length} of {totalCustomers} customers
                {totalPages > 1 && ` • Page ${page} of ${totalPages}`}
              </p>
            )}
          </div>

          {/* Customers List */}
          <div className="space-y-4">
            {!loading && !error && filteredCustomers.length === 0 ? (
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
                          {customer.isBlocked && (
                            <span className="mt-1 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                              Blocked
                            </span>
                          )}
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
                        {customer.createdDate && (
                          <span>
                            Created:{" "}
                            {new Date(
                              customer.createdDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Source Badge */}
                    <div className="flex items-start">
                      {customer.registrationSource === "CALL_CENTER" ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          <UserPlus className="mr-1 h-3 w-3" />
                          Call Center Agent
                        </span>
                      ) : customer.registrationSource === "SELF_REGISTERED" ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                          <Smartphone className="mr-1 h-3 w-3" />
                          Self-Registered
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {mapRegistrationSourceLabel(
                            customer.registrationSource
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-end gap-3 text-xs text-gray-600">
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => loadCustomers(sourceFilter, page - 1)}
                className="rounded border border-gray-300 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => loadCustomers(sourceFilter, page + 1)}
                className="rounded border border-gray-300 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerManagement;
