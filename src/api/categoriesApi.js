// src/api/categoriesApi.js
import axiosClient from "./axiosClient";

const CategoriesAPI = {
  // ----- Categories -----
  getCategories: () => axiosClient.get("/categories"),

  createCategory: (body) =>
    axiosClient.post("/categories", body), // { name, description }

  updateCategory: (id, body) =>
    axiosClient.patch(`/categories/${id}`, body), // { name, description }

  deleteCategory: (id) => axiosClient.delete(`/categories/${id}`),

  activateCategory: (id) => axiosClient.post(`/categories/${id}/activate`),
  deactivateCategory: (id) => axiosClient.post(`/categories/${id}/deactivate`),

  // ----- Services -----
  // NOTE: backend উদাহরণে body তে subserviceId ছিল,
  // কিন্তু relations দেখে service -> subservices, তাই এখানে
  // { categoryId, name, description, baseRate } পাঠাচ্ছি।
  createService: (body) =>
    axiosClient.post("/categories/services", body),

  updateService: (id, body) =>
    axiosClient.patch(`/categories/services/${id}`, body),

  deleteService: (id) =>
    axiosClient.delete(`/categories/services/${id}`),

  // ----- Subservices -----
  // NOTE: list response এ subservice এর serviceId আছে,
  // তাই createSubservice এ আমরা serviceId পাঠাচ্ছি।
  createSubservice: (body) =>
    axiosClient.post("/categories/subservices", body),

  updateSubservice: (id, body) =>
    axiosClient.patch(`/categories/subservices/${id}`, body),

  deleteSubservice: (id) =>
    axiosClient.delete(`/categories/subservices/${id}`),
};

export default CategoriesAPI;
