// src/pages/administrator/AdminReportsPage.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  CheckCircle2,
  DollarSign,
  Clock3,
  Users,
  Download,
} from "lucide-react";

// Simple Tailwind helpers (no external ../ui/* import)
const Card = ({ className = "", children }) => (
  <div className={"bg-white rounded-xl border border-gray-200 shadow-sm " + className}>
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

// Simple currency formatter (mock version of formatCurrency)
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

// ---------------- Mock data (work orders + technicians) ----------------

const mockTechnicians = [
  {
    id: "TECH001",
    name: "Mike Johnson",
    specialty: "AC Service",
    employmentType: "Freelancer",
  },
  {
    id: "TECH002",
    name: "Sarah Davis",
    specialty: "Plumbing",
    employmentType: "Employee",
  },
  {
    id: "TECH003",
    name: "John Smith",
    specialty: "Electrical",
    employmentType: "Freelancer",
  },
];

const mockWorkOrders = [
  {
    id: "WO-2025-001",
    customerName: "Ahmed Hassan",
    category: "AC Service",
    status: "Completed",
    scheduledDate: "2025-11-05",
    assignedTechnician: "TECH001",
    paymentRecord: {
      paymentStatus: "Verified",
      paymentProof: { amount: 500 },
      commissionAmount: 50,
    },
  },
  {
    id: "WO-2025-002",
    customerName: "Fatima Ali",
    category: "Plumbing",
    status: "In Progress",
    scheduledDate: "2025-11-06",
    assignedTechnician: "TECH002",
    paymentRecord: {
      paymentStatus: "Pending",
      paymentProof: { amount: 300 },
      commissionAmount: 30,
    },
  },
  {
    id: "WO-2025-003",
    customerName: "Mohammed Khalid",
    category: "Electrical",
    status: "Completed",
    scheduledDate: "2025-11-06",
    assignedTechnician: "TECH003",
    paymentRecord: {
      paymentStatus: "Verified",
      paymentProof: { amount: 400 },
      commissionAmount: 40,
    },
  },
  {
    id: "WO-2025-004",
    customerName: "Sara Ahmed",
    category: "Carpentry",
    status: "Assigned",
    scheduledDate: "2025-11-07",
    assignedTechnician: "TECH001",
    paymentRecord: {
      paymentStatus: "Pending",
      paymentProof: { amount: 250 },
      commissionAmount: 25,
    },
  },
  {
    id: "WO-2025-005",
    customerName: "Omar Ali",
    category: "AC Service",
    status: "Pending",
    scheduledDate: "2025-11-08",
    assignedTechnician: null,
    paymentRecord: null,
  },
];

// ---------------- Main Reports Page ----------------

const AdminReportsPage = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");

  const workOrders = mockWorkOrders;
  const technicians = mockTechnicians;

  // metrics
  const completedWorkOrders = workOrders.filter(
    (wo) => wo.status === "Completed"
  );
  const verifiedPayments = completedWorkOrders.filter(
    (wo) => wo.paymentRecord?.paymentStatus === "Verified"
  );

  const totalEarnings = verifiedPayments.reduce((sum, wo) => {
    return sum + (wo.paymentRecord?.paymentProof?.amount || 0);
  }, 0);

  const pendingPayments = completedWorkOrders.filter(
    (wo) => wo.paymentRecord?.paymentStatus !== "Verified"
  ).length;

  const totalPayouts = verifiedPayments.reduce((sum, wo) => {
    return sum + (wo.paymentRecord?.commissionAmount || 0);
  }, 0);

  // filter by status
  const filteredWorkOrders =
    selectedStatus === "all"
      ? workOrders
      : workOrders.filter((wo) => wo.status === selectedStatus);

  // status counts
  const statusCounts = {
    all: workOrders.length,
    Pending: workOrders.filter((wo) => wo.status === "Pending").length,
    Assigned: workOrders.filter((wo) => wo.status === "Assigned").length,
    "In Progress": workOrders.filter(
      (wo) => wo.status === "In Progress"
    ).length,
    Completed: workOrders.filter((wo) => wo.status === "Completed").length,
  };

  const handleExport = () => {
    // mock export
    Swal.fire({
      icon: "info",
      title: "Export ready",
      text: "Mock export generated. Connect backend to download real report.",
      confirmButtonColor: "#c20001",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-600 mt-1">
            Business insights and technician performance analytics
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Jobs</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {completedWorkOrders.length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {formatCurrency(totalEarnings)}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-green-50">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#ffb111]">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {pendingPayments}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#ffb111]/10">
                <Clock3 className="w-5 h-5 text-[#ffb111]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#c20001]">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payouts</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {formatCurrency(totalPayouts)}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#c20001]/10">
                <DollarSign className="w-5 h-5 text-[#c20001]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              selectedStatus === status
                ? "bg-[#c20001] text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:border-[#c20001]"
            }`}
          >
            {status === "all" ? "All Work Orders" : status}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                selectedStatus === status
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Work orders table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4">WO ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Technician</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-500"
                    >
                      No work orders found
                    </td>
                  </tr>
                ) : (
                  filteredWorkOrders.map((wo) => {
                    const tech = technicians.find(
                      (t) => t.id === wo.assignedTechnician
                    );
                    return (
                      <tr
                        key={wo.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{wo.id}</td>
                        <td className="py-3 px-4">{wo.customerName}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#c20001]/10 flex items-center justify-center">
                              <Users className="w-4 h-4 text-[#c20001]" />
                            </div>
                            <span>{tech?.name || "Unassigned"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{wo.category}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              wo.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : wo.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : wo.status === "Assigned"
                                ? "bg-purple-100 text-purple-800"
                                : wo.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {wo.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(
                            wo.paymentRecord?.paymentProof?.amount || 0
                          )}
                        </td>
                        <td className="py-3 px-4">{wo.scheduledDate}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Technician summary */}
      <Card>
        <CardHeader>
          <CardTitle>Technician Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4">Technician</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-center py-3 px-4">Completed Jobs</th>
                  <th className="text-right py-3 px-4">Total Earned</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((tech) => {
                  const techWorkOrders = completedWorkOrders.filter(
                    (wo) => wo.assignedTechnician === tech.id
                  );
                  const techVerifiedPayments = techWorkOrders.filter(
                    (wo) => wo.paymentRecord?.paymentStatus === "Verified"
                  );
                  const earnings = techVerifiedPayments.reduce(
                    (sum, wo) =>
                      sum + (wo.paymentRecord?.commissionAmount || 0),
                    0
                  );

                  return (
                    <tr
                      key={tech.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#c20001]/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#c20001]" />
                          </div>
                          <div>
                            <div>{tech.name}</div>
                            <div className="text-xs text-gray-500">
                              {tech.specialty}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-white border border-gray-300 text-gray-700">
                          {tech.employmentType === "Freelancer"
                            ? "Freelancer"
                            : "Employee"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {techWorkOrders.length}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(earnings)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReportsPage;
