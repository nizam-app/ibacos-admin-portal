import axiosClient from "./axiosClient";

const AdminWorkOrdersAPI = {
  getWorkOrders: (params = {}) =>
    axiosClient.get("/wos", { params }),

  getWorkOrderById: (woId) =>
    axiosClient.get(`/wos/${woId}`),

  reassignWorkOrder: (woId, body) =>
    axiosClient.patch(`/wos/${woId}/reassign`, body),

  rescheduleWorkOrder: (woId, body) =>
    axiosClient.patch(`/wos/${woId}/reschedule`, body),

  cancelWorkOrder: (woId, body) =>
    axiosClient.patch(`/wos/${woId}/cancel`, body),

  getNearbyTechnicians: (params = {}) =>
    axiosClient.get(`/dispatcher/technicians/nearby`, { params }),

  getAuditTrail: (woId) =>
    axiosClient.get(`/admin/work-orders/${woId}/audit-trail`),

  verifyPayment: (paymentId, body) =>
    axiosClient.patch(`/payments/${paymentId}/verify`, body),

  rejectPayment: (paymentId, body) =>
    axiosClient.patch(`/payments/${paymentId}/reject`, body),
};

export default AdminWorkOrdersAPI;
