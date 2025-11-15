// src/pages/dispatcher/Dashboard.jsx
import React from "react";
import {
  ClipboardList,
  Clock3,
  TrendingUp,
  FileText,
  ChevronRight,
  User,
  MapPin,
} from "lucide-react";

// --- Mock data --- //
const stats = [
  {
    id: "total",
    title: "Total Work Orders",
    value: 16,
    helper: "Created this week",
    icon: ClipboardList,
  },
  {
    id: "assigned",
    title: "Assigned",
    value: 10,
    helper: "Awaiting technician start",
    icon: Clock3,
  },
  {
    id: "inProgress",
    title: "In Progress",
    value: 2,
    helper: "Active on site",
    icon: TrendingUp,
  },
  {
    id: "serviceRequests",
    title: "Service Requests",
    value: 12,
    helper: "Unconverted SRs",
    icon: FileText,
  },
];

const recentWorkOrders = [
  {
    id: "WO0001",
    customer: "Ahmed Al-Mansoori",
    category: "Electrical",
    date: "2024-11-05",
    status: "Completed",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: "WO0002",
    customer: "Fatima Hassan",
    category: "Plumbing",
    date: "2024-11-06",
    status: "Completed",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: "WO0003",
    customer: "Mohammed Khalil",
    category: "HVAC",
    date: "2024-11-07",
    status: "Completed",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: "WO0004",
    customer: "Sara Abdullah",
    category: "General",
    date: "2024-11-04",
    status: "Completed",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: "WO0005",
    customer: "Ali Ahmed",
    category: "Electrical",
    date: "2024-11-11",
    status: "Assigned",
    statusColor: "bg-blue-100 text-blue-700",
  },
];

const technicianSummary = [
  {
    id: "active",
    title: "Active Technicians",
    helper: "Available for assignment",
    value: 6,
    bg: "bg-green-50",
    border: "border-green-100",
    text: "text-green-800",
  },
  {
    id: "busy",
    title: "Busy Technicians",
    helper: "Currently on job",
    value: 0,
    bg: "bg-orange-50",
    border: "border-orange-100",
    text: "text-orange-800",
  },
  {
    id: "blocked",
    title: "Blocked Technicians",
    helper: "Currently unavailable",
    value: 0,
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-800",
  },
];

// Small reusable card for top stats
function StatCard({ title, value, helper, icon: Icon }) {
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

const DispatcherDashboard = () => {
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
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4 md:grid-cols-2">
        {stats.map((item) => (
          <StatCard key={item.id} {...item} icon={item.icon} />
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
            {recentWorkOrders.map((wo) => (
              <li key={wo.id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#c20001]">
                      {wo.id} • {wo.customer}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {wo.category} • {wo.date}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${wo.statusColor}`}
                  >
                    {wo.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Technician Status */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Technician Status
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Current technician availability
            </p>
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

          <div className="mt-auto border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              View live technician locations in real time
            </p>
            <button className="inline-flex items-center rounded-full border border-[#c20001]/30 bg-[#c20001]/5 px-4 py-1.5 text-xs font-medium text-[#c20001] hover:bg-[#c20001]/10">
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
