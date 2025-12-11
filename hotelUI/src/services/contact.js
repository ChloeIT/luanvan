// src/services/contact.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API;

export const contactServices = {
  /* ========= USER SIDE ========= */

  // Gửi contact từ trang Contact Us
  create(payload) {
    return axios.post(`${API_URL}/api/contact`, payload, {
      headers: authServices.authHeader(),
    });
  },

  // Lấy các contact của chính mình (dùng cho Profile sau này)
  getMyMessages() {
    return axios.get(`${API_URL}/api/contact/my`, {
      headers: authServices.authHeader(),
    });
  },

  /* ========= ADMIN SIDE ========= */

  // ADMIN: lấy tất cả contact
  getAllAdmin() {
    return axios.get(`${API_URL}/api/contact/admin/all`, {
      headers: authServices.authHeader(),
    });
  },

  // ADMIN: cập nhật status contact (PENDING / DONE) bằng dropdown
  updateStatusAdmin(id, status) {
    return axios.put(`${API_URL}/api/contact/${id}/status`, null, {
      params: { status },
      headers: authServices.authHeader(),
    });
  },

  // ADMIN: reply contact → BE lưu adminReply + set DONE
  replyAdmin(id, reply) {
    return axios.put(
      `${API_URL}/api/contact/${id}/reply`,
      { reply },
      {
        headers: authServices.authHeader(),
      }
    );
  },
};
