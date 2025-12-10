// src/pages/administrator/AdminAuditLogPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  CalendarDays,
  Download,
  FileText,
  Filter,
  Search,
  X,
  ShieldAlert,
  UserCircle2,
} from "lucide-react";
import AuditLogAPI from "../../api/auditLogApi";

// ------------------------------------------------------
// Small Tailwind UI helpers (Card, Button, Badge, Input)
// ------------------------------------------------------
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
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
  };
  const sizes = {
    sm: "h-9 px-3 text-sm",
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

// ------------------------------------------------------
// Date utils (simple versions)
// ------------------------------------------------------
const startOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfMonth = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
};

const isWithinInterval = (date, interval) => {
  const t = date.getTime();
  return t >= interval.start.getTime() && t <= interval.end.getTime();
};

const formatDate = (date, pattern = "yyyy-MM-dd HH:mm:ss") => {
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const mins = date.getMinutes();
  const secs = date.getSeconds();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return pattern
    .replace("yyyy", year)
    .replace("MMM", monthNames[month - 1])
    .replace("MM", pad(month))
    .replace("dd", pad(day))
    .replace("HH", pad(hours))
    .replace("mm", pad(mins))
    .replace("ss", pad(secs));
};

// ------------------------------------------------------
// Mapping helpers
// ------------------------------------------------------
const parseMetadata = (metadataJson) => {
  if (!metadataJson) return {};
  try {
    return JSON.parse(metadataJson);
  } catch {
    return {};
  }
};

const buildDetailsFromLog = (log, meta) => {
  const entityLabel = `${log.entityType} #${log.entityId}`;
  const action = log.action || "";

  switch (action) {
    case "PAYMENT_VERIFIED":
      return `Payment verified for ${entityLabel}${
        meta.amount ? ` (amount: ${meta.amount})` : ""
      }.`;
    case "WO_ASSIGNED":
      return `Work order #${log.entityId} assigned${
        meta.technicianId ? ` to technician #${meta.technicianId}` : ""
      }.`;
    case "WO_CREATED_FROM_SR":
      return `Work order #${log.entityId} created from service request.`;
    case "WO_START":
      return `Work order #${log.entityId} started.`;
    case "WO_COMPLETE":
      return `Work order #${log.entityId} completed.`;
    case "WO_CANCELLED":
      return `Work order #${log.entityId} cancelled.`;
    case "SR_CANCELLED":
      return `Service request #${log.entityId} cancelled.`;
    case "TECHNICIAN_BLOCKED":
      return `Technician blocked (user #${log.entityId}).`;
    case "TECHNICIAN_UNBLOCKED":
      return `Technician unblocked (user #${log.entityId}).`;
    case "TECHNICIAN_CREATED":
      return `Technician created (user #${log.entityId}).`;
    case "TECHNICIAN_UPDATED":
      return `Technician updated (user #${log.entityId}).`;
    case "USER_LOGIN":
      return `User logged in (user #${log.entityId}).`;
    case "USER_LOGOUT":
      return `User logged out (user #${log.entityId}).`;
    default:
      return (action || "").replace(/_/g, " ") + ` (${entityLabel})`;
  }
};

const getRoleLabel = (backendRole) => {
  const r = (backendRole || "").toUpperCase();
  switch (r) {
    case "ADMIN":
      return "Admin";
    case "DISPATCHER":
      return "Dispatcher";
    case "CALL_CENTER":
      return "Call Center";
    case "TECH_INTERNAL":
    case "TECH_FREELANCER":
      return "Technician";
    case "CUSTOMER":
      return "Customer";
    default:
      return backendRole || "Unknown";
  }
};

// ------------------------------------------------------
// Helpers for badge colors
// ------------------------------------------------------
const getEventBadgeColor = (action) => {
  const a = (action || "").toUpperCase();

  if (a.startsWith("PAYMENT_")) return "bg-green-100 text-green-800";
  if (a.startsWith("WO_")) return "bg-blue-100 text-blue-800";
  if (a.includes("CATEGORY")) return "bg-amber-100 text-amber-800";
  if (a.includes("CUSTOMER")) return "bg-emerald-100 text-emerald-800";
  if (a.includes("CREATED")) return "bg-emerald-100 text-emerald-800";
  if (a.includes("UPDATED")) return "bg-indigo-100 text-indigo-800";
  if (a.includes("DELETED")) return "bg-rose-100 text-rose-800";
  if (a.includes("BLOCKED") || a.includes("CANCELLED"))
    return "bg-red-100 text-red-800";

  return "bg-gray-100 text-gray-800";
};

