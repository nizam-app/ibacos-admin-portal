// src/api/paymentsApi.js
import axiosClient from "./axiosClient";

const PaymentsAPI = {
  // GET /api/payments?status=PENDING_VERIFICATION
  getPayments: (params = {}) =>
    axiosClient.get("/payments", {
      params,
    }),

  // GET /api/payments/stats/overview
  getPaymentStats: () => axiosClient.get("/payments/stats/overview"),

  // GET /api/payments/:paymentId
  getPaymentById: (paymentId) => axiosClient.get(`/payments/${paymentId}`),

  // PATCH /api/payments/:paymentId/verify
  // body:
  //  { action: "APPROVE" }
  //  { action: "REJECT", reason: "..." }
  verifyPayment: (paymentId, action, reason) => {
    const body = { action }; // APPROVE | REJECT

    if (action === "REJECT" && reason) {
      body.reason = reason;
    }

    return axiosClient.patch(`/payments/${paymentId}/verify`, body);
  },
};

export default PaymentsAPI;
