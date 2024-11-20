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
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user.accessToken || user.stsTokenManager.accessToken;
    if (user && user.accessToken) {
      return {
        Authorization: `Bearer ${token}`,
      };
    } else {
      return {};
    }
  },
  logout: () => {
    localStorage.removeItem("user");

    return axios.post(API_URL + "/api/auth/signout");
  },
};
