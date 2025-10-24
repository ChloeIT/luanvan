import axios from "axios";
const API_URL = import.meta.env.VITE_HOTEL_API;

export const authServices = {
  register: (username, email, password) => {
    return axios.post(API_URL + "/api/auth/signup", {
      username,
      email,
      password,
    });
  },
  login: (username, password) => {
    return axios.post(API_URL + "/api/auth/signin", {
      username,
      password,
    });
  },
    authHeader: () => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch (_) {
      user = null;
    }
    const token =
      user?.accessToken ??
      user?.stsTokenManager?.accessToken ??
      null;

    // chỉ trả header nếu có token
    return token && String(token).trim()
      ? { Authorization: `Bearer ${token}` }
      : {};
  },
  logout: () => {
    localStorage.removeItem("user");

    return axios.post(API_URL + "/api/auth/signout");
  },
};
