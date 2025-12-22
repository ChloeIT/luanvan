// src/services/room.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API; // ví dụ: http://localhost:8080

export const roomServices = {
  // ===================== GET =====================
  getAll: () => {
    return axios.get(API_URL + "/api/room/all");
  },

  // ===================== CREATE =====================
  create: (formData) => {
    return axios.post(API_URL + "/api/room/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...authServices.authHeader(),
      },
    });
  },

  // ===================== EDIT =====================
  edit: (id, roomUpdate) => {
    return axios.put(API_URL + `/api/room/edit/${id}`, roomUpdate, {
      headers: authServices.authHeader(),
    });
  },

  // ===================== DELETE (KHÔNG DÙNG NỮA NHƯNG GIỮ LẠI) =====================
  delete: (id) => {
    return axios.delete(API_URL + `/api/room/delete/${id}`, {
      headers: authServices.authHeader(),
    });
  },

  // ===================== ⭐ NEW: TOGGLE AVAILABILITY =====================
  // PATCH /api/room/{id}/availability?value=true|false
  setAvailability: (id, value) => {
    return axios.patch(API_URL + `/api/room/${id}/availability`, null, {
      params: { value }, // true / false
      headers: authServices.authHeader(),
    });
  },
};
