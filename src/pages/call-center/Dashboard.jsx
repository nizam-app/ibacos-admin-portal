// src/pages/call-center/Dashboard.jsx
import {
  FileText,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Timer,
} from "lucide-react";

const CallCenterDashboard = () => {
  // ---- Mock Data ----
  const summaryCards = [
    {
      title: "Total Service Requests",
      value: 12,
      subtitle: "All time SRs",
      valueClass: "text-[#c20001]", // red
      Icon: FileText,
      iconColor: "text-[#c20001]",
    },
    {
      title: "Pending",
      value: 6,
      subtitle: "Awaiting action",
      valueClass: "text-[#ffb111]", // yellow
      Icon: Clock3,
      iconColor: "text-[#ffb111]",
    },
    {
      title: "In Progress",
      value: 4,
      subtitle: "Being worked on",
      valueClass: "text-[#f97316]", // orange
      Icon: AlertTriangle,
      iconColor: "text-[#f97316]",
    },
    {
      title: "Resolved",
      value: 2,
      subtitle: "Completed SRs",
      valueClass: "text-[#16a34a]", // green
      Icon: CheckCircle2,
      iconColor: "text-[#16a34a]",
    },
  ];

  const todayStats = {
    openToday: 2,
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
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-[#c20001] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#a80000]">
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
            <p className={`text-2xl font-semibold mb-1 ${card.valueClass}`}>
              {card.value}
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
              {todayStats.openToday}
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

export default CallCenterDashboard;
