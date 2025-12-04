// src/api/paymentsApi.js
import axiosClient from "./axiosClient";

const PaymentsAPI = {
  // Overview stats
  getPaymentStats: () => axiosClient.get("/payments/stats/overview"),

  // List payments (with optional status, pagination)
  // status: PENDING_VERIFICATION | VERIFIED | REJECTED
  getPayments: (params = {}) =>
    axiosClient.get("/payments", {
      params,
    }),

  // এগুলো ADMIN side এ লাগবে (verify / reject)
  verifyPayment: (paymentId, body) =>
    axiosClient.patch(`/payments/${paymentId}/verify`, body),

  rejectPayment: (paymentId, body) =>
    axiosClient.patch(`/payments/${paymentId}/reject`, body),
};

export default PaymentsAPI;
