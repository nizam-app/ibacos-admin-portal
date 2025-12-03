import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  RefreshCw,
  XCircle,
  Search,
  DollarSign,
} from "lucide-react";

import WorkOrderActionsModal from "./WorkOrderActionsModal";
import PaymentVerificationModal from "./PaymentVerificationModal";

/* ------------------------------------------------------------------
   MOCK DATA
-------------------------------------------------------------------*/

const MOCK_TECHNICIANS = [
  {
    id: "TECH001",
    name: "Mike Johnson",
    specialty: "Electrical",
    type: "Freelancer",
    commissionRate: 10,
    distance: 2.3,
    status: "Available",
    openJobs: [],
  },
  {
    id: "TECH002",
    name: "Sarah Davis",
    specialty: "Plumbing",
    type: "Internal Employee",
    bonusRate: 5,
    distance: 4.7,
    status: "Busy",
    openJobs: [
      {
        woId: "WO0008",
        status: "In Progress",
        scheduledDate: "2024-12-01",
        scheduledTime: "11:00",
      },
      {
        woId: "WO0012",
        status: "Assigned",
        scheduledDate: "2024-12-01",
        scheduledTime: "15:30",
      },
    ],
  },
  {
    id: "TECH003",
    name: "Robert Chen",
    specialty: "HVAC",
    type: "Freelancer",
    commissionRate: 12,
    distance: 6.1,
    status: "Busy",
    openJobs: [
      {
        woId: "WO0010",
        status: "In Progress",
        scheduledDate: "2024-12-01",
        scheduledTime: "10:00",
      },
    ],
  },
  {
    id: "TECH004",
    name: "Lisa Martinez",
    specialty: "General",
    type: "Internal Employee",
    bonusRate: 6,
    distance: 8.2,
    status: "Available",
    openJobs: [],
  },
];

const MOCK_WORK_ORDERS = [
  {
    id: "WO0007",
    srId: "SR-1021",
    customerName: "Abdi Hassan",
    category: "Electrical – Lighting",
    status: "Pending",
    scheduledDate: "2024-12-01",
    scheduledTime: "10:30",
    assignedTechnician: null,
    estimatedDuration: "2",
    priority: "High",
    notes: "Customer prefers morning visit.",
    paymentRecord: null,
  },
  {
    id: "WO0008",
    srId: "SR-1022",
    customerName: "Maria Gomez",
    category: "Plumbing – Leak repair",
    status: "Assigned",
    scheduledDate: "2024-12-01",
    scheduledTime: "14:00",
    assignedTechnician: "TECH002",
    estimatedDuration: "3",
    priority: "Medium",
    notes: "",
    paymentRecord: null,
  },
  {
    id: "WO0009",
    srId: "SR-1023",
    customerName: "John Smith",
    category: "HVAC – AC service",
    status: "In Progress",
    scheduledDate: "2024-11-30",
    scheduledTime: "16:30",
    assignedTechnician: "TECH003",
    estimatedDuration: "4",
    priority: "High",
    notes: "Urgent – AC not cooling.",
    paymentRecord: null,
  },
  {
    id: "WO0010",
    srId: "SR-1024",
    customerName: "Amina Ali",
    category: "General – Inspection",
    status: "Completed",
    scheduledDate: "2024-11-29",
    scheduledTime: "09:30",
    assignedTechnician: "TECH001",
    estimatedDuration: "1",
    priority: "Low",
    notes: "",
    paymentRecord: {
      paymentStatus: "Proof Uploaded",
      paymentProof: {
        uploadedBy: "Mike Johnson",
        uploadDate: "2024-11-29",
        paymentMethod: "Cash",
        amount: 120,
        proofImageUrl:
          "https://via.placeholder.com/600x400.png?text=Payment+Receipt",
        notes: "Customer paid full amount in cash.",
      },
      commissionAmount: null,
      commissionBooked: false,
      commissionPaid: false,
      commissionBookedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      rejectionReason: null,
    },
  },
  {
    id: "WO0011",
    srId: "SR-1025",
    customerName: "Karim Hussein",
    category: "Electrical – Socket",
    status: "Completed",
    scheduledDate: "2024-11-28",
    scheduledTime: "13:00",
    assignedTechnician: "TECH004",
    estimatedDuration: "2",
    priority: "Medium",
    notes: "",
    paymentRecord: {
      paymentStatus: "Verified",
      paymentProof: {
        uploadedBy: "Lisa Martinez",
        uploadDate: "2024-11-28",
        paymentMethod: "Mobile Money",
        amount: 80,
        proofImageUrl:
          "https://via.placeholder.com/600x400.png?text=MoMo+Screenshot",
        notes: "",
      },
      commissionAmount: 8,
      commissionBooked: true,
      commissionPaid: false,
      commissionBookedDate: "2024-11-28",
      verifiedBy: "Finance Admin",
      verifiedDate: "2024-11-28",
      rejectionReason: null,
    },
  },
];

