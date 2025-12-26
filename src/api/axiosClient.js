// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://outside2backend.mtscorporate.com/api",
  // baseURL: "https://lightseagreen-wasp-696483.hostingersite.com/api",
});

// --- request interceptor: token add ---
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- response interceptor: 401 hole sudhu storage clear, HARD redirect na ---
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // ekhane kono window.location.href = "/" rakhbona,
      // na hole /sr 401 paile sathe sathe abar login e chole jabe.
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
