// src/pages/administrator/AdminAuditLogPage.jsx
import React, { useMemo, useState } from "react";
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
    outline:
      "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
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
// Mock audit events
// ------------------------------------------------------
const mockAuditEvents = [
  {
    id: "AE-001",
    timestamp: new Date("2025-11-05T09:12:00"),
    eventType: "Created",
    workOrderId: "WO-2025-001",
    performedBy: {
      id: "ADMIN001",
      name: "System Admin",
      role: "Admin",
      avatar: "",
    },
    details: "Work Order created from web portal.",
    metadata: {
      beforeStatus: "-",
      afterStatus: "Pending",
      ipAddress: "10.0.0.12",
      device: "Chrome / macOS",
    },
  },
  {
    id: "AE-002",
    timestamp: new Date("2025-11-05T09:20:15"),
    eventType: "Dispatched",
    workOrderId: "WO-2025-001",
    performedBy: {
      id: "DISP001",
      name: "Nizam Uddin",
      role: "Dispatcher",
      avatar: "",
    },
    details:
      "Assigned to technician Mike Johnson with SLA 2 hours.",
    metadata: {
      beforeStatus: "Pending",
      afterStatus: "Assigned",
      assignedTechnician: { id: "TECH001", name: "Mike Johnson" },
      ipAddress: "10.0.0.21",
      device: "iPad / Safari",
    },
  },
  {
    id: "AE-003",
    timestamp: new Date("2025-11-05T11:48:33"),
    eventType: "Completed",
    workOrderId: "WO-2025-001",
    performedBy: {
      id: "TECH001",
      name: "Mike Johnson",
      role: "Technician",
      avatar: "",
    },
    details:
      "Job marked as completed on-site, photos uploaded from mobile app.",
    metadata: {
      beforeStatus: "In Progress",
      afterStatus: "Completed",
      ipAddress: "10.0.2.15",
      device: "Android / App v1.3.0",
    },
  },
  {
    id: "AE-004",
    timestamp: new Date("2025-11-05T12:03:11"),
    eventType: "Paid Verified",
    workOrderId: "WO-2025-001",
    performedBy: {
      id: "ADMIN001",
      name: "System Admin",
      role: "Admin",
      avatar: "",
    },
    details:
      "Payment of 500 SAR verified via Stripe. Technician commission 50 SAR.",
    metadata: {
      paymentMethod: "Stripe",
      paymentAmount: 500,
      commissionAmount: 50,
      proofId: "PAY-STR-394923",
      beforeStatus: "Completed",
      afterStatus: "Paid",
    },
  },
  {
    id: "AE-005",
    timestamp: new Date("2025-11-06T08:14:09"),
    eventType: "Reassigned",
    workOrderId: "WO-2025-003",
    performedBy: {
      id: "DISP002",
      name: "Dispatcher Aisha",
      role: "Dispatcher",
      avatar: "",
    },
    details:
      "Reassigned from John Smith to Sarah Davis due to schedule conflict.",
    metadata: {
      beforeStatus: "Assigned",
      afterStatus: "Assigned",
      assignedTechnician: { id: "TECH002", name: "Sarah Davis" },
    },
  },
  {
    id: "AE-006",
    timestamp: new Date("2025-11-06T09:50:30"),
    eventType: "Cancelled",
    workOrderId: "WO-2025-004",
    performedBy: {
      id: "ADMIN001",
      name: "System Admin",
      role: "Admin",
      avatar: "",
    },
    details:
      "Work Order cancelled after fraud check. Customer account temporarily blocked.",
    metadata: {
      beforeStatus: "Pending",
      afterStatus: "Cancelled",
      ipAddress: "192.168.1.44",
      device: "Backoffice / Admin",
    },
  },
];

