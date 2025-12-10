// src/api/auditLogApi.js
import axiosClient from "./axiosClient";

const AuditLogAPI = {
  // params optional: { action, page, limit, ... }
  getAuditLogs: (params = {}) =>
    axiosClient.get("/admin/audit-logs", {
      params,
    }),
};

export default AuditLogAPI;
