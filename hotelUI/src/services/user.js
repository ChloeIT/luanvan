// src/services/user.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API;
const auth = () => authServices?.authHeader?.() || {};

export const userServices = {
  getAll: () =>
    axios.get(`${API_URL}/api/user/all`, { headers: auth() }),

  edit: (id, payload) => {
    const isFormData = payload instanceof FormData;
    const url = isFormData
      ? `${API_URL}/api/user/edit/${id}/avatar`
      : `${API_URL}/api/user/edit/${id}`;

    return axios.put(url, payload, {
      headers: {
        ...auth(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
  },

  delete: (id) =>
    axios.delete(`${API_URL}/api/user/delete/${id}`, { headers: auth() }),

  // Gửi đúng FormData FE đã build (có file, birthDate, roles,...)
  create: (formData) =>
    axios.post(`${API_URL}/api/user/create`, formData, {
      headers: {
        ...auth(), // KHÔNG set Content-Type, để browser tự set boundary
      },
    }),
};
