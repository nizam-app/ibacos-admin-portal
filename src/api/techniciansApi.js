// src/api/techniciansApi.js
import axiosClient from "./axiosClient";

// Sob technician related API ekhanei thakbe
const TechniciansAPI = {
  // Dispatcher overview cards
  getStatusOverview: () =>
    axiosClient.get("/dispatch/technician-status"),

  // List all technicians (freelancers for now)
  // GET {{baseUrl}}/api/admin/users?role=TECH_FREELANCER
  listTechnicians: (params = {}) =>
    axiosClient.get("/admin/users", {
      params: {
        role: "TECH_FREELANCER",
        ...params,
      },
    }),

  // Create new technician
  // POST {{baseUrl}}/api/admin/users
  createTechnician: (payload) =>
    axiosClient.post("/admin/users", payload),

  // Update basic user info
  // PATCH {{baseUrl}}/api/admin/users/:id
  updateTechnician: (userId, payload) =>
    axiosClient.patch(`/admin/users/${userId}`, payload),

  // Block technician
  // PATCH {{baseUrl}}/api/admin/users/:id/block
  blockTechnician: (userId, reason) =>
    axiosClient.patch(`/admin/users/${userId}/block`, {
      isBlocked: true,
      blockedReason: reason,
    }),

  // Unblock technician
  // PATCH {{baseUrl}}/api/admin/users/:id/block
  unblockTechnician: (userId) =>
    axiosClient.patch(`/admin/users/${userId}/block`, {
      isBlocked: false,
    }),

  // Update technician profile (commission, bonus, status, etc.)
  // PATCH {{baseUrl}}/api/admin/users/:id/profile
  updateTechnicianProfile: (userId, payload) =>
    axiosClient.patch(`/admin/users/${userId}/profile`, payload),
};

export default TechniciansAPI;
