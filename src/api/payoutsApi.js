// src/api/payoutsApi.js
import axiosClient from "./axiosClient";

const PayoutsAPI = {
  // Top summary cards
  getSummary: () => axiosClient.get("/payouts/summary"),

  // Pending commissions table
  getPendingCommissions: () =>
    axiosClient.get("/payouts/pending-commissions"),

  // Early payout requests
  getEarlyRequests: () => axiosClient.get("/payouts/early-requests"),
  approveEarlyRequest: (id, notes) =>
    axiosClient.patch(`/payouts/early-requests/${id}/approve`, { notes }),
  rejectEarlyRequest: (id, reason) =>
    axiosClient.patch(`/payouts/early-requests/${id}/reject`, { reason }),

  // Weekly payout batches
  createBatch: () => axiosClient.post("/payouts/batches", {}),
  getBatches: () => axiosClient.get("/payouts/batches"),
  processBatch: (id) => axiosClient.patch(`/payouts/batches/${id}/process`),

  // History list
  getHistory: () => axiosClient.get("/payouts/history"),

  getBatchDetails(batchId) {
  return axiosClient.get(`/payouts/batches/${batchId}`);
}

};

export default PayoutsAPI;
