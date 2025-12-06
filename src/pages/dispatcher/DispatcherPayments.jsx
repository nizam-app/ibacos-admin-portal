// // src/pages/dispatcher/DispatcherPayments.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Swal from "sweetalert2";
// import {
//   DollarSign,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   Search,
//   FileText,
//   AlertCircle,
//   TrendingUp,
//   Calendar,
//   Filter,
//   CreditCard,
//   User,
//   Image as ImageIcon,
//   CircleDollarSign,
// } from "lucide-react";

// import PaymentsAPI from "../../api/paymentsApi";

// /* ----------------------------------------------------
//    Small helper components
// -----------------------------------------------------*/
// const Badge = ({ className = "", children }) => (
//   <span
//     className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
//   >
//     {children}
//   </span>
// );

// /* ----------------------------------------------------
//    Modal: Dispatcher view-only payment details
// -----------------------------------------------------*/
// function PaymentDetailsModal({ isOpen, onClose, payment }) {
//   if (!isOpen || !payment) return null;

//   const stop = (e) => e.stopPropagation();

//   const backendStatus = payment.status;
//   let statusLabel = "Pending";
//   let statusClass = "bg-gray-500 text-white";

//   if (backendStatus === "PENDING_VERIFICATION") {
//     statusLabel = "Awaiting Verification";
//     statusClass = "bg-yellow-500 text-white";
//   } else if (backendStatus === "VERIFIED") {
//     statusLabel = "Verified";
//     statusClass = "bg-green-500 text-white";
//   } else if (backendStatus === "REJECTED") {
//     statusLabel = "Rejected";
//     statusClass = "bg-red-500 text-white";
//   }

//   const hasProof = !!payment.proofUrl;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
//       onClick={onClose}
//     >
//       <div
//         className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
//         onClick={stop}
//       >
//         {/* Header */}
//         <div className="border-b border-gray-200 px-6 py-4">
//           <h2 className="text-lg font-semibold text-gray-900">
//             Payment Details
//           </h2>
//           <p className="mt-1 text-sm text-gray-500">
//             Work Order{" "}
//             <span className="font-medium text-[#c20001]">
//               {payment.workOrder?.woNumber || `WO-${payment.woId}`}
//             </span>
//           </p>
//         </div>

