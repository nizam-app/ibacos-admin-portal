// src/api/specializationsApi.js
import axiosClient from "./axiosClient";

const SpecializationsAPI = {
  // Get all specializations
  getAll: (params = {}) =>
    axiosClient.get("/specializations", {
      params,
    }),

  // Get single specialization by ID
  getById: (id) => axiosClient.get(`/specializations/${id}`),

  // Create new specialization
  create: (body) => axiosClient.post("/specializations", body),

  // Update specialization
  update: (id, body) => axiosClient.put(`/specializations/${id}`, body),

  // Delete specialization
  delete: (id) => axiosClient.delete(`/specializations/${id}`),
};

export default SpecializationsAPI;
