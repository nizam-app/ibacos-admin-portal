// src/api/dashboardApi.js
import axiosClient from "./axiosClient";

const DashboardAPI = {
  // ...other dashboard APIs

  getTop5Technicians: ({ timeframe, startDate, endDate } = {}) =>
    axiosClient.get("/admin/top-5-technicians", {
      params: {
        timeframe,
        startDate,
        endDate,
      },
    }),
};

export default DashboardAPI;
