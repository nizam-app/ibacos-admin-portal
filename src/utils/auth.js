// src/utils/auth.js

export const saveAuth = ({ token, user }) => {
  if (!token || !user) return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getAuth = () => {
  try {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    if (!token || !rawUser) return null;
    const user = JSON.parse(rawUser);
    return { token, user };
  } catch (e) {
    console.error("Failed to parse auth from storage", e);
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getUserRole = () => {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;
    const user = JSON.parse(rawUser);
    return user?.role || null; // CALL_CENTER | DISPATCHER | ADMIN
  } catch (e) {
    console.error("Failed to get user role", e);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};
