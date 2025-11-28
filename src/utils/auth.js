// src/utils/auth.js

const AUTH_KEY = "ibacos_auth";

export const saveAuth = ({ token, user }) => {
  if (!token || !user) return;
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      token,
      user,
    })
  );
};

export const getAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse auth from storage", e);
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const getUserRole = () => {
  const auth = getAuth();
  return auth?.user?.role || null; // CALL_CENTER | DISPATCHER | ADMIN
};

export const isAuthenticated = () => {
  const auth = getAuth();
  return !!auth?.token;
};
