// src/api/dispatcherApi.js
import axiosClient from "./axiosClient";

const DispatcherAPI = {
  // 👇 work orders list
  getWorkOrders: (params = {}) =>
    axiosClient.get("/wos", {
      // TODO: jodi real route onno rokom hoy, ekhane change korbi
      params,
    }),

  getNearbyTechnicians: ({ latitude, longitude, maxDistance = 50, status }) =>
    axiosClient.get("/technicians/nearby", {
      params: { latitude, longitude, maxDistance, status },
    }),

  reassignWorkOrder: (woId, body) =>
    axiosClient.patch(`/wos/${woId}/reassign`, body),

  cancelWorkOrder: (woId, body) =>
    axiosClient.patch(`/wos/${woId}/cancel`, body),
};

export default DispatcherAPI;   
