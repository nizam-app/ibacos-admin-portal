// src/api/categoriesApi.js
import axiosClient from "./axiosClient";

const CategoriesAPI = {
  // ----- Categories -----
  getCategories: () => axiosClient.get("/categories"),

// body: JSON object or FormData
createCategory: (body, isFormData = false) =>
  axiosClient.post("/categories", body, {
    headers: isFormData
      ? { "Content-Type": "multipart/form-data" }
      : undefined,
  }),

// body: JSON object or FormData
updateCategory: (id, body, isFormData = false) =>
  axiosClient.patch(`/categories/${id}`, body, {
    headers: isFormData
      ? { "Content-Type": "multipart/form-data" }
      : undefined,
  }),


  deleteCategory: (id) => axiosClient.delete(`/categories/${id}`),

  // NOTE: Postman অনুযায়ী method = PATCH
  activateCategory: (id) => axiosClient.patch(`/categories/${id}/activate`),
  deactivateCategory: (id) => axiosClient.patch(`/categories/${id}/deactivate`),

  // ----- Services -----
  // body: { categoryId, name, description }
  createService: (body) => axiosClient.post("/categories/services", body),

  // body: { name, description }
  updateService: (id, body) =>
    axiosClient.patch(`/categories/services/${id}`, body),

  deleteService: (id) => axiosClient.delete(`/categories/services/${id}`),

  // ----- Subservices -----
  // body: { serviceId, name, description, baseRate? }
  createSubservice: (body) =>
    axiosClient.post("/categories/subservices", body),

  // body: { name, description, baseRate? }
  updateSubservice: (id, body) =>
    axiosClient.patch(`/categories/subservices/${id}`, body),

  deleteSubservice: (id) =>
    axiosClient.delete(`/categories/subservices/${id}`),
};

export default CategoriesAPI;
