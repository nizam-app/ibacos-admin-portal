// src/components/admin/Top5TechniciansWidget.jsx
import React, { useState, useMemo } from 'react';
import { Award, Calendar as CalendarIcon, Star, TrendingUp } from 'lucide-react';
import Swal from 'sweetalert2';

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
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

// ------- mock data -------
const mockTechnicians = [
  {
    id: 'TECH001',
    name: 'Robert Chen',
    specialty: 'HVAC',
    completedJobs: 143,
    totalJobs: 150,
    cancelledJobs: 7,
    avgRating: 4.9,
    totalReviews: 112,
    jobsPerDay: 4.5,
    completionRate: 95,
    cancelRate: 5,
    trend: [10, 12, 11, 13, 12, 14, 15],
  },
  {
    id: 'TECH002',
    name: 'Mike Johnson',
    specialty: 'Electrical',
    completedJobs: 127,
    totalJobs: 135,
    cancelledJobs: 8,
    avgRating: 4.8,
    totalReviews: 98,
    jobsPerDay: 4.1,
    completionRate: 94,
    cancelRate: 6,
    trend: [8, 9, 11, 10, 11, 12, 13],
  },
  {
    id: 'TECH003',
    name: 'James Wilson',
    specialty: 'Electrical',
    completedJobs: 112,
    totalJobs: 120,
    cancelledJobs: 8,
    avgRating: 4.7,
    totalReviews: 86,
    jobsPerDay: 3.7,
    completionRate: 93,
    cancelRate: 7,
    trend: [7, 8, 9, 9, 10, 10, 11],
  },
  {
    id: 'TECH004',
    name: 'Sarah Davis',
    specialty: 'Plumbing',
    completedJobs: 95,
    totalJobs: 102,
    cancelledJobs: 7,
    avgRating: 4.6,
    totalReviews: 73,
    jobsPerDay: 3.1,
    completionRate: 93,
    cancelRate: 7,
    trend: [5, 6, 7, 8, 8, 9, 9],
  },
  {
    id: 'TECH005',
    name: 'Emily Brown',
    specialty: 'Plumbing',
    completedJobs: 89,
    totalJobs: 96,
    cancelledJobs: 7,
    avgRating: 4.4,
    totalReviews: 60,
    jobsPerDay: 2.9,
    completionRate: 93,
    cancelRate: 7,
    trend: [4, 5, 6, 6, 7, 7, 8],
  },
];

const METRICS = {
  completedJobs: 'Completed Jobs',
  productivity: 'Productivity',
  rating: 'Customer Rating',
};

const PERIODS = {
  '7d': '7 Days',
  '30d': '30 Days',
  thisMonth: 'This Month',
  custom: 'Custom',
};