const getRoleBadgeColor = (backendRole) => {
  const r = (backendRole || "").toUpperCase();
  if (r === "ADMIN") return "bg-[#c20001] text-white";
  if (r === "DISPATCHER") return "bg-blue-100 text-blue-800";
  if (r === "CALL_CENTER") return "bg-amber-100 text-amber-800";
  if (r.startsWith("TECH_")) return "bg-purple-100 text-purple-800";
  if (r === "CUSTOMER") return "bg-gray-100 text-gray-800";
  return "bg-gray-100 text-gray-800";
};

// ------------------------------------------------------
// Drawer for event details
// ------------------------------------------------------
const AuditEventDrawer = ({ event, onClose }) => {
  const meta = event.metadata || {};
  const isPaymentEvent = (event.action || "").toUpperCase().startsWith(
    "PAYMENT_"
  );
  const entityLabel = event.entityLabel;

  return (
    <div className="fixed inset-0 z-40">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#c20001]" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Audit Event Details
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(event.timestamp, "MMM dd, yyyy HH:mm:ss")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-gray-100 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {/* header info */}
          <div className="flex items-center justify-between">
            <Badge className={getEventBadgeColor(event.action)}>
              {event.actionLabel}
            </Badge>
            <Badge className="bg-gray-100 text-gray-800">
              {entityLabel || "No entity"}
            </Badge>
          </div>

          {/* actor */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c20001]/10 flex items-center justify-center">
              <UserCircle2 className="w-6 h-6 text-[#c20001]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {event.performedBy.name}
              </p>
              <div className="flex items-center gap-2">
                <Badge className={getRoleBadgeColor(event.performedBy.role)}>
                  {getRoleLabel(event.performedBy.role)}
                </Badge>
              </div>
            </div>
          </div>

          {/* details */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-700">Details</p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {event.details}
            </p>
          </div>

          {/* Payment-specific UI */}
          {isPaymentEvent && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">
                Payment details
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg border border-green-100 p-3">
                  <p className="text-xs text-green-700">Entity</p>
                  <p className="text-sm font-semibold text-green-800 mt-1">
                    {entityLabel}
                  </p>
                  {meta.amount && (
                    <p className="text-[11px] text-green-700/80 mt-1">
                      Amount: {meta.amount}
                    </p>
                  )}
                </div>
                <div className="bg-blue-50 rounded-lg border border-blue-100 p-3">
                  <p className="text-xs text-blue-700">Performed by</p>
                  <p className="text-sm font-semibold text-blue-800 mt-1">
                    {event.performedBy.name}
                  </p>
                  <p className="text-[11px] text-blue-700/80 mt-1">
                    Role: {getRoleLabel(event.performedBy.role)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* note */}
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3">
            <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5" />
            <p className="text-xs text-red-700">
              Only <span className="font-semibold">Admin</span> can permanently
              change payment, payout, or blocking status. All actions are
              recorded in this audit log.
            </p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------
// Main page component
// ------------------------------------------------------
const AdminAuditLogPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // "All events" | "Payments only" | "Work orders only"
  const [eventTypeFilter, setEventTypeFilter] = useState("All events");

  const [roleFilter, setRoleFilter] = useState("All roles");
  const [entityFilter, setEntityFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // pagination (client-side)
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedEvent, setSelectedEvent] = useState(null);

  // ---------- API helper ----------
  const loadAuditLogs = async () => {
    try {
      setLoading(true);

      const params = {};
      // only payments → use backend param
      if (eventTypeFilter === "Payments only") {
        params.action = "PAYMENT_VERIFIED";
      }

      const res = await AuditLogAPI.getAuditLogs(params);
      const data = Array.isArray(res.data) ? res.data : res.data?.logs || [];

      const mapped = data.map((log) => {
        const meta = parseMetadata(log.metadataJson);
        const timestamp = new Date(log.createdAt);
        const entityLabel =
          log.entityType && log.entityId
            ? `${log.entityType} #${log.entityId}`
            : log.entityType || "—";

        const actionLabel = (log.action || "").replace(/_/g, " ");

        return {
          id: log.id,
          timestamp,
          action: log.action,
          actionLabel,
          entityType: log.entityType,
          entityId: log.entityId,
          entityLabel,
          metadata: meta,
          details: buildDetailsFromLog(log, meta),
          performedBy: {
            id: log.user?.id ?? log.userId,
            name: log.user?.name ?? "Unknown user",
            role: log.user?.role ?? "UNKNOWN",
          },
        };
      });

      setEvents(mapped);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to load audit logs", err);
      Swal.fire(
        "Error",
        "Failed to load audit logs. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // load on mount + when "eventTypeFilter" changes (All / Payments only)
  useEffect(() => {
    loadAuditLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTypeFilter]);

  // ---------- Filtering ----------
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // date range
      if (
        !isWithinInterval(event.timestamp, {
          start: dateRange.from,
          end: dateRange.to,
        })
      ) {
        return false;
      }

      // "Work orders only" client-side filter
      if (eventTypeFilter === "Work orders only") {
        const t = (event.entityType || "").toUpperCase();
        if (t !== "WORK_ORDER" && t !== "SERVICE_REQUEST") {
          return false;
        }
      }

      // role filter (by backend role)
      if (roleFilter !== "All roles") {
        const backendRole = (event.performedBy.role || "").toUpperCase();
        if (
          (roleFilter === "Admin" && backendRole !== "ADMIN") ||
          (roleFilter === "Dispatcher" && backendRole !== "DISPATCHER") ||
          (roleFilter === "Technician" &&
            !backendRole.startsWith("TECH_")) ||
          (roleFilter === "Customer" && backendRole !== "CUSTOMER")
        ) {
          return false;
        }
      }

      // entity text filter (e.g. "WORK_ORDER #35")
      if (
        entityFilter &&
        !(event.entityLabel || "")
          .toLowerCase()
          .includes(entityFilter.toLowerCase())
      ) {
        return false;
      }

      // text search
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matches =
          (event.details || "").toLowerCase().includes(s) ||
          (event.performedBy.name || "").toLowerCase().includes(s) ||
          (event.entityLabel || "").toLowerCase().includes(s) ||
          (event.actionLabel || "").toLowerCase().includes(s);
        if (!matches) return false;
      }

      return true;
    });
  }, [
    events,
    dateRange,
    eventTypeFilter,
    roleFilter,
    entityFilter,
    searchTerm,
  ]);

  // ---------- Pagination ----------
  const totalEvents = filteredEvents.length;
  const pageCount = Math.max(1, Math.ceil(totalEvents / pageSize));
  const clampedPage = Math.min(currentPage, pageCount);
  const startIndex = (clampedPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageEvents = filteredEvents.slice(startIndex, endIndex);

  const clearFilters = () => {
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });
    setEventTypeFilter("All events");
    setRoleFilter("All roles");
    setEntityFilter("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    eventTypeFilter !== "All events" ||
    roleFilter !== "All roles" ||
    entityFilter !== "" ||
    searchTerm !== "";

  const handleExportCSV = () => {
    const headers = [
      "Timestamp",
      "Action",
      "Entity",
      "PerformedBy",
      "Role",
      "Details",
    ];
    const rows = filteredEvents.map((event) => [
      formatDate(event.timestamp, "yyyy-MM-dd HH:mm:ss"),
      event.action,
      event.entityLabel,
      event.performedBy.name,
      getRoleLabel(event.performedBy.role),
      (event.details || "").replace(/"/g, '""'),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit_log_${formatDate(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "Audit CSV exported",
      confirmButtonColor: "#c20001",
    });
  };

  const handleFilterByEntityClick = (entityLabel) => {
    setEntityFilter(entityLabel);
    Swal.fire({
      icon: "info",
      title: "Filtered by entity",
      text: `Showing events for ${entityLabel}`,
      confirmButtonColor: "#c20001",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track all financial and operational actions (payments, payouts,
            blocking, category changes, etc.).
          </p>
          <p className="mt-1 inline-flex items-center text-xs text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
            Only <span className="font-semibold mx-1">Admin</span> can
            permanently change payment and blocking status.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="border-[#c20001] text-[#c20001] hover:bg-[#c20001] hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <CardTitle>Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-[#c20001] hover:text-[#c20001] hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* row 1 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* date range */}
            <div className="space-y-2 md:col-span-4">
              <label className="text-sm text-gray-700">Date range</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="date"
                    value={formatDate(dateRange.from, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        from: new Date(e.target.value),
                      }))
                    }
                    className="pl-9"
                  />
                </div>
                <div className="flex-1 relative">
                  <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="date"
                    value={formatDate(dateRange.to, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        to: new Date(e.target.value),
                      }))
                    }
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* event type buttons */}
            <div className="space-y-2 md:col-span-5">
              <label className="text-sm text-gray-700">Event type</label>
              <div className="flex flex-wrap gap-2">
                {["All events", "Payments only", "Work orders only"].map(
                  (type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={
                        eventTypeFilter === type ? "solid" : "outline"
                      }
                      className={`rounded-full px-4 ${
                        eventTypeFilter === type
                          ? "bg-[#c20001] hover:bg-[#c20001]/90 text-white"
                          : "border-gray-300 text-gray-700"
                      }`}
                      onClick={() => setEventTypeFilter(type)}
                    >
                      {type}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Entity filter */}
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm text-gray-700">Entity (ID / type)</label>
              <Input
                placeholder="WORK_ORDER #35, USER #1..."
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* row 2 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* role */}
            <div className="space-y-2 md:col-span-5">
              <label className="text-sm text-gray-700">User role</label>
              <div className="flex flex-wrap gap-2">
                {["All roles", "Admin", "Dispatcher", "Technician", "Customer"].map(
                  (role) => (
                    <Button
                      key={role}
                      size="sm"
                      variant={roleFilter === role ? "solid" : "outline"}
                      className={`rounded-full px-4 ${
                        roleFilter === role
                          ? "bg-[#c20001] hover:bg-[#c20001]/90 text-white"
                          : "border-gray-300 text-gray-700"
                      }`}
                      onClick={() => {
                        setRoleFilter(role);
                        setCurrentPage(1);
                      }}
                    >
                      {role}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* search */}
            <div className="space-y-2 md:col-span-4">
              <label className="text-sm text-gray-700">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search in details, user, entity..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            {/* summary */}
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm text-gray-700">Summary</label>
              <div className="h-10 flex items-center rounded-lg border border-dashed border-gray-300 px-3 text-xs text-gray-600 bg-gray-50">
                Showing{" "}
                <span className="mx-1 font-semibold text-[#c20001]">
                  {totalEvents}
                </span>
                of
                <span className="mx-1 font-semibold text-[#c20001]">
                  {events.length}
                </span>
                audit events
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3">Timestamp</th>
                  <th className="text-left px-4 py-3">Event</th>
                  <th className="text-left px-4 py-3">Entity</th>
                  <th className="text-left px-4 py-3">Performed by</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-gray-500"
                    >
                      Loading audit events...
                    </td>
                  </tr>
                ) : pageEvents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-gray-500"
                    >
                      <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      No audit events found for current filters.
                    </td>
                  </tr>
                ) : (
                  pageEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col">
                          <span>
                            {formatDate(event.timestamp, "MMM dd, yyyy")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(event.timestamp, "HH:mm:ss")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Badge className={getEventBadgeColor(event.action)}>
                          {event.actionLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {event.entityLabel ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFilterByEntityClick(event.entityLabel);
                            }}
                            className="text-[#c20001] hover:underline"
                          >
                            {event.entityLabel}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#c20001]/10 flex items-center justify-center">
                            <UserCircle2 className="w-4 h-4 text-[#c20001]" />
                          </div>
                          <span>{event.performedBy.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Badge
                          className={getRoleBadgeColor(
                            event.performedBy.role
                          )}
                        >
                          {getRoleLabel(event.performedBy.role)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 align-top max-w-md">
                        <p className="text-gray-700 truncate">
                          {event.details}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* pagination footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-600">
            <span>
              Showing{" "}
              <span className="font-semibold">
                {totalEvents === 0 ? 0 : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {totalEvents === 0 ? 0 : Math.min(endIndex, totalEvents)}
              </span>{" "}
              of <span className="font-semibold">{totalEvents}</span> audit
              events
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={clampedPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹ Prev
              </Button>
              <span>
                Page{" "}
                <span className="font-semibold">{clampedPage}</span> of{" "}
                <span className="font-semibold">{pageCount}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={clampedPage >= pageCount}
                onClick={() =>
                  setCurrentPage((p) => Math.min(pageCount, p + 1))
                }
                className="h-8 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next ›
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedEvent && (
        <AuditEventDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default AdminAuditLogPage;
