// src/components/admin/Top5TechniciansWidget.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Award,
  Calendar as CalendarIcon,
  Star,
  TrendingUp,
} from "lucide-react";
import Swal from "sweetalert2";
import DashboardAPI from "../../api/dashboardApi";

// ------- small date helpers (no external lib) -------
function subDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

const METRICS = {
  completedJobs: "Completed Jobs",
  productivity: "Productivity",
  rating: "Customer Rating",
};

const PERIODS = {
  "7d": "7 Days",
  "30d": "30 Days",
  thisMonth: "This Month",
  custom: "Custom",
};

// map UI period -> backend timeframe string
const PERIOD_TO_TIMEFRAME = {
  "7d": "7days",
  "30d": "30days",
  thisMonth: "this_month", // need hole backend e eta change korte paro
  custom: "custom",
};

export function Top5TechniciansWidget() {
  const [selectedMetric, setSelectedMetric] = useState("completedJobs");
  const [dateRangeType, setDateRangeType] = useState("thisMonth");
  const [customDateRange, setCustomDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // date range (UI display er jonno)
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (dateRangeType) {
      case "7d":
        return { from: subDays(now, 7), to: now };
      case "30d":
        return { from: subDays(now, 30), to: now };
      case "thisMonth":
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case "custom":
        return customDateRange;
      default:
        return { from: startOfMonth(now), to: endOfMonth(now) };
    }
  }, [dateRangeType, customDateRange]);

  // ----------- API call -----------
  useEffect(() => {
    const fetchTop5 = async () => {
      try {
        setLoading(true);
        setError("");

        const timeframe = PERIOD_TO_TIMEFRAME[dateRangeType];

        const params = { timeframe };

        if (dateRangeType === "custom") {
          params.startDate = customDateRange.from.toISOString();
          params.endDate = customDateRange.to.toISOString();
        }

        const res = await DashboardAPI.getTop5Technicians(params);
        // axiosClient.get -> { data: ... }
        const data = res.data || res;

        setTechnicians(data.top5Technicians || []);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.message || "Failed to load top technicians."
        );
        setTechnicians([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTop5();
  }, [dateRangeType, customDateRange]);

  // top 5 sort by selected metric
  const top5Technicians = useMemo(() => {
    const sorted = [...technicians].sort((a, b) => {
      const aCompleted = a.completedJobs ?? 0;
      const bCompleted = b.completedJobs ?? 0;
      const aRevenue = a.totalRevenue ?? 0;
      const bRevenue = b.totalRevenue ?? 0;
      const aRating = a.averageRating ?? 0;
      const bRating = b.averageRating ?? 0;

      if (selectedMetric === "completedJobs") return bCompleted - aCompleted;
      if (selectedMetric === "productivity") return bRevenue - aRevenue;
      if (selectedMetric === "rating") return bRating - aRating;
      return 0;
    });

    return sorted.slice(0, 5);
  }, [technicians, selectedMetric]);

  const getMetricValue = (tech) => {
    const completed = tech.completedJobs ?? 0;
    const revenue = tech.totalRevenue ?? 0;
    const rating = tech.averageRating ?? 0;

    if (selectedMetric === "completedJobs") return `${completed} jobs`;

    if (selectedMetric === "productivity") {
      if (!revenue) return "—";
      return `${revenue.toLocaleString()} revenue`;
    }

    if (selectedMetric === "rating") {
      return (
        <span className="flex items-center gap-1">
          {rating.toFixed(1)}
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        </span>
      );
    }

    return null;
  };

  const getMetricSubtext = (tech) => {
    const typeLabel =
      tech.type === "INTERNAL"
        ? "Internal technician"
        : tech.type === "FREELANCER"
        ? "Freelancer"
        : "Technician";

    if (selectedMetric === "completedJobs") {
      return `${typeLabel}${
        tech.specialization ? ` • ${tech.specialization}` : ""
      }`;
    }
    if (selectedMetric === "productivity") {
      return tech.specialization || typeLabel;
    }
    if (selectedMetric === "rating") {
      const reviews = tech.totalReviews ?? 0;
      return `${reviews} review${reviews === 1 ? "" : "s"}`;
    }
    return "";
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "bg-[#c20001] text-white";
    if (rank === 2) return "bg-red-100 text-[#c20001]";
    if (rank === 3) return "bg-red-50 text-[#c20001]";
    return "bg-gray-100 text-gray-700";
  };

  const handlePeriodClick = (type) => {
    if (type === "custom") {
      // ekhane future e real date range picker bosbe
      Swal.fire({
        title: "Custom period (coming soon)",
        html:
          '<p class="text-sm text-gray-700 mb-2">In production this will show a full date range picker.</p>' +
          `<p class="text-xs text-gray-500">Current: ${formatDate(
            customDateRange.from
          )} - ${formatDate(customDateRange.to)}</p>`,
        icon: "info",
        confirmButtonColor: "#c20001",
      });
    }
    setDateRangeType(type);
  };

  const handleViewDetail = () => {
    const listHtml = top5Technicians
      .map(
        (t, i) =>
          `<div style="margin-bottom:6px;font-size:13px;">
             <strong>${i + 1}. ${t.name}</strong> — ${
            t.completedJobs ?? 0
          } jobs, rating ${(t.averageRating ?? 0).toFixed(1)}★
           </div>`
      )
      .join("");

    Swal.fire({
      title: "Top 5 Technicians",
      html:
        '<div style="text-align:left;">' +
        `<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">
           Period: ${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}
         </div>` +
        listHtml +
        "</div>",
      icon: "info",
      width: 600,
      confirmButtonColor: "#c20001",
      confirmButtonText: "Close",
    });
  };

  const renderSparkline = (data) => {
    // backend ekhon kono trend data pathache na, tai empty hole kichu dakhabo na
    if (!data || !data.length) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1 || 1)) * 40;
        const y = 20 - ((value - min) / range) * 20;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg width="40" height="20" className="opacity-60">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#c20001]" />
            <h3 className="text-sm font-semibold text-[#c20001]">
              Top 5 Technicians
            </h3>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#c20001] bg-[#c20001] text-white">
            Admin only
          </span>
        </div>

        {/* Metric selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600">Metric:</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(METRICS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedMetric(key)}
                  className={
                    "text-xs px-3 py-1.5 rounded-full border transition-colors " +
                    (selectedMetric === key
                      ? "bg-[#c20001] border-[#c20001] text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="text-xs text-gray-600">Period:</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PERIODS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePeriodClick(key)}
                  className={
                    "text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 transition-colors " +
                    (dateRangeType === key
                      ? "bg-[#c20001] border-[#c20001] text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50")
                  }
                >
                  {key === "custom" && <CalendarIcon className="w-3 h-3" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {dateRangeType !== "custom" && (
            <p className="text-[11px] text-gray-500 mt-1">
              Showing performance for{" "}
              <span className="font-medium">
                {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-3 flex-1">
        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            Loading top technicians…
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 text-sm">{error}</div>
        ) : top5Technicians.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            No technician data available.
          </div>
        ) : (
          <div className="space-y-2">
            {top5Technicians.map((tech, index) => {
              const rank = index + 1;
              const initials = tech.name
                .split(" ")
                .map((n) => n[0])
                .join("");

              return (
                <div
                  key={tech.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <div
                    className={
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 " +
                      getRankColor(rank)
                    }
                  >
                    {rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#c20001] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    {initials}
                  </div>

                  {/* Name + specialization */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {tech.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {tech.specialization ||
                        (tech.type === "INTERNAL"
                          ? "Internal technician"
                          : tech.type === "FREELANCER"
                          ? "Freelancer"
                          : "Technician")}
                    </p>
                  </div>

                  {/* Metric */}
                  <div className="text-right text-xs shrink-0 mr-3">
                    <div className="text-[#c20001] font-semibold">
                      {getMetricValue(tech)}
                    </div>
                    <div className="text-gray-500">
                      {getMetricSubtext(tech)}
                    </div>
                  </div>

                  {/* Sparkline (optional – only if backend gives data) */}
                  <div className="text-[#c20001] shrink-0">
                    {renderSparkline(tech.trend)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {top5Technicians.length > 0 && !loading && !error && (
        <div className="px-5 pb-4 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleViewDetail}
            className="w-full text-xs font-medium px-3 py-2 border border-[#c20001] rounded-lg text-[#c20001] hover:bg-[#c20001] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            View Detail
          </button>
        </div>
      )}
    </div>
  );
}
