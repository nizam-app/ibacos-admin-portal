// src/pages/dispatcher/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock3,
  TrendingUp,
  FileText,
  ChevronRight,
  User,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import TechnicianAPI from "../../api/TechnicianAPI";


// Small reusable card for top stats
function StatCard({ item }) {
  const { title, value, helper, icon: Icon } = item;
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
          <p className="mt-1 text-sm text-gray-500">{helper}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffb111]/10 text-[#ffb111]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// helper: format date
function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// helper: map backend status -> label + chip color
function mapWorkOrderStatus(status) {
  if (!status) return { label: "Unknown", color: "bg-gray-100 text-gray-700" };

  const s = status.toUpperCase();

  if (s.startsWith("COMPLETED")) {
    return { label: "Completed", color: "bg-green-100 text-green-700" };
  }
  if (s === "ASSIGNED" || s === "IN_PROGRESS") {
    return { label: "Assigned", color: "bg-blue-100 text-blue-700" };
  }
  if (s === "UNASSIGNED") {
    return { label: "Unassigned", color: "bg-yellow-100 text-yellow-700" };
  }
  if (s === "CANCELLED") {
    return { label: "Cancelled", color: "bg-red-100 text-red-700" };
  }

  return { label: status, color: "bg-gray-100 text-gray-700" };
}

function computeTechnicianStatus(techs) {
  const all = Array.isArray(techs) ? techs.length : 0;

  const getOpenCount = (t) => {
    if (Array.isArray(t.openWorkOrders)) return t.openWorkOrders.length;
    if (typeof t.openWorkOrders === "number") return t.openWorkOrders;
    if (typeof t.openJobsCount === "number") return t.openJobsCount;
    return 0;
  };

  let blocked = 0;
  let busy = 0;
  let active = 0;
  let offline = 0;

  (techs || []).forEach((t) => {
    const isBlocked = t.isBlocked === true || String(t.status || "").toUpperCase() === "BLOCKED";
    if (isBlocked) blocked++;

    const openCount = getOpenCount(t);
    const isBusy = !isBlocked && (openCount > 0 || String(t.availability || "").toUpperCase() === "BUSY");
    if (isBusy) busy++;

    const isActive = !isBlocked && !isBusy && String(t.status || "").toUpperCase() === "ACTIVE";
    if (isActive) active++;

    const isOnline = String(t.locationStatus || "").toUpperCase() === "ONLINE";
    if (!isOnline) offline++;
  });

  return {
    allTechnicians: all,
    activeTechnicians: active,      // Available for assignment
    busyTechnicians: busy,          // Currently on job
    blockedTechnicians: blocked,    // Blocked
    offlineTechnicians: offline,    // Optional row (reconcile totals)
  };
}


const DispatcherDashboard = () => {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [techStatus, setTechStatus] = useState(null);
  const [recentWorkOrders, setRecentWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          axiosClient.get("/dispatch/overview"),
          axiosClient.get("/dispatch/technician-status"),      // fallback
          axiosClient.get("/dispatch/recent-work-orders"),
          TechnicianAPI.getDirectory({ search: "", specialization: "All", type: "All" }), // preferred
        ]);

        if (!isMounted) return;

        const [overviewRes, techStatusRes, recentWORes, techDirRes] = results;

        // ✅ overview
        if (overviewRes.status === "fulfilled") {
          setOverview(overviewRes.value.data || null);
        } else {
          console.error("overview failed:", overviewRes.reason);
          setError("Failed to load dispatcher overview data.");
        }

        // ✅ recent work orders
        if (recentWORes.status === "fulfilled") {
          setRecentWorkOrders(
            Array.isArray(recentWORes.value.data) ? recentWORes.value.data : []
          );
        } else {
          console.error("recent WO failed:", recentWORes.reason);
          setRecentWorkOrders([]);
        }

        // ✅ technician status (prefer directory, fallback to /dispatch/technician-status)
        if (techDirRes.status === "fulfilled") {
          const techs = techDirRes.value.data?.technicians || [];

          // simple compute:
          const blocked = techs.filter(t => t.isBlocked === true || String(t.status || "").toUpperCase() === "BLOCKED").length;
          const busy = techs.filter(t => (t.openJobsCount ?? 0) > 0 || String(t.availability || "").toUpperCase() === "BUSY").length;
          const active = Math.max(0, techs.length - blocked - busy);

          setTechStatus({
            allTechnicians: techs.length,
            activeTechnicians: active,
            busyTechnicians: busy,
            blockedTechnicians: blocked,
          });
        } else if (techStatusRes.status === "fulfilled") {
          // fallback from backend summary API
          setTechStatus(techStatusRes.value.data || null);
        } else {
          console.error("tech status failed:", techDirRes.reason, techStatusRes.reason);
          setTechStatus(null);
        }
      } catch (err) {
        console.error("Dashboard fetchData fatal:", err);
        if (isMounted) setError("Failed to load dispatcher overview data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);


  const stats = [
    {
      id: "total",
      title: "Total Work Orders",
      value: overview ? overview.totalWorkOrders : "—",
      helper: overview
        ? `Created this week: ${overview.totalWorkOrdersThisWeek}`
        : "Created this week",
      icon: ClipboardList,
    },
    {
      id: "assigned",
      title: "Assigned",
      value: overview ? overview.assignedWorkOrders : "—",
      helper: "Awaiting technician start",
      icon: Clock3,
    },
    {
      id: "inProgress",
      title: "In Progress",
      value: overview ? overview.inProgressWorkOrders : "—",
      helper: "Active on site",
      icon: TrendingUp,
    },
    {
      id: "serviceRequests",
      title: "Service Requests",
      value: overview ? overview.serviceRequests : "—",
      helper: overview
        ? `Unconverted SRs: ${overview.unconvertedSRs}`
        : "Unconverted SRs",
      icon: FileText,
    },
  ];

  const technicianSummary = [
    {
      id: "active",
      title: "Active Technicians",
      helper: "Available for assignment",
      value: techStatus ? techStatus.activeTechnicians : 0,
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-800",
    },
    {
      id: "busy",
      title: "Busy Technicians",
      helper: "Currently on job",
      value: techStatus ? techStatus.busyTechnicians : 0,
      bg: "bg-orange-50",
      border: "border-orange-100",
      text: "text-orange-800",
    },
    {
      id: "blocked",
      title: "Blocked Technicians",
      helper: "Currently unavailable",
      value: techStatus ? techStatus.blockedTechnicians : 0,
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-800",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Dispatch Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor and manage work orders and technicians
        </p>
        {loading && (
          <p className="mt-2 text-xs text-gray-400">
            Loading dashboard data...
          </p>
        )}
        {error && (
          <p className="mt-2 text-xs text-red-500">
            {error}
          </p>
        )}
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.id} item={item} />
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-6 xl:grid-cols-[2fr,1.3fr]">
        {/* Recent Work Orders */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Recent Work Orders
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Latest created work orders
              </p>
            </div>
            <button className="inline-flex items-center text-xs font-medium text-[#c20001] hover:underline">
              View All
              <ChevronRight className="ml-1 h-3 w-3" />
            </button>
          </div>

          <ul className="divide-y divide-gray-100">
            {recentWorkOrders.length === 0 && !loading && (
              <li className="px-6 py-6 text-sm text-gray-500">
                No work orders found.
              </li>
            )}

            {recentWorkOrders.map((wo) => {
              const { label, color } = mapWorkOrderStatus(wo.status);
              const customerName = wo.customer?.name || "—";
              const categoryName = wo.category?.name || "";
              const date =
                formatDate(wo.scheduledAt) || formatDate(wo.createdAt);

              return (
                <li key={wo.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#c20001] truncate">
                        {wo.woNumber} • {customerName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 truncate">
                        {categoryName}
                        {categoryName && date ? " • " : ""}
                        {date}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${color}`}
                    >
                      {label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Technician Status */}
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Technician Status
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Current technician availability
            </p>
            {techStatus && (
              <p className="mt-1 text-[11px] text-gray-400">
                Total technicians: {techStatus.allTechnicians}
              </p>
            )}
          </div>

          <div className="space-y-3 px-6 py-4">
            {technicianSummary.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 ${item.bg} ${item.border}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ${item.text}`}
                  >
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${item.text}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-600">{item.helper}</p>
                  </div>
                </div>
                <p className={`text-lg font-semibold ${item.text}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <p className="text-xs text-gray-500">
              View live technician locations in real time
            </p>
            <button
              type="button"
              onClick={() => navigate("/technician-map")}
              className="inline-flex items-center rounded-full border border-[#c20001]/30 bg-[#c20001]/5 px-4 py-1.5 text-xs font-medium text-[#c20001] hover:bg-[#c20001]/10"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Open Technician Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatcherDashboard;
