// src/services/adminContact.js
import axios from "axios";
import { authServices } from "./auth"; // 👈 dùng authHeader đã có

const API_URL = import.meta.env.VITE_HOTEL_API;

export const adminContactService = {
  /** ADMIN: lấy tất cả contact */
  getAll() {
    return axios.get(`${API_URL}/api/contact/admin/all`, {
      headers: authServices.authHeader(),
    });
  },

  /** ADMIN: cập nhật status contact */
  updateStatus(id, status) {
    return axios.put(`${API_URL}/api/contact/${id}/status`, null, {
      params: { status },
      headers: authServices.authHeader(),
    });
  },
};
