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

  // Create new technician
  createTechnician: (body) => axiosClient.post("/technicians", body),

  // Update technician basic info / compensation
  updateTechnician: (id, body) =>
    axiosClient.patch(`/technicians/${id}`, body),

  // Block / unblock
  blockTechnician: (id, body) =>
    axiosClient.patch(`/technicians/${id}/block`, body),

  // Upload documents (photo, ID, residence permit, degrees)
  uploadDocuments: (id, formData) =>
    axiosClient.patch(`/technicians/${id}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // CSV export (admin)
  exportCsv: (params = {}) =>
    axiosClient.get("/technicians/export", {
      params,
      responseType: "blob",
    }),
};

export default TechnicianAPI;
