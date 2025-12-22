// src/services/user.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API || "http://localhost:8080";
const auth = () => authServices?.authHeader?.() || {};

export const userServices = {
  getAll: () => axios.get(`${API_URL}/api/user/all`, { headers: auth() }),

  /** Update info (JSON) */
  editInfo: (id, body) => {
    return axios.put(`${API_URL}/api/user/edit/${id}`, body, {
      headers: {
        ...auth(),
        "Content-Type": "application/json",
      },
    });
  },

  /** Update avatar (FormData) */
  updateAvatar: (id, formData) => {
    return axios.put(`${API_URL}/api/user/edit/${id}/avatar`, formData, {
      headers: {
        ...auth(),
        // ❗ không set Content-Type cho FormData để axios tự set boundary
      },
    });
  },

  delete: (id) =>
    axios.delete(`${API_URL}/api/user/delete/${id}`, { headers: auth() }),

  create: (formData) =>
    axios.post(`${API_URL}/api/user/create`, formData, {
      headers: {
        ...auth(),
        // ❗ không set Content-Type cho FormData
      },
    }),
};
