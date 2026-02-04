// src/api/TechnicianAPI.js
import axiosClient from "./axiosClient";

const TechnicianAPI = {
  // Directory list (admin + dispatcher)
  getDirectory: (params = {}) =>
    axiosClient.get("/technicians/directory", {
      params,
    }),

  // Optional: overview (if you want backend stats later)
  getOverview: (params = {}) =>
    axiosClient.get("/technicians/overview", {
      params,
    }),

  // Single technician details
  getDetails: (id) => axiosClient.get(`/technicians/${id}`),

  // Create new technician (accepts plain object for JSON or FormData for file uploads)
  createTechnician: (body) => {
    if (body instanceof FormData) {
      // Let axios set Content-Type with boundary automatically
      return axiosClient.post("/technicians", body);
    }
    return axiosClient.post("/technicians", body);
  },

  // Update technician (accepts plain object for JSON or FormData for file uploads)
  updateTechnician: (id, body) => {
    if (body instanceof FormData) {
      return axiosClient.patch(`/technicians/${id}`, body);
    }
    return axiosClient.patch(`/technicians/${id}`, body);
  },

  // CSV export (admin)
  exportCsv: (params = {}) =>
    axiosClient.get("/technicians/export", {
      params,
      responseType: "blob",
    }),
  getDefaultRate: (techType) =>
    axiosClient.get(`/rates/default/${techType}`),

  // Get specializations (for specialty dropdown)
  getSpecializations: (activeOnly = true) =>
    axiosClient.get("/specializations", {
      params: { activeOnly },
    }),
};

export default TechnicianAPI;