/* ------------------------------------------------------------------
   SMALL UI HELPERS
-------------------------------------------------------------------*/

const Badge = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

/* ------------------------------------------------------------------
   MAIN PAGE – DISPATCHER WORK ORDERS
-------------------------------------------------------------------*/

export default function DispatcherWorkOrders() {
  const [workOrders, setWorkOrders] = useState(MOCK_WORK_ORDERS);
  const [technicians] = useState(MOCK_TECHNICIANS);
  const [blockedTechnicians] = useState(["TECH005"]); // example

  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [currentAction, setCurrentAction] = useState(null); // 'assign' | 'reassign' | 'reschedule' | 'cancel' | 'verifyPayment'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const technicianNameMap = technicians.reduce((acc, t) => {
    acc[t.id] = t.name;
    return acc;
  }, {});

  const getTechnicianName = (id) => {
    if (!id) return "";
    return technicianNameMap[id] || id;
  };

  /* ------------ Helpers ------------- */

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterWorkOrders = (status) => {
    let list = [...workOrders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (wo) =>
          wo.id.toLowerCase().includes(q) ||
          wo.customerName.toLowerCase().includes(q)
      );
    }

    if (status && status !== "all") {
      list = list.filter(
        (wo) => wo.status.toLowerCase() === status.toLowerCase()
      );
    }

    return list;
  };

  const getPaymentStatusLabel = (wo) => {
    if (wo.status !== "Completed") return null;
    if (!wo.paymentRecord) return "Pending Payment";

    switch (wo.paymentRecord.paymentStatus) {
      case "Verified":
        return "Paid Verified";
      case "Rejected":
        return "Rejected";
      case "Proof Uploaded":
      case "Pending":
      default:
        return "Pending Payment";
    }
  };

  /* ------------ Action handlers ------------- */

  const openAction = (wo, action) => {
    setSelectedWorkOrder(wo);
    setCurrentAction(action);
  };

  const closeModals = () => {
    setSelectedWorkOrder(null);
    setCurrentAction(null);
  };

  const handleWorkOrderAction = (workOrderId, action, data) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;

        if (action === "cancel") {
          return { ...wo, status: "Cancelled", notes: data.reason };
        }

        const updated = {
          ...wo,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          estimatedDuration: data.estimatedDuration,
          notes: data.notes,
        };

        if (action === "assign") {
          updated.assignedTechnician = data.assignedTechnician;
          updated.status = "Assigned";
        }
        if (action === "reassign") {
          updated.assignedTechnician = data.assignedTechnician;
        }
        if (action === "reschedule") {
          // keep current status
        }

        return updated;
      })
    );

    Swal.fire({
      icon: "success",
      title:
        action === "cancel"
          ? "Work order cancelled"
          : action === "reschedule"
          ? "Schedule updated"
          : "Work order updated",
      confirmButtonColor: "#c20001",
    });

    closeModals();
  };

  const handleVerifyPayment = (workOrderId, commissionAmount) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;
        if (!wo.paymentRecord) return wo;

        return {
          ...wo,
          paymentRecord: {
            ...wo.paymentRecord,
            paymentStatus: "Verified",
            commissionAmount,
            commissionBooked: true,
            commissionBookedDate: new Date().toISOString().split("T")[0],
          },
        };
      })
    );

    Swal.fire({
      icon: "success",
      title: "Payment verified",
      text: "Commission has been booked.",
      confirmButtonColor: "#c20001",
    });

    closeModals();
  };

  const handleRejectPayment = (reason) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== selectedWorkOrder.id) return wo;
        if (!wo.paymentRecord) return wo;

        return {
          ...wo,
          paymentRecord: {
            ...wo.paymentRecord,
            paymentStatus: "Rejected",
            rejectionReason: reason,
          },
        };
      })
    );

    Swal.fire({
      icon: "info",
      title: "Payment rejected",
      confirmButtonColor: "#c20001",
    });

    closeModals();
  };

  /* ------------ Render ------------- */

  const renderWorkOrders = (list) => {
    if (!list.length) {
      return (
        <div className="py-12 text-center text-gray-500">
          No work orders found
          {searchQuery ? " matching your search." : " in this category."}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((wo) => (
          <div
            key={wo.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50"
          >
            {/* Top row */}
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-[#c20001]">
                  {wo.id}
                </h3>
                <p className="text-xs text-gray-600">SR: {wo.srId}</p>
              </div>
              <Badge className={getPriorityColor(wo.priority)}>
                {wo.priority} Priority
              </Badge>
            </div>

            {/* Customer / category */}
            <div className="mb-3 grid grid-cols-1 gap-3 text-sm text-gray-900 md:grid-cols-2">
              <div>
                <p className="text-xs text-gray-600">Customer</p>
                <p>{wo.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Category</p>
                <p>{wo.category}</p>
              </div>
            </div>

            {/* Meta line */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{wo.scheduledDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{wo.scheduledTime}</span>
              </div>
              {wo.assignedTechnician ? (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{getTechnicianName(wo.assignedTechnician)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600">
                  <User className="h-4 w-4" />
                  <span>Unassigned</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{wo.estimatedDuration}h duration</span>
              </div>
            </div>

            {/* Notes */}
            {wo.notes && (
              <div className="mt-3 border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-600">Notes</p>
                <p className="text-sm text-gray-700">{wo.notes}</p>
              </div>
            )}

            {/* Footer */}
            {wo.status !== "Cancelled" && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Left: payment status + action icons */}
                  <div className="flex items-center gap-2">
                    {/* Payment badge for completed */}
                    {wo.status === "Completed" && (() => {
                      const label = getPaymentStatusLabel(wo);
                      if (label === "Paid Verified") {
                        return (
                          <Badge className="bg-green-100 text-green-800">
                            <DollarSign className="mr-1 h-3 w-3" />
                            Paid Verified
                          </Badge>
                        );
                      }
                      if (wo.paymentRecord?.paymentStatus === "Rejected") {
                        return (
                          <div className="group relative inline-flex">
                            <Badge className="cursor-help bg-red-100 text-red-800">
                              <DollarSign className="mr-1 h-3 w-3" />
                              Payment Rejected
                            </Badge>
                            {wo.paymentRecord.rejectionReason && (
                              <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden max-w-xs whitespace-nowrap rounded bg-gray-900 px-3 py-2 text-xs text-white group-hover:block">
                                {wo.paymentRecord.rejectionReason}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <DollarSign className="mr-1 h-3 w-3" />
                          Pending Payment
                        </Badge>
                      );
                    })()}

                    {/* Dispatcher actions (non-completed) */}
                    {wo.status !== "Completed" && (
                      <div className="flex gap-1">
                        {(wo.status === "Pending" ||
                          wo.status === "Assigned") && (
                          <div className="group relative">
                            <button
                              type="button"
                              onClick={() =>
                                openAction(
                                  wo,
                                  wo.status === "Pending"
                                    ? "assign"
                                    : "reassign"
                                )
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-xs text-gray-700 transition hover:bg-gray-100"
                            >
                              {wo.status === "Pending" ? (
                                <UserCheck className="h-4 w-4" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </button>
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                              {wo.status === "Pending"
                                ? "Assign Technician"
                                : "Reassign"}
                            </div>
                          </div>
                        )}

                        {(wo.status === "Pending" ||
                          wo.status === "Assigned" ||
                          wo.status === "In Progress") && (
                          <div className="group relative">
                            <button
                              type="button"
                              onClick={() => openAction(wo, "reschedule")}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-xs text-gray-700 transition hover:bg-gray-100"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                              Reschedule
                            </div>
                          </div>
                        )}

                        {(wo.status === "Pending" ||
                          wo.status === "Assigned") && (
                          <div className="group relative">
                            <button
                              type="button"
                              onClick={() => openAction(wo, "cancel")}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-600 bg-white text-xs text-red-600 transition hover:bg-red-600 hover:text-white"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                              Cancel
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: payment call-to-action */}
                  {wo.status === "Completed" && (() => {
                    const status = wo.paymentRecord?.paymentStatus;

                    if (status === "Proof Uploaded") {
                      return (
                        <button
                          type="button"
                          onClick={() => openAction(wo, "verifyPayment")}
                          className="rounded-[10px] bg-[#c20001] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#c20001]/90"
                        >
                          Verify Payment
                        </button>
                      );
                    }

                    if (status === "Verified") {
                      return (
                        <span className="text-sm text-gray-500">
                          Paid Verified
                        </span>
                      );
                    }

                    if (status === "Rejected") {
                      return (
                        <button
                          type="button"
                          onClick={() => openAction(wo, "verifyPayment")}
                          className="rounded-[10px] border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                        >
                          View Details
                        </button>
                      );
                    }

                    return (
                      <button
                        type="button"
                        className="text-sm font-medium text-[#c20001] hover:underline"
                        onClick={() => {
                          Swal.fire({
                            icon: "success",
                            title: "Request sent",
                            text: "Request sent to technician to upload payment proof.",
                            confirmButtonColor: "#c20001",
                          });
                        }}
                      >
                        Request Proof
                      </button>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const listForActiveTab =
    activeTab === "all"
      ? filterWorkOrders("all")
      : filterWorkOrders(activeTab);

  return (
    <div className="p-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 pb-6 pt-6">
          {workOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>No work orders have been created yet.</p>
              <p className="mt-2 text-sm">
                Convert a service request to create your first work order.
              </p>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    placeholder="Search by WO ID or Customer…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="w-full">
                <div className="grid w-full grid-cols-6 rounded-lg bg-gray-100 p-1 text-xs font-medium text-gray-700">
                  {[
                    { key: "all", label: "All", count: workOrders.length },
                    {
                      key: "pending",
                      label: "Pending",
                      count: filterWorkOrders("pending").length,
                    },
                    {
                      key: "assigned",
                      label: "Assigned",
                      count: filterWorkOrders("assigned").length,
                    },
                    {
                      key: "in progress",
                      label: "In Progress",
                      count: filterWorkOrders("in progress").length,
                    },
                    {
                      key: "completed",
                      label: "Completed",
                      count: filterWorkOrders("completed").length,
                    },
                    {
                      key: "cancelled",
                      label: "Cancelled",
                      count: filterWorkOrders("cancelled").length,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs transition ${
                        activeTab === tab.key
                          ? "bg-white text-[#c20001] shadow-sm"
                          : "bg-transparent text-gray-700 hover:bg-white"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                <div className="mt-6">{renderWorkOrders(listForActiveTab)}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedWorkOrder &&
        currentAction &&
        ["assign", "reassign", "reschedule", "cancel"].includes(
          currentAction
        ) && (
          <WorkOrderActionsModal
            workOrder={selectedWorkOrder}
            action={currentAction}
            technicians={technicians}
            blockedTechnicians={blockedTechnicians}
            onClose={closeModals}
            onConfirm={handleWorkOrderAction}
          />
        )}

      {selectedWorkOrder &&
        currentAction === "verifyPayment" &&
        selectedWorkOrder.paymentRecord && (
          <PaymentVerificationModal
            isOpen={true}
            onClose={closeModals}
            workOrderId={selectedWorkOrder.id}
            customerName={selectedWorkOrder.customerName}
            technicianName={getTechnicianName(
              selectedWorkOrder.assignedTechnician
            )}
            technicianType={
              technicians.find(
                (t) => t.id === selectedWorkOrder.assignedTechnician
              )?.type
            }
            technicianRate={
              technicians.find(
                (t) => t.id === selectedWorkOrder.assignedTechnician
              )?.commissionRate || 10
            }
            paymentRecord={selectedWorkOrder.paymentRecord}
            onVerify={(amount) =>
              handleVerifyPayment(selectedWorkOrder.id, amount)
            }
            onReject={handleRejectPayment}
          />
        )}
    </div>
  );
}
