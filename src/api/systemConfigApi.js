// src/api/systemConfigApi.js
import axiosClient from "./axiosClient";

const SystemConfigAPI = {
  getConfig: () => axiosClient.get("/admin/system-config"),
  updateConfig: (payload) =>
    axiosClient.patch("/admin/system-config", payload),
};

export default SystemConfigAPI;
