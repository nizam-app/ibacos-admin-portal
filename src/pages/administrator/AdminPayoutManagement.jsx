// src/pages/administrator/AdminPayoutManagement.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
// import CommissionsAPI from "../../api/commissionsApi";
import PayoutsAPI from "../../api/payoutsApi";

// --------------------------------------------------
// Small Tailwind UI helpers (Card, Button, Badge, etc.)
// --------------------------------------------------
const Card = ({ className = "", children }) => (
  <div
    className={
      "bg-white rounded-xl border border-gray-200 shadow-sm " + className
    }
  >
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

const CardDescription = ({ className = "", children }) => (
  <p className={"text-sm text-gray-500 " + className}>{children}</p>
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

const Input = ({ className = "", ...props }) => (
  <input
    className={
      "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001] " +
      className
    }
    {...props}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={
      "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c20001] " +
      className
    }
    {...props}
  />
);

const Label = ({ className = "", children }) => (
  <label className={"block text-xs font-medium text-gray-700 " + className}>
    {children}
  </label>
);

// Simple modal wrapper
const Modal = ({ open, onClose, children, maxWidth = "max-w-2xl" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[80vh] overflow-y-auto`}
      >
        <div className="flex justify-end p-3 border-b border-gray-100">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        </div>
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// Custom SVG icons
// --------------------------------------------------
const Wallet = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const Clock = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const DollarSign = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CheckCircle2 = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const XCircle = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AlertCircle = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const TrendingUp = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const DownloadIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const Plus = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const Eye = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

// --------------------------------------------------
// Main Page – AdminPayoutManagement
// --------------------------------------------------

const AdminPayoutManagement = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isBatchDetailsOpen, setIsBatchDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All"); // All | Commission | Bonus

  // --------- real data states (no mock) ----------
  const [pendingCommissions, setPendingCommissions] = useState([]);
  const [earlyPayoutRequests, setEarlyPayoutRequests] = useState([]);
  const [payoutBatches, setPayoutBatches] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);

  const [summary, setSummary] = useState(null); // /payouts/summary data

  const [payoutRequestsLoading, setPayoutRequestsLoading] = useState(false);
  const [payoutRequestsError, setPayoutRequestsError] = useState("");

  // ----------------- load payout requests ----------------
  useEffect(() => {
    const loadEarlyRequests = async () => {
      try {
        setPayoutRequestsLoading(true);
        setPayoutRequestsError("");

        const { data } = await PayoutsAPI.getEarlyRequests();

        const mapped =
          (data || []).map((item) => ({
            id: item.id,
            technicianId: item.technicianId,
            technicianName:
              item.technician ||
              (item.technicianId ? `Technician #${item.technicianId}` : "—"),
            phone: "", // backend এখন phone দেয় না, চাইলে পরে যোগ করতে পারো
            requestDate: item.requestedAt
              ? new Date(item.requestedAt).toLocaleDateString("en-US")
              : "",
            requestedAmount: item.amount ?? 0,
            // এই API commission IDs পাঠাচ্ছে না, তাই empty রাখলাম
            commissionIds: [],
            reason: item.reason || "",
            // এই endpoint সাধারণত শুধু pending list দেয়
            status: "PENDING",
            reviewedBy: null,
            reviewedDate: null,
            rejectionReason: null,
          })) || [];

        setEarlyPayoutRequests(mapped);
      } catch (err) {
        console.error("Failed to load early payout requests", err);
        setPayoutRequestsError(
          err?.response?.data?.message ||
          "Failed to load early payout requests from server."
        );
      } finally {
        setPayoutRequestsLoading(false);
      }
    };

    loadEarlyRequests();
  }, []);
  // Summary + pending + batches + history

  const loadPayoutDashboard = async () => {
    const [summaryRes, pendingRes, batchesRes, historyRes] = await Promise.all([
      PayoutsAPI.getSummary(),
      PayoutsAPI.getPendingCommissions(),
      PayoutsAPI.getBatches(),
      PayoutsAPI.getHistory(),
    ]);

    setSummary(summaryRes.data || null);

    const pendingSource = Array.isArray(pendingRes.data) ? pendingRes.data : [];
    setPendingCommissions(pendingSource.map((item) => ({
      id: item.id,
      workOrderId: item.workOrder,
      technicianName: item.technician,
      technicianId: item.technicianId,
      employmentType: "",
      type: item.type === "BONUS" ? "Bonus" : "Commission",
      serviceCategory: item.service,
      paymentAmount: item.payment ?? 0,
      rate: item.rate != null ? item.rate * 100 : 0,
      amount: item.amount ?? 0,
      paymentDate: item.date ? new Date(item.date).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric"
      }) : "",
    })));

    const batchesSource = Array.isArray(batchesRes.data) ? batchesRes.data : [];

    const batchesMapped = batchesSource.map((item) => {
      const apiStatus = String(item.status || "").toUpperCase();
      const uiStatus =
        apiStatus === "PENDING" ? "Pending"
          : apiStatus === "SCHEDULED" || apiStatus === "CONFIRMED" ? "Confirmed"
            : apiStatus === "PAID" || apiStatus === "COMPLETED" || apiStatus === "PROCESSED" ? "Paid"
              : "Pending";

      return {
        id: item.id,
        batchNumber: `Batch #${item.id}`,
        createdDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US") : "",
        payoutDate: item.scheduledFor
          ? new Date(item.scheduledFor).toLocaleDateString("en-US")
          : item.processedAt
            ? new Date(item.processedAt).toLocaleDateString("en-US")
            : "",
        totalAmount: item.totalAmount ?? 0,
        technicianCount: item.technicianCount ?? 1,
        commissionsCount: item.commissionsCount ?? 0,
        status: uiStatus,
        confirmedBy: item.createdBy || null,
        confirmedDate: item.scheduledFor ? new Date(item.scheduledFor).toLocaleDateString("en-US") : "",
        paidBy: null,
        paidDate: item.processedAt ? new Date(item.processedAt).toLocaleDateString("en-US") : "",
        payouts: [],
      };
    });

    setPayoutBatches(batchesMapped);

    const historySource = Array.isArray(historyRes.data) ? historyRes.data : [];
    setPayoutHistory(historySource.map((item) => ({
      id: item.id,
      payoutId: item.id,
      workOrderId: "—",
      technicianName: item.technician || (item.technicianId ? `Technician #${item.technicianId}` : "—"),
      type: "Commission",
      amount: item.totalAmount ?? 0,
      paymentDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US") : "",
      payoutDate: item.processedAt ? new Date(item.processedAt).toLocaleDateString("en-US") : "",
      batchNumber: "—",
      status: "Paid",
    })));
  };


  useEffect(() => {
    loadPayoutDashboard().catch((err) => console.error(err));
  }, []);





  // ----------------- helpers & stats ----------------
  const totalPendingAmount = pendingCommissions.reduce(
    (sum, c) => sum + c.amount,
    0
  );

  const totalPendingRequests = earlyPayoutRequests.filter(
    (r) => r.status === "PENDING"
  ).length;

  const totalEarlyPayoutAmount = earlyPayoutRequests
    .filter((r) => r.status === "PENDING")
    .reduce((sum, r) => sum + (r.requestedAmount || 0), 0);

  const totalPaidThisMonthAmount = payoutHistory.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const totalPaidThisMonthCount = payoutHistory.length;

  const summaryPendingAmount =
    summary?.pendingCommissions?.amount ?? totalPendingAmount;
  const summaryPendingCount =
    summary?.pendingCommissions?.count ?? pendingCommissions.length;

  const summaryEarlyRequestsCount =
    summary?.earlyPayoutRequests?.count ?? totalPendingRequests;
  const summaryEarlyRequestsAmount =
    summary?.earlyPayoutRequests?.amount ?? totalEarlyPayoutAmount;

  const summaryPaidAmount =
    summary?.totalPaidThisMonth?.amount ?? totalPaidThisMonthAmount;
  const summaryPaidCount =
    summary?.totalPaidThisMonth?.count ?? totalPaidThisMonthCount;

  const summaryNextPayoutDateText = summary?.nextPayoutDate
    ? new Date(summary.nextPayoutDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : getNextMonday();

  const summaryNextPayoutLabel = summary?.nextPayoutDay || "Weekly Monday";


  function getNextMonday() {
    const today = new Date();
    const daysUntilMonday = ((8 - today.getDay()) % 7) || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }


  const filteredPendingCommissions = pendingCommissions.filter((comm) => {
    const q = searchTerm.toLowerCase();
    const matchName =
      (comm.technicianName || "").toLowerCase().includes(q) ||
      (comm.workOrderId || "").toLowerCase().includes(q);

    const matchType =
      filterType === "All" ? true : comm.type === filterType;

    return matchName && matchType;
  });

  const statusLabel = (status) => {
    if (status === "PENDING") return "Pending";
    if (status === "APPROVED") return "Approved";
    if (status === "REJECTED") return "Rejected";
    return status || "";
  };

  // ----------------- actions ----------------
  const handleCreateBatch = async () => {
    try {
      const confirm = await Swal.fire({
        title: "Create weekly payout batch?",
        text: "This will include all pending commissions in a new payout batch.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, create batch",
      });

      if (!confirm.isConfirmed) return;

      const { data } = await PayoutsAPI.createBatch();

      Swal.fire(
        "Batch created",
        data?.message || "Weekly payout batch created successfully.",
        "success"
      );

      setIsCreateBatchOpen(false);

      // batch তৈরি হলে আবার dashboard reload করে নাও
      // তুমি উপরের loadPayoutDashboard ফাংশনটাকে বাইরে এনে এখানে call করতে পারো।
      // await loadPayoutDashboard();
    } catch (err) {
      console.error("Create payout batch failed", err);
      Swal.fire(
        "Error",
        err?.response?.data?.message ||
        "Failed to create payout batch. Please try again.",
        "error"
      );
    }
  };


  const handleConfirmBatch = async (batchId) => {
    try {
      const confirm = await Swal.fire({
        title: "Process payout batch?",
        text: "This will process the payout for this batch.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, process",
      });
      if (!confirm.isConfirmed) return;

      const { data } = await PayoutsAPI.processBatch(batchId);

      Swal.fire("Batch processed", data?.message || "Payout batch processed successfully.", "success");

      await loadPayoutDashboard(); // ✅ এইটা MUST
    } catch (err) {
      console.error("Process payout batch failed", err);
      Swal.fire("Error", err?.response?.data?.message || "Failed to process payout batch. Please try again.", "error");
    }
  };


  const handleMarkPaid = async (batchId) => {
    try {
      // First, collect payment information using SweetAlert2 form
      const result = await Swal.fire({
        title: "Mark batch as paid",
        html: `
          <div style="text-align: left;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Payment Reference *</label>
            <input id="paymentReference" class="swal2-input" placeholder="e.g. TXN123456" required>
            
            <label style="display: block; margin-top: 16px; margin-bottom: 8px; font-weight: 500; color: #374151;">Payment Method *</label>
            <select id="paymentMethod" class="swal2-select" style="display: block; width: 100%; padding: 8px; margin-bottom: 16px; border: 1px solid #d1d5db; border-radius: 4px;" required>
              <option value="">Select payment method</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Check">Check</option>
              <option value="Other">Other</option>
            </select>
            
            <label style="display: block; margin-top: 16px; margin-bottom: 8px; font-weight: 500; color: #374151;">Notes</label>
            <textarea id="notes" class="swal2-textarea" placeholder="e.g. Paid via company account" style="min-height: 80px;"></textarea>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Mark as Paid",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#c20001",
        cancelButtonColor: "#6b7280",
        preConfirm: () => {
          const paymentReference = document.getElementById("paymentReference").value.trim();
          const paymentMethod = document.getElementById("paymentMethod").value;
          const notes = document.getElementById("notes").value.trim();

          if (!paymentReference) {
            Swal.showValidationMessage("Payment reference is required");
            return false;
          }
          if (!paymentMethod) {
            Swal.showValidationMessage("Payment method is required");
            return false;
          }

          return {
            paymentReference,
            paymentMethod,
            notes: notes || "",
          };
        },
      });

      if (!result.isConfirmed || !result.value) return;

      const payload = result.value;

      // Call the API with payment details
      const { data } = await PayoutsAPI.markPaid(batchId, payload);

      Swal.fire({
        icon: "success",
        title: "Paid",
        text: data?.message || "Batch marked as paid successfully.",
        confirmButtonColor: "#c20001",
      });

      await loadPayoutDashboard();
    } catch (err) {
      console.error("Mark paid failed", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to mark batch as paid. Please try again.",
        confirmButtonColor: "#c20001",
      });
    }
  };



  const openReviewRequest = (request) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setIsReviewOpen(true);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    try {
      const confirm = await Swal.fire({
        title: "Approve payout request?",
        text: "This will mark the request as APPROVED.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, approve",
      });

      if (!confirm.isConfirmed) return;

      // নতুন API call
      await PayoutsAPI.approveEarlyRequest(
        selectedRequest.id,
        "Approved for early payout"
      );

      // Local state update
      setEarlyPayoutRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
              ...r,
              status: "APPROVED",
              reviewedBy: "Admin User",
              reviewedDate: new Date().toLocaleDateString("en-US"),
            }
            : r
        )
      );

      setIsReviewOpen(false);
      Swal.fire(
        "Approved",
        `$${(selectedRequest.requestedAmount || 0).toFixed(
          2
        )} approved for ${selectedRequest.technicianName}`,
        "success"
      );
    } catch (err) {
      console.error("Approve payout request failed", err);
      Swal.fire(
        "Error",
        err?.response?.data?.message ||
        "Failed to approve payout request. Please try again.",
        "error"
      );
    }
  };


  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      Swal.fire("Required", "Please enter a rejection reason", "error");
      return;
    }

    try {
      const confirm = await Swal.fire({
        title: "Reject payout request?",
        text: "This will mark the request as REJECTED.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, reject",
      });

      if (!confirm.isConfirmed) return;

      const reasonText = rejectionReason.trim();

      // নতুন API call
      await PayoutsAPI.rejectEarlyRequest(selectedRequest.id, reasonText);

      // Local state update
      setEarlyPayoutRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
              ...r,
              status: "REJECTED",
              reviewedBy: "Admin User",
              reviewedDate: new Date().toLocaleDateString("en-US"),
              rejectionReason: reasonText,
            }
            : r
        )
      );

      setIsReviewOpen(false);
      Swal.fire("Rejected", "Early payout request rejected", "success");
    } catch (err) {
      console.error("Reject payout request failed", err);
      Swal.fire(
        "Error",
        err?.response?.data?.message ||
        "Failed to reject payout request. Please try again.",
        "error"
      );
    }
  };


  const openBatchDetails = async (batch) => {
    try {
      setIsBatchDetailsOpen(true);
      setSelectedBatch(null); // loading state

      const { data } = await PayoutsAPI.getBatchDetails(batch.id);

      // API response structure:
      // { id, technician: { id, name, phone, role }, totalAmount, type, status, details: [...], summary: {...} }
      
      // Map employment type from role
      const getEmploymentType = (role) => {
        if (role === "TECH_FREELANCER") return "Freelancer";
        if (role === "TECH_INTERNAL") return "Internal Employee";
        return role || "—";
      };

      // Transform API response to UI format
      const technicianName = data.technician?.name || "—";
      const employmentType = getEmploymentType(data.technician?.role);
      const totalAmount = data.totalAmount ?? 0;
      const commissionsCount = data.summary?.totalCommissions ?? data.details?.length ?? 0;
      const technicianCount = 1; // Single payout = 1 technician

      // Create payout breakdown array (single item for this payout)
      const payouts = [
        {
          technicianName,
          employmentType,
          amount: totalAmount,
          commissionsCount,
        },
      ];

      setSelectedBatch({
        ...batch,
        payouts,
        commissionsCount,
        technicianCount,
        totalAmount,
        // Additional info from API
        type: data.type || "EARLY",
        status: data.status || "COMPLETED",
        processedAt: data.processedAt,
        createdAt: data.createdAt,
        details: data.details || [], // Store full details for potential future use
      });
    } catch (err) {
      console.error("Failed to load batch details", err);
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed to load batch details.",
        "error"
      );
      setIsBatchDetailsOpen(false);
    }
  };


  // --------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Payout Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage commission &amp; bonus payouts with weekly batches and early
          payout requests.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Commissions</p>
                <p className="text-2xl font-semibold text-[#c20001] mt-1">
                  ${summaryPendingAmount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryPendingCount} items
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-[#c20001]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Early Payout Requests</p>
                <p className="text-2xl font-semibold text-[#ffb111] mt-1">
                  {summaryEarlyRequestsCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ${summaryEarlyRequestsAmount.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#ffb111]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Payout Date</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {summaryNextPayoutDateText}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryNextPayoutLabel}
                </p>

              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total Paid (This Month)
                </p>
                <p className="text-2xl font-semibold text-green-600 mt-1">
                  ${summaryPaidAmount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryPaidCount} payouts
                </p>

              </div>
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs header */}
      <div className="bg-gray-100 rounded-xl inline-flex p-1 text-sm">
        {[
          { id: "pending", label: "Pending Commissions" },
          { id: "requests", label: "Early Payout Requests" },
          { id: "batches", label: "Payout Batches" },
          { id: "history", label: "Payout History" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === tab.id
              ? "bg-white shadow text-gray-900"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            {tab.label}
            {tab.id === "pending" && pendingCommissions.length > 0 && (
              <Badge className="bg-[#c20001] text-white">
                {pendingCommissions.length}
              </Badge>
            )}
            {tab.id === "requests" && totalPendingRequests > 0 && (
              <Badge className="bg-[#ffb111] text-white">
                {totalPendingRequests}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Pending tab */}
      {activeTab === "pending" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle>Pending Commissions &amp; Bonuses</CardTitle>
                <CardDescription>
                  Verified payments ready for weekly payout based on completed jobs
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateBatchOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Create Weekly Batch
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <SearchIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search by technician or work order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filterType === "All" ? "solid" : "outline"}
                  onClick={() => setFilterType("All")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filterType === "Commission" ? "solid" : "outline"}
                  className={
                    filterType === "Commission"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : ""
                  }
                  onClick={() => setFilterType("Commission")}
                >
                  Commissions
                </Button>
                <Button
                  size="sm"
                  variant={filterType === "Bonus" ? "solid" : "outline"}
                  className={
                    filterType === "Bonus"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                  onClick={() => setFilterType("Bonus")}
                >
                  Bonuses
                </Button>
              </div>
            </div>

            {/* table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {[
                        "Work Order",
                        "Technician",
                        "Type",
                        "Service",
                        "Payment",
                        "Rate",
                        "Amount",
                        "Date",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {!filteredPendingCommissions.length ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No pending commissions found
                        </td>
                      </tr>
                    ) : (
                      filteredPendingCommissions.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{c.workOrderId}</td>
                          <td className="px-4 py-3">
                            <div className="text-gray-900">
                              {c.technicianName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {c.employmentType}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                c.type === "Commission"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }
                            >
                              {c.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">{c.serviceCategory}</td>
                          <td className="px-4 py-3">
                            ${c.paymentAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">{c.rate}%</td>
                          <td className="px-4 py-3 text-[#c20001]">
                            ${c.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {c.paymentDate}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredPendingCommissions.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                <strong>Total pending for payout:</strong>{" "}
                ${totalPendingAmount.toFixed(2)} across{" "}
                {pendingCommissions.length} commission
                {pendingCommissions.length !== 1 ? "s" : ""}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Requests tab */}
      {activeTab === "requests" && (
        <Card>
          <CardHeader>
            <CardTitle>Early Payout Requests</CardTitle>
            <CardDescription>
              Review and approve/reject on-demand payout requests from
              technicians
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payoutRequestsError && (
              <div className="mb-3 text-sm text-red-600">
                {payoutRequestsError}
              </div>
            )}
            {payoutRequestsLoading && (
              <div className="mb-3 text-sm text-gray-500">
                Loading payout requests...
              </div>
            )}

            {!earlyPayoutRequests.length && !payoutRequestsLoading ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                No early payout requests at the moment
              </div>
            ) : (
              <div className="space-y-4">
                {earlyPayoutRequests.map((r) => (
                  <div
                    key={r.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {r.technicianName}
                          </h3>
                          <Badge
                            className={
                              r.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : r.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {statusLabel(r.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Request Date:</span>
                            <span className="ml-2 text-gray-900">
                              {r.requestDate || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Requested Amount:
                            </span>
                            <span className="ml-2 text-[#c20001]">
                              ${Number(r.requestedAmount || 0).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Commission IDs:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {r.commissionIds?.length
                                ? r.commissionIds.join(", ")
                                : "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Commissions Count:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {r.commissionIds?.length || 0}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                          <p className="text-sm text-gray-600">Reason:</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {r.reason || "—"}
                          </p>
                        </div>
                        {r.status === "REJECTED" && r.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-600">
                              Rejection Reason:
                            </p>
                            <p className="mt-1 text-sm text-red-900">
                              {r.rejectionReason}
                            </p>
                          </div>
                        )}
                        {r.reviewedBy && (
                          <p className="mt-2 text-xs text-gray-500">
                            Reviewed by {r.reviewedBy}{" "}
                            {r.reviewedDate ? `on ${r.reviewedDate}` : ""}
                          </p>
                        )}
                      </div>

                      {r.status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={() => openReviewRequest(r)}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Batches tab */}
      {activeTab === "batches" && (
        <Card>
          <CardHeader>
            <CardTitle>Payout Batches</CardTitle>
            <CardDescription>
              Weekly payout batches scheduled for every Monday
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!payoutBatches.length ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                No payout batches available yet.
              </div>
            ) : (
              <div className="space-y-4">
                {payoutBatches.map((b) => (
                  <div
                    key={b.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {b.batchNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Created: {b.createdDate}
                        </p>
                      </div>
                      <Badge
                        className={
                          b.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : b.status === "Confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {b.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-600">Payout Date</p>
                        <p className="text-gray-900">{b.payoutDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Amount</p>
                        <p className="text-[#c20001]">
                          ${b.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Technicians</p>
                        <p className="text-gray-900">{b.technicianCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Commissions</p>
                        <p className="text-gray-900">{b.commissionsCount}</p>
                      </div>
                    </div>

                    {b.confirmedBy && (
                      <p className="text-xs text-gray-500 mb-1">
                        Confirmed by {b.confirmedBy} on {b.confirmedDate}
                      </p>
                    )}
                    {b.paidBy && (
                      <p className="text-xs text-gray-500 mb-2">
                        Paid by {b.paidBy} on {b.paidDate}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openBatchDetails(b)}
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        View Details
                      </Button>
                      {b.status === "Pending" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleConfirmBatch(b.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Confirm Batch
                        </Button>
                      )}
                      {b.status === "Confirmed" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleMarkPaid(b.id)}
                        >
                          <DollarSign className="h-4 w-4 mr-1.5" />
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  Complete audit trail of all processed payouts
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" disabled>
                <DownloadIcon className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {[
                        "Payout ID",
                        "Work Order",
                        "Technician",
                        "Type",
                        "Amount",
                        "Payment Date",
                        "Payout Date",
                        "Batch",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {!payoutHistory.length ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No payout history available yet. This will be powered
                          by backend APIs.
                        </td>
                      </tr>
                    ) : (
                      payoutHistory.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{p.payoutId}</td>
                          <td className="px-4 py-3">{p.workOrderId}</td>
                          <td className="px-4 py-3">{p.technicianName}</td>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                p.type === "Commission"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }
                            >
                              {p.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-[#c20001]">
                            ${p.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {p.paymentDate}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {p.payoutDate}
                          </td>
                          <td className="px-4 py-3">{p.batchNumber}</td>
                          <td className="px-4 py-3">
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {p.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------- Create Batch Modal ---------- */}
      <Modal
        open={isCreateBatchOpen}
        onClose={() => setIsCreateBatchOpen(false)}
        maxWidth="max-w-2xl"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Create Weekly Payout Batch
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Create a new payout batch for all pending commissions and bonuses.
        </p>

        <div className="mb-4 flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
          <CalendarIcon className="h-5 w-5 mt-0.5" />
          <p>
            This batch will be scheduled for payout on{" "}
            <strong>{getNextMonday()}</strong> (next Monday).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 border rounded-lg">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="mt-1 text-2xl font-semibold text-[#c20001]">
              ${totalPendingAmount.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 border rounded-lg">
            <p className="text-sm text-gray-600">Commissions</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {pendingCommissions.length}
            </p>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-900 mb-5">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>
              This batch will be created on the server and included in the next weekly payout run.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsCreateBatchOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateBatch}>Create Batch</Button>
        </div>
      </Modal>

      {/* ---------- Review Request Modal ---------- */}
      <Modal
        open={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        maxWidth="max-w-2xl"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Review Early Payout Request
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Review and approve or reject this early payout request.
        </p>

        {selectedRequest && (
          <div className="space-y-4 mb-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Technician</Label>
                <p className="mt-1 text-gray-900">
                  {selectedRequest.technicianName}
                </p>
              </div>
              <div>
                <Label>Request Date</Label>
                <p className="mt-1 text-gray-900">
                  {selectedRequest.requestDate || "—"}
                </p>
              </div>
              <div>
                <Label>Requested Amount</Label>
                <p className="mt-1 text-[#c20001]">
                  ${Number(selectedRequest.requestedAmount || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <Label>Commissions Count</Label>
                <p className="mt-1 text-gray-900">
                  {selectedRequest.commissionIds?.length || 0}
                </p>
              </div>
            </div>

            <div>
              <Label>Commission IDs</Label>
              <p className="mt-1 text-sm text-gray-900">
                {selectedRequest.commissionIds?.length
                  ? selectedRequest.commissionIds.join(", ")
                  : "—"}
              </p>
            </div>

            <div>
              <Label>Reason for Early Payout</Label>
              <div className="mt-1 p-3 bg-gray-50 border rounded text-sm text-gray-900">
                {selectedRequest.reason || "—"}
              </div>
            </div>

            <div>
              <Label>Rejection Reason (if rejecting)</Label>
              <Textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
              />
            </div>

            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p>
                  If approved, this payout will be processed immediately and
                  marked as paid. The commissions will be removed from the
                  weekly batch cycle.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
            onClick={handleRejectRequest}
          >
            <XCircle className="h-4 w-4 mr-1.5" />
            Reject
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleApproveRequest}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Approve &amp; Pay
          </Button>
        </div>
      </Modal>

      {/* ---------- Batch Details Modal ---------- */}
      <Modal
        open={isBatchDetailsOpen}
        onClose={() => setIsBatchDetailsOpen(false)}
        maxWidth="max-w-3xl"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Payout Batch Details
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {selectedBatch?.batchNumber || ""}
        </p>

        {selectedBatch && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div className="p-3 bg-gray-50 border rounded-lg">
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="mt-1 text-xl font-semibold text-[#c20001]">
                  ${selectedBatch.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 border rounded-lg">
                <p className="text-xs text-gray-600">Technicians</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {selectedBatch.technicianCount}
                </p>
              </div>
              <div className="p-3 bg-gray-50 border rounded-lg">
                <p className="text-xs text-gray-600">Commissions</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {selectedBatch.commissionsCount}
                </p>
              </div>
            </div>

            <div>
              <Label>Payout Breakdown by Technician</Label>
              <div className="mt-2 rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Technician", "Type", "Amount", "Commissions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">

                    {!selectedBatch.payouts?.length ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                          No commission details found for this batch.
                        </td>
                      </tr>
                    ) : ( selectedBatch.payouts.map((p, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-gray-900">
                          {p.technicianName}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {p.employmentType}
                        </td>
                        <td className="px-4 py-3 text-[#c20001]">
                          ${p.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {p.commissionsCount}
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <Button
            variant="outline"
            onClick={() => setIsBatchDetailsOpen(false)}
          >
            Close
          </Button>
          <Button variant="outline" disabled>
            <DownloadIcon className="h-4 w-4 mr-1.5" />
            Export PDF
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPayoutManagement;
