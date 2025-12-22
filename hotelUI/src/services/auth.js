// src/services/auth.js
import axios from "axios";

const API_URL = import.meta.env.VITE_HOTEL_API || "http://localhost:8080";

/** Lưu user an toàn: merge và luôn giữ accessToken nếu response không có */
const persistUserSafe = (incoming) => {
  let prev = {};
  try {
    prev = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    prev = {};
  }

  if (!incoming) return prev;

  const merged = {
    ...prev,
    ...incoming,
    accessToken: incoming?.accessToken ?? prev?.accessToken, // ✅ giữ token
  };

  try {
    localStorage.setItem("user", JSON.stringify(merged));
  } catch {}

  return merged;
};

export const authServices = {
  register: (username, email, password) =>
    axios.post(`${API_URL}/api/auth/signup`, { username, email, password }),

  /**
   * Login: chỉ service này chịu trách nhiệm lưu localStorage.user
   * -> tránh chỗ khác overwrite làm mất token
   */
  login: async (username, password) => {
    const res = await axios.post(`${API_URL}/api/auth/signin`, {
      username,
      password,
    });
    if (res?.data) persistUserSafe(res.data);
    return res;
  },

  authHeader: () => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }

    const token =
      user?.accessToken ||
      user?.token ||
      user?.jwt ||
      user?.stsTokenManager?.accessToken ||
      null;

    return token && String(token).trim()
      ? { Authorization: `Bearer ${token}` }
      : {};
  },

  logout: () => {
    localStorage.removeItem("user");
    return axios.post(`${API_URL}/api/auth/signout`);
  },

  // (tuỳ chọn) export helper nếu bạn muốn dùng ở nơi khác
  persistUserSafe,
};
