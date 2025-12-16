// src/api/customersApi.js
import axiosClient from "./axiosClient";

const CustomersAPI = {
  // GET /admin/customers  (with optional ?registrationSource=...)
  getCustomers: (params = {}) =>
    axiosClient.get("/admin/customers", { params }),
};

export default CustomersAPI;
