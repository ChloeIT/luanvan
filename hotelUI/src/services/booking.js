// src/services/booking.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API || "http://localhost:8080";

export const bookingServices = {
  // ADMIN only (giữ nguyên)
  getAll: () =>
    axios.get(`${API_URL}/api/booking/all`, {
      headers: authServices.authHeader(),
    }),

  // ✅ LOGIN REQUIRED: dùng cho trang /review
  getReviews: () =>
    axios.get(`${API_URL}/api/booking/reviews`, {
      headers: authServices.authHeader(),
    }),

  edit: (id, updatedBooking) =>
    axios.put(`${API_URL}/api/booking/edit/${id}`, updatedBooking, {
      headers: authServices.authHeader(),
    }),

  delete: (id) =>
    axios.delete(`${API_URL}/api/booking/delete/${id}`, {
      headers: authServices.authHeader(),
    }),

  create: (newBooking) =>
    axios.post(`${API_URL}/api/booking/create`, newBooking, {
      headers: authServices.authHeader(),
    }),
};
