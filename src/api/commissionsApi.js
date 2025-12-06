// src/api/commissionsApi.js
import axiosClient from "./axiosClient";

const CommissionsAPI = {
  // GET /api/commissions/payout-requests
  getPayoutRequests: (params = {}) =>
    axiosClient.get("/commissions/payout-requests", { params }),

  // PATCH /api/commissions/payout-requests/:id   (APPROVE / REJECT)
  reviewPayoutRequest: (payoutRequestId, action, reason) =>
    axiosClient.patch(`/commissions/payout-requests/${payoutRequestId}`, {
      action,
      ...(reason ? { reason } : {}),
    }),

  // ----- Batch APIs (coming soon) -----
  createPayoutBatch: () =>
    Promise.reject(new Error("Payout batch creation API coming soon")),
  getPayoutBatches: () =>
    Promise.reject(new Error("Payout batches API coming soon")),
  markBatchPaid: () =>
    Promise.reject(new Error("Mark batch paid API coming soon")),
  confirmBatchTransferred: () =>
    Promise.reject(new Error("Confirm batch transferred API coming soon")),
};

export default CommissionsAPI;