//         {/* Body */}
//         <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
//           {/* Basic info */}
//           <div className="space-y-2 rounded-lg bg-gray-50 p-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm font-semibold text-[#c20001]">
//                 Payment #{payment.id}
//               </span>
//               <Badge className={statusClass}>{statusLabel}</Badge>
//             </div>
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <p className="text-xs text-gray-600">Customer</p>
//                 <p className="text-gray-900">
//                   {payment.workOrder?.customer?.name || "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-600">Technician</p>
//                 <p className="text-gray-900">
//                   {payment.technician?.name || "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-600">Work Order Status</p>
//                 <p className="text-gray-900">
//                   {payment.workOrder?.status || "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-600">Created At</p>
//                 <p className="text-gray-900">
//                   {new Date(payment.createdAt).toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Payment info */}
//           <div className="space-y-4">
//             <h3 className="text-sm font-semibold text-[#c20001]">
//               Payment Info
//             </h3>
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div className="flex items-start gap-2">
//                 <CreditCard className="mt-0.5 h-4 w-4 text-gray-500" />
//                 <div>
//                   <p className="text-xs text-gray-600">Method</p>
//                   <p className="text-gray-900">
//                     {payment.method === "MOBILE_MONEY"
//                       ? "Mobile Money"
//                       : payment.method || "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-2">
//                 <CircleDollarSign className="mt-0.5 h-4 w-4 text-gray-500" />
//                 <div>
//                   <p className="text-xs text-gray-600">Amount</p>
//                   <p className="text-gray-900">
//                     {payment.amount != null ? `KSh ${payment.amount}` : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-2">
//                 <User className="mt-0.5 h-4 w-4 text-gray-500" />
//                 <div>
//                   <p className="text-xs text-gray-600">Transaction Ref</p>
//                   <p className="text-gray-900">
//                     {payment.transactionRef || "N/A"}
//                   </p>
//                 </div>
//               </div>
//               {payment.verifiedBy && (
//                 <div className="flex items-start gap-2">
//                   <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
//                   <div>
//                     <p className="text-xs text-gray-600">Verified By</p>
//                     <p className="text-gray-900">
//                       {payment.verifiedBy.name} (
//                       {payment.verifiedAt
//                         ? new Date(payment.verifiedAt).toLocaleString()
//                         : ""}
//                       )
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Proof image */}
//           {hasProof && (
//             <div>
//               <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
//                 <ImageIcon className="h-4 w-4" />
//                 Payment Proof
//               </label>
//               <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
//                 <div className="flex aspect-video items-center justify-center rounded-lg bg-white">
//                   <img
//                     src={payment.proofUrl}
//                     alt="Payment Proof"
//                     className="max-h-full max-w-full rounded-lg object-contain"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Rejection reason (if any) */}
//           {payment.status === "REJECTED" && payment.rejectedReason && (
//             <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
//               <div className="flex items-start gap-2">
//                 <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
//                 <div>
//                   <p className="font-medium text-red-900">
//                     Rejection Reason
//                   </p>
//                   <p className="mt-1 text-red-700">{payment.rejectedReason}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Info for dispatcher */}
//           <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
//             <p className="font-medium text-gray-800">
//               Dispatcher view (read-only)
//             </p>
//             <p className="mt-1">
//               Payment verification and rejection can only be done by an Admin.
//               If anything looks incorrect, please contact the Admin team.
//             </p>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-3">
//           <button
//             type="button"
//             onClick={onClose}
//             className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ----------------------------------------------------
//    MAIN PAGE – Dispatcher Payments (dynamic)
// -----------------------------------------------------*/
// export default function DispatcherPayments() {
//   const [payments, setPayments] = useState([]);
//   const [stats, setStats] = useState({
//     pendingUpload: 0,
//     awaitingVerification: 0,
//     verified: 0,
//     rejected: 0,
//     totalCommissions: 0,
//   });

//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all"); // all | awaitingVerification | verified | rejected

//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [selectedPayment, setSelectedPayment] = useState(null);

//   /* ---------- helpers ---------- */

//   const mapFilterToBackendStatus = (filter) => {
//     switch (filter) {
//       case "awaitingVerification":
//         return "PENDING_VERIFICATION";
//       case "verified":
//         return "VERIFIED";
//       case "rejected":
//         return "REJECTED";
//       default:
//         return undefined; // all
//     }
//   };

//   const getStatusBadge = (status) => {
//     if (status === "PENDING_VERIFICATION") {
//       return (
//         <Badge className="bg-yellow-500 text-white">
//           Awaiting Verification
//         </Badge>
//       );
//     }
//     if (status === "VERIFIED") {
//       return <Badge className="bg-green-500 text-white">Verified</Badge>;
//     }
//     if (status === "REJECTED") {
//       return <Badge className="bg-red-500 text-white">Rejected</Badge>;
//     }
//     return <Badge className="bg-gray-500 text-white">Pending</Badge>;
//   };

//   /* ---------- API loaders ---------- */

//   const loadStats = async () => {
//     try {
//       const res = await PaymentsAPI.getPaymentStats();
//       setStats(res.data || {});
//     } catch (err) {
//       console.error("Failed to load payment stats", err);
//       // stats না পেলে UI তে 0 দেখালেও চলবে
//     }
//   };

//   const loadPayments = async (pageToLoad = page, filter = filterStatus) => {
//     try {
//       setLoading(true);
//       setError("");

//       const status = mapFilterToBackendStatus(filter);

//       const params = {
//         page: pageToLoad,
//         limit,
//       };
//       if (status) params.status = status;

//       const res = await PaymentsAPI.getPayments(params);
//       const data = res.data;

