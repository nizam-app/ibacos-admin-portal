// src/pages/call-center/Dashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Timer,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

const Dashboard = () => {
  const navigate = useNavigate();

  // 🔹 Summary state – এখানে label গুলোও রাখছি, যাতে backend থেকে আসা text UI তেও দেখাতে পারি
  const [summary, setSummary] = useState({
    total: 0,
    totalLabel: "All time SRs",

    pending: 0,
    pendingLabel: "Awaiting action",

    inProgress: 0,
    inProgressLabel: "Being worked on",

    resolved: 0,
    resolvedLabel: "Completed SRs",

    openToday: 0,
    openTodayLabel: "Opened today",

    avgDispatchTimeLabel: "—",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- API: /call-center/dashboard/stats ----
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosClient.get("/call-center/dashboard/stats");
        // Response structure: { success: true, stats: {...} }
        const stats = res.data?.stats || {};

        const totalServiceRequests = stats.totalServiceRequests || {};
        const pending = stats.pending || {};
        const inProgress = stats.inProgress || {};
        const resolved = stats.resolved || {};
        const openSRsToday = stats.openSRsToday || {};
        const avgTimeToDispatch = stats.avgTimeToDispatch || {};

        // hours থেকে fallback label বানিয়ে নিচ্ছি (যদি backend label না পাঠায়)
        const avgLabelFromHours =
          typeof avgTimeToDispatch.hours === "number"
            ? `${avgTimeToDispatch.hours} hrs`
            : "—";

        setSummary({
          total: totalServiceRequests.count ?? 0,
          totalLabel: totalServiceRequests.label || "All time SRs",

          pending: pending.count ?? 0,
          pendingLabel: pending.label || "Awaiting action",

          inProgress: inProgress.count ?? 0,
          inProgressLabel: inProgress.label || "Being worked on",

          resolved: resolved.count ?? 0,
          resolvedLabel: resolved.label || "Completed SRs",

          openToday: openSRsToday.count ?? 0,
          openTodayLabel: openSRsToday.label || "Opened today",

          avgDispatchTimeLabel:
            avgTimeToDispatch.label || avgLabelFromHours,
        });
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.message || "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ---- Cards config (values now come directly from stats API) ----
  const summaryCards = [
    {
      title: "Total Service Requests",
      value: summary.total,
      subtitle: summary.totalLabel,
      valueClass: "text-[#c20001]",
      Icon: FileText,
      iconColor: "text-[#c20001]",
    },
    {
      title: "Pending",
      value: summary.pending,
      subtitle: summary.pendingLabel,
      valueClass: "text-[#ffb111]",
      Icon: Clock3,
      iconColor: "text-[#ffb111]",
    },
    {
      title: "In Progress",
      value: summary.inProgress,
      subtitle: summary.inProgressLabel,
      valueClass: "text-[#f97316]",
      Icon: AlertTriangle,
      iconColor: "text-[#f97316]",
    },
    {
      title: "Resolved",
      value: summary.resolved,
      subtitle: summary.resolvedLabel,
      valueClass: "text-[#16a34a]",
      Icon: CheckCircle2,
      iconColor: "text-[#16a34a]",
    },
  ];

  const todayStats = {
    openToday: summary.openToday,
    avgDispatchTime: summary.avgDispatchTimeLabel,
  };

  return (
    <div className="min-h-full">
      {/* Header + Create SR button */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome to ServioPro Call Center Portal
          </p>

          {loading && (
            <p className="mt-2 text-xs text-gray-400">
              Loading latest stats...
            </p>
          )}
          {error && (
            <p className="mt-2 text-xs text-red-500">
              {error}
            </p>
          )}
        </div>

        <button
          onClick={() => navigate("/call-center/create-sr")}
          className="inline-flex items-center gap-2 rounded-lg bg-[#c20001] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#a80000]"
        >
          <span className="text-lg">＋</span>
          <span>Create SR</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-4">
        {summaryCards.map(({ Icon, ...card }) => (
          <div
            key={card.title}
            className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                {card.title}
              </h3>
              <div className="rounded-full bg-[#fff5f5] p-2">
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <p
              className={`text-2xl font-semibold mb-1 ${
                card.valueClass
              } ${loading ? "opacity-60" : ""}`}
            >
              {loading ? "—" : card.value}
            </p>
            <p className="text-sm text-gray-500">
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom small pills */}
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm">
          <BarChart3 className="h-4 w-4 text-[#c20001]" />
          <span className="text-gray-600">
            Open SRs Today:
            <span className="ml-1 font-semibold text-[#c20001]">
              {loading ? "—" : todayStats.openToday}
            </span>
          </span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm">
          <Timer className="h-4 w-4 text-[#ffb111]" />
          <span className="text-gray-600">
            Avg Time to Dispatch:
            <span className="ml-1 font-semibold text-[#ffb111]">
              {loading ? "—" : todayStats.avgDispatchTime}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
