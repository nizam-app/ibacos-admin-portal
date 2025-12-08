import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Clock, TrendingUp, DollarSign, CheckCircle, Users, Download, ChevronDown, Table, FileText, Award, Filter } from "lucide-react";

// Mock Data
const MOCK_TECHNICIANS = [
  { id: 'TECH001', name: 'Mike Johnson', specialty: 'Electrical', employmentType: 'Freelancer', commissionRate: 10, activeWorkOrders: 3, completedJobs: 127, isBlocked: false },
  { id: 'TECH002', name: 'Sarah Davis', specialty: 'Plumbing', employmentType: 'Employee', bonusRate: 5, activeWorkOrders: 2, completedJobs: 95, isBlocked: false },
  { id: 'TECH003', name: 'Robert Chen', specialty: 'HVAC', employmentType: 'Freelancer', commissionRate: 12, activeWorkOrders: 4, completedJobs: 143, isBlocked: false },
];

const MOCK_WORK_ORDERS = [
  { id: 'WO0001', srId: 'SR-2024-0995', customerName: 'Ahmed Al-Mansoori', category: 'Electrical', priority: 'High', status: 'Completed', assignedTechnician: 'TECH001', scheduledDate: '2024-12-01', completionDate: '2024-12-01', paymentRecord: { paymentStatus: 'Verified', paymentProof: { amount: 450 } } },
  { id: 'WO0002', srId: 'SR-2024-0996', customerName: 'Fatima Hassan', category: 'Plumbing', priority: 'Medium', status: 'Completed', assignedTechnician: 'TECH002', scheduledDate: '2024-12-02', completionDate: '2024-12-02', paymentRecord: { paymentStatus: 'Verified', paymentProof: { amount: 280 } } },
  { id: 'WO0003', srId: 'SR-2024-0997', customerName: 'Mohammed Khalil', category: 'HVAC', priority: 'High', status: 'In Progress', assignedTechnician: 'TECH003', scheduledDate: '2024-12-03' },
];

// Format currency
const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

export default function ReportsModuleEnhanced() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const workOrders = MOCK_WORK_ORDERS;
  const technicians = MOCK_TECHNICIANS;

  const completedWorkOrders = workOrders.filter(wo => wo.status === "Completed");
  const verifiedPayments = completedWorkOrders.filter(wo => wo.paymentRecord?.paymentStatus === "Verified");
  const pendingPayments = completedWorkOrders.filter(wo => wo.paymentRecord?.paymentStatus !== "Verified").length;

  const totalEarnings = verifiedPayments.reduce((sum, wo) => sum + (wo.paymentRecord?.paymentProof?.amount || 0), 0);

  const statusCounts = {
    all: workOrders.length,
    Pending: workOrders.filter(wo => wo.status === "Pending").length,
    Assigned: workOrders.filter(wo => wo.status === "Assigned").length,
    "In Progress": workOrders.filter(wo => wo.status === "In Progress").length,
    Completed: completedWorkOrders.length,
  };

  const filteredWorkOrders = selectedStatus === "all" ? workOrders : workOrders.filter(wo => wo.status === selectedStatus);

  const handleExport = (reportType) => {
    Swal.fire("Export", `Exporting ${reportType} report...`, "info");
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Reports & Analytics</h2>
          <p className="text-gray-600 text-sm">Comprehensive business insights and performance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => Swal.fire("Refresh", "Refreshing data...", "success")}
            className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => handleExport("work-orders")}
            className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 text-sm"
          >
            <Download className="w-4 h-4" />
            Export Reports
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded">
          <p className="text-gray-600 text-sm">Completed Jobs</p>
          <p className="text-2xl font-bold">{completedWorkOrders.length}</p>
          <p className="text-xs text-gray-500">of {workOrders.length} total</p>
        </div>
        <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
          <p className="text-xs text-gray-500">{verifiedPayments.length} verified</p>
        </div>
        <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded">
          <p className="text-gray-600 text-sm">Pending Payments</p>
          <p className="text-2xl font-bold">{pendingPayments}</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              selectedStatus === status ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {status === "all" ? "All Work Orders" : status} ({count})
          </button>
        ))}
      </div>

      {/* Work Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">WO ID</th>
              <th className="py-2 px-4 text-left">Customer</th>
              <th className="py-2 px-4 text-left">Technician</th>
              <th className="py-2 px-4 text-left">Category</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-right">Amount</th>
              <th className="py-2 px-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkOrders.map(wo => {
              const tech = technicians.find(t => t.id === wo.assignedTechnician);
              return (
                <tr key={wo.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{wo.id}</td>
                  <td className="py-2 px-4">{wo.customerName}</td>
                  <td className="py-2 px-4">{tech?.name || "Unassigned"}</td>
                  <td className="py-2 px-4">{wo.category}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      wo.status === "Completed" ? "bg-green-100 text-green-800" :
                      wo.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-700"
                    }`}>{wo.status}</span>
                  </td>
                  <td className="py-2 px-4 text-right">{formatCurrency(wo.paymentRecord?.paymentProof?.amount || 0)}</td>
                  <td className="py-2 px-4">{wo.scheduledDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
