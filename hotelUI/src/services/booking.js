// src/services/booking.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API;

export const bookingServices = {
  // 🔐 Chỉ ADMIN mới được gọi → cần token
  getAll: () => {
    return axios.get(API_URL + "/api/booking/all", {
      headers: authServices.authHeader(),
    });
  },

  edit: (id, updatedBooking) => {
    return axios.put(API_URL + `/api/booking/edit/${id}`, updatedBooking, {
      headers: authServices.authHeader(),
    });
  },

  delete: (id) => {
    return axios.delete(API_URL + `/api/booking/delete/${id}`, {
      headers: authServices.authHeader(),
    });
  },

  // ⚠️ Nếu create booking là PUBLIC (dành cho khách đặt phòng)
  create: (newBooking) => {
    return axios.post(API_URL + "/api/booking/create", newBooking, {
      headers: authServices.authHeader(), // nếu public thì xoá dòng này
    });
  },
};