// ------------------------------------------------------
// Helpers for badge colors
// ------------------------------------------------------
const getEventBadgeColor = (eventType) => {
  switch (eventType) {
    case "Created":
      return "bg-blue-100 text-blue-800";
    case "Dispatched":
      return "bg-purple-100 text-purple-800";
    case "Reassigned":
      return "bg-yellow-100 text-yellow-800";
    case "Paid Verified":
      return "bg-green-100 text-green-800";
    case "Completed":
      return "bg-emerald-100 text-emerald-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getRoleBadgeColor = (role) => {
  switch (role) {
    case "Admin":
      return "bg-[#c20001] text-white";
    case "Dispatcher":
      return "bg-blue-100 text-blue-800";
    case "Technician":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// ------------------------------------------------------
// Drawer for event details
// ------------------------------------------------------
const AuditEventDrawer = ({ event, onClose }) => {
  const isStatusChange =
    event.metadata?.beforeStatus || event.metadata?.afterStatus;
  const isPaymentEvent = event.eventType === "Paid Verified";

  return (
    <div className="fixed inset-0 z-40">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
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
            <Badge className={getEventBadgeColor(event.eventType)}>
              {event.eventType}
            </Badge>
            <Badge className="bg-gray-100 text-gray-800">
              WO: {event.workOrderId}
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
                  {event.performedBy.role}
                </Badge>
                {event.performedBy.role !== "Admin" &&
                  (isStatusChange || isPaymentEvent) && (
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      Admin must approve final status
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* details */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-700">
              Details
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {event.details}
            </p>
          </div>

          {/* statuses */}
          {isStatusChange && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Before Status</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {event.metadata.beforeStatus || "-"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500">After Status</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {event.metadata.afterStatus || "-"}
                </p>
              </div>
            </div>
          )}

          {/* payment info */}
          {isPaymentEvent && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">
                Payment & Payout
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg border border-green-100 p-3">
                  <p className="text-xs text-green-700">Payment Amount</p>
                  <p className="text-sm font-semibold text-green-800 mt-1">
                    {event.metadata.paymentAmount} SAR
                  </p>
                  <p className="text-[11px] text-green-700/80 mt-1">
                    Method: {event.metadata.paymentMethod}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg border border-blue-100 p-3">
                  <p className="text-xs text-blue-700">Commission</p>
                  <p className="text-sm font-semibold text-blue-800 mt-1">
                    {event.metadata.commissionAmount} SAR
                  </p>
                  <p className="text-[11px] text-blue-700/80 mt-1">
                    Proof ID: {event.metadata.proofId}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* tech info */}
          {event.metadata.assignedTechnician && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Assigned Technician</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {event.metadata.assignedTechnician.name}
              </p>
              <p className="text-[11px] text-gray-500">
                ID: {event.metadata.assignedTechnician.id}
              </p>
            </div>
          )}

          {/* device / IP */}
          {(event.metadata.ipAddress || event.metadata.device) && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Security Context</p>
              {event.metadata.ipAddress && (
                <p className="text-xs text-gray-700 mt-1">
                  IP: <span className="font-mono">{event.metadata.ipAddress}</span>
                </p>
              )}
              {event.metadata.device && (
                <p className="text-xs text-gray-700">
                  Device: {event.metadata.device}
                </p>
              )}
            </div>
          )}

          {/* note about admin control */}
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3">
            <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5" />
            <p className="text-xs text-red-700">
              Only <span className="font-semibold">Admin</span> can
              permanently change Work Order or payment status. Non-admin
              actions are logged as requests and must be approved in the
              admin portal.
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
  const [events] = useState(mockAuditEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // filters
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [eventTypeFilter, setEventTypeFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [workOrderIdFilter, setWorkOrderIdFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

      if (eventTypeFilter !== "All" && event.eventType !== eventTypeFilter) {
        return false;
      }

      if (
        roleFilter !== "All" &&
        event.performedBy.role !== roleFilter
      ) {
        return false;
      }

      if (
        workOrderIdFilter &&
        !event.workOrderId
          .toLowerCase()
          .includes(workOrderIdFilter.toLowerCase())
      ) {
        return false;
      }

      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matches =
          event.details.toLowerCase().includes(s) ||
          event.performedBy.name.toLowerCase().includes(s) ||
          event.workOrderId.toLowerCase().includes(s);
        if (!matches) return false;
      }

      return true;
    });
  }, [events, dateRange, eventTypeFilter, roleFilter, workOrderIdFilter, searchTerm]);

  const clearFilters = () => {
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });
    setEventTypeFilter("All");
    setRoleFilter("All");
    setWorkOrderIdFilter("");
    setSearchTerm("");
  };

  const hasActiveFilters =
    eventTypeFilter !== "All" ||
    roleFilter !== "All" ||
    workOrderIdFilter !== "" ||
    searchTerm !== "";

  const handleExportCSV = () => {
    const headers = [
      "Timestamp",
      "Event",
      "WorkOrder",
      "PerformedBy",
      "Role",
      "Details",
    ];
    const rows = filteredEvents.map((event) => [
      formatDate(event.timestamp, "yyyy-MM-dd HH:mm:ss"),
      event.eventType,
      event.workOrderId,
      event.performedBy.name,
      event.performedBy.role,
      event.details.replace(/"/g, '""'),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit_log_${formatDate(
      new Date(),
      "yyyy-MM-dd"
    )}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "Audit CSV exported",
      text: "Mock file generated. Connect backend storage for real export.",
      confirmButtonColor: "#c20001",
    });
  };

  const handleFilterByWorkOrderClick = (woId) => {
    setWorkOrderIdFilter(woId);
    Swal.fire({
      icon: "info",
      title: "Filtered by Work Order",
      text: `Showing events for ${woId}`,
      confirmButtonColor: "#c20001",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Audit Log
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track all payments, payouts, blocking and sensitive changes.
          </p>
          <p className="mt-1 inline-flex items-center text-xs text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
            Only <span className="font-semibold mx-1">Admin</span> can
            permanently change Work Order or payment status.
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* date range */}
            <div className="space-y-2">
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

            {/* event type */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Event type</label>
              <div className="flex flex-wrap gap-2">
                {["All", "Created", "Dispatched", "Paid Verified"].map(
                  (type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={
                        eventTypeFilter === type ? "solid" : "outline"
                      }
                      className={
                        eventTypeFilter === type
                          ? "bg-[#c20001] hover:bg-[#c20001]/90 text-white"
                          : ""
                      }
                      onClick={() => setEventTypeFilter(type)}
                    >
                      {type}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Work order ID */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Work Order ID</label>
              <Input
                placeholder="WO-2025-001..."
                value={workOrderIdFilter}
                onChange={(e) => setWorkOrderIdFilter(e.target.value)}
              />
            </div>
          </div>

          {/* row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* role */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">User role</label>
              <div className="flex gap-2">
                {["All", "Admin", "Dispatcher", "Technician"].map(
                  (role) => (
                    <Button
                      key={role}
                      size="sm"
                      variant={
                        roleFilter === role ? "solid" : "outline"
                      }
                      className={
                        roleFilter === role
                          ? "bg-[#c20001] hover:bg-[#c20001]/90 text-white"
                          : ""
                      }
                      onClick={() => setRoleFilter(role)}
                    >
                      {role === "All" ? "All roles" : role}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* search */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search in details, user, work order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* summary */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Summary</label>
              <div className="h-10 flex items-center rounded-lg border border-dashed border-gray-300 px-3 text-xs text-gray-600 bg-gray-50">
                Showing{" "}
                <span className="mx-1 font-semibold text-[#c20001]">
                  {filteredEvents.length}
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
                  <th className="text-left px-4 py-3">Work Order</th>
                  <th className="text-left px-4 py-3">Performed by</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
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
                  filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col">
                          <span>
                            {formatDate(
                              event.timestamp,
                              "MMM dd, yyyy"
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(event.timestamp, "HH:mm:ss")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Badge className={getEventBadgeColor(event.eventType)}>
                          {event.eventType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFilterByWorkOrderClick(
                              event.workOrderId
                            );
                          }}
                          className="text-[#c20001] hover:underline"
                        >
                          {event.workOrderId}
                        </button>
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
                          {event.performedBy.role}
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