//       const list = Array.isArray(data.payments) ? data.payments : [];

//       setPayments(list);
//       setTotal(data.pagination?.total || list.length);
//       setTotalPages(data.pagination?.totalPages || 1);
//       setPage(data.pagination?.page || pageToLoad);
//     } catch (err) {
//       console.error("Failed to load payments", err);
//       setError(
//         err.response?.data?.message ||
//           "Failed to load payments. Please try again."
//       );
//       setPayments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------- effects ---------- */

//   useEffect(() => {
//     loadStats();
//     loadPayments(1, filterStatus);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filterStatus]);

//   /* ---------- derived lists ---------- */

//   const filteredPayments = useMemo(() => {
//     if (!searchTerm.trim()) return payments;

//     const q = searchTerm.toLowerCase();
//     return payments.filter((p) => {
//       const woNumber = p.workOrder?.woNumber || "";
//       const customerName = p.workOrder?.customer?.name || "";
//       const technicianName = p.technician?.name || "";

//       return (
//         woNumber.toLowerCase().includes(q) ||
//         customerName.toLowerCase().includes(q) ||
//         technicianName.toLowerCase().includes(q)
//       );
//     });
//   }, [payments, searchTerm]);

//   /* ---------- render ---------- */

//   const openModal = (payment) => setSelectedPayment(payment);
//   const closeModal = () => setSelectedPayment(null);

//   return (
//     <div className="space-y-6">
//       {/* Page header */}
//       <div>
//         <h2 className="text-lg font-semibold text-gray-900">
//           Payment Management
//         </h2>
//         <p className="text-sm text-gray-600">
//           View technician payments and verification status.
//         </p>
//       </div>

//       {/* Stats cards */}
//       <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
//         <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs font-medium text-gray-600">
//                 Pending Upload
//               </p>
//               <p className="mt-2 text-2xl font-semibold text-gray-900">
//                 {stats.pendingUpload ?? 0}
//               </p>
//             </div>
//             <div className="rounded-lg bg-gray-100 p-3">
//               <Clock className="h-6 w-6 text-gray-600" />
//             </div>
//           </div>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs font-medium text-gray-600">
//                 Awaiting Verification
//               </p>
//               <p className="mt-2 text-2xl font-semibold text-yellow-600">
//                 {stats.awaitingVerification ?? 0}
//               </p>
//             </div>
//             <div className="rounded-lg bg-yellow-100 p-3">
//               <AlertCircle className="h-6 w-6 text-yellow-600" />
//             </div>
//           </div>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs font-medium text-gray-600">Verified</p>
//               <p className="mt-2 text-2xl font-semibold text-green-600">
//                 {stats.verified ?? 0}
//               </p>
//             </div>
//             <div className="rounded-lg bg-green-100 p-3">
//               <CheckCircle2 className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs font-medium text-gray-600">Rejected</p>
//               <p className="mt-2 text-2xl font-semibold text-red-600">
//                 {stats.rejected ?? 0}
//               </p>
//             </div>
//             <div className="rounded-lg bg-red-100 p-3">
//               <XCircle className="h-6 w-6 text-red-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Total commissions banner */}
//       <div className="rounded-xl bg-gradient-to-r from-[#c20001] to-[#ffb111] p-4 shadow-sm">
//         <div className="flex items-center justify-between text-white">
//           <div>
//             <p className="text-xs font-medium text-white/90">
//               Total Commissions (Verified)
//             </p>
//             <p className="mt-2 text-2xl font-semibold">
//               KSh {stats.totalCommissions ?? 0}
//             </p>
//           </div>
//           <div className="rounded-lg bg-white/20 p-3">
//             <TrendingUp className="h-6 w-6 text-white" />
//           </div>
//         </div>
//       </div>

//       {/* Search + filter */}
//       <div className="flex flex-col gap-4 md:flex-row md:items-center">
//         <div className="relative flex-1">
//           <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by work order, customer, or technician…"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
//           />
//         </div>

