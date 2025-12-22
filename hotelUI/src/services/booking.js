// src/services/booking.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API || "http://localhost:8080";

export const bookingServices = {
  getAll: () =>
    axios.get(`${API_URL}/api/booking/all`, {
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

  // nếu create booking là public thì bỏ header, còn nếu cần login thì giữ
  create: (newBooking) =>
    axios.post(`${API_URL}/api/booking/create`, newBooking, {
      headers: authServices.authHeader(),
    }),
};
