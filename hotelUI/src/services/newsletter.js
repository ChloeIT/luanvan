// src/services/newsletter.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API || "";

export const newsletterService = {
  /** KHÁCH: đăng ký từ footer */
  subscribe(email) {
    return axios.post(`${API_URL}/api/newsletter/subscribe`, { email });
  },

  /** ADMIN: lấy toàn bộ subscriber */
  getAllAdmin() {
    return axios.get(`${API_URL}/api/newsletter/admin/all`, {
      headers: authServices.authHeader(),
    });
  },

  /** ADMIN: xoá 1 subscriber */
  deleteAdmin(id) {
    return axios.delete(`${API_URL}/api/newsletter/admin/${id}`, {
      headers: authServices.authHeader(),
    });
  },

  /** ADMIN: gửi mail khuyến mãi
   * body = { subject, content, ids: [1,2,3] }
   *  - nếu ids = [] hoặc không gửi => BE sẽ gửi cho TẤT CẢ
   */
  sendPromo(body) {
    return axios.post(`${API_URL}/api/newsletter/admin/send`, body, {
      headers: authServices.authHeader(),
    });
  },
};