export function Top5TechniciansWidget({ technicians = mockTechnicians }) {
  const [selectedMetric, setSelectedMetric] = useState('completedJobs');
  const [dateRangeType, setDateRangeType] = useState('thisMonth');
  const [customDateRange, setCustomDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // date range (mock – data actually not filtered)
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (dateRangeType) {
      case '7d':
        return { from: subDays(now, 7), to: now };
      case '30d':
        return { from: subDays(now, 30), to: now };
      case 'thisMonth':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'custom':
        return customDateRange;
      default:
        return { from: startOfMonth(now), to: endOfMonth(now) };
    }
  }, [dateRangeType, customDateRange]);

  // top 5
  const top5Technicians = useMemo(() => {
    const sorted = [...technicians].sort((a, b) => {
      if (selectedMetric === 'completedJobs') return b.completedJobs - a.completedJobs;
      if (selectedMetric === 'productivity') return b.jobsPerDay - a.jobsPerDay;
      if (selectedMetric === 'rating') return b.avgRating - a.avgRating;
      return 0;
    });
    return sorted.slice(0, 5);
  }, [technicians, selectedMetric]);

  const getMetricValue = (tech) => {
    if (selectedMetric === 'completedJobs') return `${tech.completedJobs} jobs`;
    if (selectedMetric === 'productivity') return `${tech.jobsPerDay.toFixed(1)} jobs/day`;
    if (selectedMetric === 'rating') {
      return (
        <span className="flex items-center gap-1">
          {tech.avgRating.toFixed(2)}
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        </span>
      );
    }
    return null;
  };

  const getMetricSubtext = (tech) => {
    if (selectedMetric === 'completedJobs') {
      return `${tech.completionRate.toFixed(0)}% completion rate`;
    }
    if (selectedMetric === 'productivity') {
      return `${tech.cancelRate.toFixed(1)}% cancel rate`;
    }
    if (selectedMetric === 'rating') {
      return `${tech.totalReviews} reviews`;
    }
    return '';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-[#c20001] text-white';
    if (rank === 2) return 'bg-red-100 text-[#c20001]';
    if (rank === 3) return 'bg-red-50 text-[#c20001]';
    return 'bg-gray-100 text-gray-700';
  };

  const handlePeriodClick = (type) => {
    setDateRangeType(type);
    if (type === 'custom') {
      // SweetAlert based custom range picker (simple)
      Swal.fire({
        title: 'Custom period (mock)',
        html:
          '<p class="text-sm text-gray-700 mb-2">In production this will show a full date range picker.</p>' +
          `<p class="text-xs text-gray-500">Current: ${formatDate(customDateRange.from)} - ${formatDate(
            customDateRange.to,
          )}</p>`,
        icon: 'info',
        confirmButtonColor: '#c20001',
      });
    }
  };

  const handleViewDetail = () => {
    const listHtml = top5Technicians
      .map(
        (t, i) =>
          `<div style="margin-bottom:6px;font-size:13px;">
             <strong>${i + 1}. ${t.name}</strong> — ${t.completedJobs} jobs, 
             rating ${t.avgRating.toFixed(1)}★
           </div>`,
      )
      .join('');

    Swal.fire({
      title: 'Top 5 Technicians (Mock)',
      html:
        '<div style="text-align:left;">' +
        `<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">
           Period: ${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}
         </div>` +
        listHtml +
        '</div>',
      icon: 'info',
      width: 600,
      confirmButtonColor: '#c20001',
      confirmButtonText: 'Close',
    });
  };

  const renderSparkline = (data) => {
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
      .join(' ');

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
            <h3 className="text-sm font-semibold text-[#c20001]">Top 5 Technicians</h3>
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
                    'text-xs px-3 py-1.5 rounded-full border transition-colors ' +
                    (selectedMetric === key
                      ? 'bg-[#c20001] border-[#c20001] text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
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
                    'text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 transition-colors ' +
                    (dateRangeType === key
                      ? 'bg-[#c20001] border-[#c20001] text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
                  }
                >
                  {key === 'custom' && <CalendarIcon className="w-3 h-3" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {dateRangeType !== 'custom' && (
            <p className="text-[11px] text-gray-500 mt-1">
              Showing performance for{' '}
              <span className="font-medium">
                {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-3 flex-1">
        {top5Technicians.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            No technician data available.
          </div>
        ) : (
          <div className="space-y-2">
            {top5Technicians.map((tech, index) => {
              const rank = index + 1;
              const initials = tech.name
                .split(' ')
                .map((n) => n[0])
                .join('');

              return (
                <div
                  key={tech.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <div
                    className={
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ' +
                      getRankColor(rank)
                    }
                  >
                    {rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#c20001] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    {initials}
                  </div>

                  {/* Name + specialty */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{tech.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{tech.specialty}</p>
                  </div>

                  {/* Metric */}
                  <div className="text-right text-xs shrink-0 mr-3">
                    <div className="text-[#c20001] font-semibold">{getMetricValue(tech)}</div>
                    <div className="text-gray-500">{getMetricSubtext(tech)}</div>
                  </div>

                  {/* Sparkline */}
                  <div className="text-[#c20001] shrink-0">{renderSparkline(tech.trend)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {top5Technicians.length > 0 && (
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
