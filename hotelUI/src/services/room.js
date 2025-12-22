// src/services/room.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API; // vd: http://localhost:8080

export const roomServices = {
  getAll: () => axios.get(API_URL + "/api/room/all"),

  create: (formData) =>
    axios.post(API_URL + "/api/room/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...authServices.authHeader(),
      },
    }),

  edit: (id, roomUpdate) =>
    axios.put(API_URL + `/api/room/edit/${id}`, roomUpdate, {
      headers: authServices.authHeader(),
    }),

  // ✅ NEW: toggle availability (avai)
  setAvailability: (id, value) =>
    axios.patch(API_URL + `/api/room/${id}/availability?value=${value}`, null, {
      headers: authServices.authHeader(),
    }),

  // (có thể giữ để phòng khi cần, nhưng UI sẽ không dùng nữa)
  delete: (id) =>
    axios.delete(API_URL + `/api/room/delete/${id}`, {
      headers: authServices.authHeader(),
    }),
};
