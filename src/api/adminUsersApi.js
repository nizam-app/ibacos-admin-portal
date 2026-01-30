// src/api/adminUsersApi.js
import axiosClient from "./axiosClient";

const AdminUsersAPI = {
  // role: "CALL_CENTER" | "DISPATCHER" | "ADMIN" (optional)
  listUsers: (role) =>
    axiosClient.get("/admin/users", {
      params: role ? { role } : {},
    }),

  createUser: (payload) =>
    axiosClient.post("/admin/users", payload),

  updateUser: (id, payload) =>
    axiosClient.patch(`/admin/users/${id}`, payload),

  // block / unblock
  blockUser: (id, payload) =>
    axiosClient.patch(`/admin/users/${id}/block`, payload),

  // reset password
  resetPassword: (id, newPassword) =>
    axiosClient.post(`/admin/users/${id}/reset-password`, {
      newPassword,
    }),
};

export default AdminUsersAPI;
