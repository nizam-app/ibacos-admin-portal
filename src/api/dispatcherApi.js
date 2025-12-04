// src/api/dispatcherApi.js
import axiosClient from "./axiosClient";

const DispatcherAPI = {
  // 🔹 Work order list
  getWorkOrders: (params = {}) =>
    axiosClient.get("/wos", {
      params, // { status, page, limit }
    }),

  // 🔹 Single WO details
  getWorkOrderById: (woId) => axiosClient.get(`/wos/${woId}`),

  // 🔹 Reassign technician
  reassignWorkOrder: (woId, body) =>
    axiosClient.patch(`/wos/${woId}/reassign`, body), // { technicianId, reason }

  // 🔹 Cancel WO
  cancelWorkOrder: (woId, body) =>
    axiosClient.patch(`/wos/${woId}/cancel`, body), // { reason }

  // 🔹 Reschedule WO
  rescheduleWorkOrder: (woId, body) =>
    axiosClient.patch(`/wos/${woId}/reschedule`, body), // { scheduledDate, scheduledTime, estimatedDuration, notes }

  // 🔹 Nearby technicians for a job (dispatcher)
  getNearbyTechnicians: ({
    latitude,
    longitude,
    maxDistance = 50,
    status = "ONLINE",
  }) =>
    axiosClient.get("/dispatcher/technicians/nearby", {
      params: { latitude, longitude, maxDistance, status },
    }),
};

export default DispatcherAPI;
