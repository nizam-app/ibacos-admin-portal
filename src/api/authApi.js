// src/api/authApi.js
import axiosClient from "./axiosClient";

export async function loginApi({ phone, password }) {
  const response = await axiosClient.post("/auth/login", {
    phone,
    password,
  });

  // expected response:
  // { token: "...", user: { id, name, phone, role } }
  return response.data;
}

// 🔹 NEW: logout API
export async function logoutApi() {
  // interceptor নিজে থেকে Authorization: Bearer <token> পাঠাবে
  const response = await axiosClient.post("/auth/logout");
  return response.data; // { message, user, timestamp } ইত্যাদি
}

