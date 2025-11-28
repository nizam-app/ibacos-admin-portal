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