//         <div className="flex w-full items-center gap-2 md:w-72">
//           <div className="flex items-center justify-center rounded-lg bg-gray-100 p-2">
//             <Filter className="h-4 w-4 text-gray-600" />
//           </div>
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-[1px] focus:ring-[#ffb111]"
//           >
//             <option value="all">
//               All Payments ({total})
//             </option>
//             <option value="awaitingVerification">
//               Awaiting Verification ({stats.awaitingVerification ?? 0})
//             </option>
//             <option value="verified">
//               Verified ({stats.verified ?? 0})
//             </option>
//             <option value="rejected">
//               Rejected ({stats.rejected ?? 0})
//             </option>
//           </select>
//         </div>
//       </div>

//       {/* Payments list */}
//       <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
//         <div className="border-b border-gray-200 px-4 py-3">
//           <h3 className="text-sm font-semibold text-gray-900">
//             Payments
//           </h3>
//         </div>
//         <div className="px-4 py-4">
//           {loading ? (
//             <div className="py-12 text-center text-gray-500">
//               Loading payments…
//             </div>
//           ) : error ? (
//             <div className="py-8 text-center text-red-600 text-sm">
//               {error}
//             </div>
//           ) : filteredPayments.length === 0 ? (
//             <div className="py-12 text-center text-gray-500">
//               <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
//               <p>No payments found</p>
//               <p className="mt-1 text-sm">
//                 {searchTerm
//                   ? "Try adjusting your search or filters."
//                   : "Payment records will appear here once technicians upload proof."}
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {filteredPayments.map((p) => (
//                 <div
//                   key={p.id}
//                   className="rounded-lg border border-gray-200 p-4 hover:border-gray-300"
//                 >
//                   <div className="flex items-start justify-between gap-4">
//                     <div className="flex-1 space-y-2">
//                       <div className="flex flex-wrap items-center gap-3">
//                         <span className="text-sm font-semibold text-[#c20001]">
//                           {p.workOrder?.woNumber || `WO-${p.woId}`}
//                         </span>
//                         {getStatusBadge(p.status)}
//                       </div>

//                       <div className="grid gap-4 text-sm md:grid-cols-4">
//                         <div>
//                           <p className="text-xs text-gray-600">Customer</p>
//                           <p className="text-gray-900">
//                             {p.workOrder?.customer?.name || "N/A"}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-600">Technician</p>
//                           <p className="text-gray-900">
//                             {p.technician?.name || "N/A"}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-600">Method</p>
//                           <p className="text-gray-900">
//                             {p.method === "MOBILE_MONEY"
//                               ? "Mobile Money"
//                               : p.method || "N/A"}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-600">Amount</p>
//                           <p className="flex items-center gap-1 text-gray-900">
//                             <DollarSign className="h-3 w-3" />
//                             {p.amount != null ? p.amount : "N/A"}
//                           </p>
//                         </div>
//                       </div>

//                       {p.status === "REJECTED" && p.rejectedReason && (
//                         <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
//                           <span className="font-medium">Rejection: </span>
//                           {p.rejectedReason}
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex flex-col gap-2">
//                       <button
//                         type="button"
//                         onClick={() => openModal(p)}
//                         className="rounded-[10px] border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
//                       >
//                         View Details
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && !loading && (
//           <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-4 py-3 text-xs text-gray-600">
//             <span>
//               Page {page} of {totalPages} • {total} results
//             </span>
//             <button
//               type="button"
//               disabled={page <= 1}
//               onClick={() => loadPayments(page - 1, filterStatus)}
//               className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
//             >
//               Prev
//             </button>
//             <button
//               type="button"
//               disabled={page >= totalPages}
//               onClick={() => loadPayments(page + 1, filterStatus)}
//               className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>

//       {/* View-only modal */}
//       <PaymentDetailsModal
//         isOpen={!!selectedPayment}
//         onClose={closeModal}
//         payment={selectedPayment}
//       />
//     </div>
//   );
// }

