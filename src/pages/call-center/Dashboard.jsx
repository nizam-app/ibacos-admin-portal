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

  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    openToday: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- API: /sr ----
  useEffect(() => {
    const fetchSRs = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosClient.get("/sr");
        const data = res.data || []; // API theke asha SR array

        const total = data.length;
        console.log( "call center stats", data)

        // 👉 ei mapping ta pore backend final logic onujayi change korte parba
        const pendingStatuses = ["PENDING_APPROVAL"];
        const inProgressStatuses = [
          "CONVERTED_TO_WO",
          "IN_PROGRESS",
          "ASSIGNED",
          "UNASSIGNED",
          "COMPLETED_PENDING_PAYMENT",
        ];
        const resolvedStatuses = [
          "RESOLVED",
          "COMPLETED",
          "COMPLETED_PAID",
        ];

        let pending = 0;
        let inProgress = 0;
        let resolved = 0;
        let openToday = 0;

        const todayStr = new Date().toDateString();

        data.forEach((sr) => {
          const srStatus = sr.status;
          const woStatus = sr.woStatus;

          // Pending = NEW / OPEN / PENDING
          if (pendingStatuses.includes(srStatus)) {
            pending += 1;
          }

          // In progress = woStatus ba srStatus jokhon kaj cholche
          if (
            inProgressStatuses.includes(woStatus) ||
            inProgressStatuses.includes(srStatus)
          ) {
            inProgress += 1;
          }

          // Resolved = SR/WO completed types
          if (
            resolvedStatuses.includes(woStatus) ||
            resolvedStatuses.includes(srStatus)
          ) {
            resolved += 1;
          }

          // Aajker open SR (cancelled / resolved chara)
          const createdDate = new Date(sr.createdAt);
          const isToday = createdDate.toDateString() === todayStr;
          const isOpen = !["CANCELLED", "RESOLVED"].includes(srStatus);
          if (isToday && isOpen) {
            openToday += 1;
          }
        });

        setSummary({
          total,
          pending,
          inProgress,
          resolved,
          openToday,
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

    fetchSRs();
  }, []);

  // ---- Cards config (values now come from API) ----
  const summaryCards = [
    {
      title: "Total Service Requests",
      value: summary.total,
      subtitle: "All time SRs",
      valueClass: "text-[#c20001]",
      Icon: FileText,
      iconColor: "text-[#c20001]",
    },
    {
      title: "Pending",
      value: summary.pending,
      subtitle: "Awaiting action",
      valueClass: "text-[#ffb111]",
      Icon: Clock3,
      iconColor: "text-[#ffb111]",
    },
    {
      title: "In Progress",
      value: summary.inProgress,
      subtitle: "Being worked on",
      valueClass: "text-[#f97316]",
      Icon: AlertTriangle,
      iconColor: "text-[#f97316]",
    },
    {
      title: "Resolved",
      value: summary.resolved,
      subtitle: "Completed SRs",
      valueClass: "text-[#16a34a]",
      Icon: CheckCircle2,
      iconColor: "text-[#16a34a]",
    },
  ];


  console.log("summaryCards", summaryCards)
  const todayStats = {
    openToday: summary.openToday,
    // Backend jokhon avg dispatch time dibe, ekhane replace korbe
    avgDispatchTime: "1.2 hrs",
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
              Loading latest service requests...
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
            <p className="text-sm text-gray-500">{card.subtitle}</p>
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
              {todayStats.avgDispatchTime}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
