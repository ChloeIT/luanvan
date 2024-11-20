import axios from "axios";
import { authServices } from "./auth";
const API_URL = import.meta.env.VITE_HOTEL_API;

export const roomServices = {
  getAll: () => {
    return axios.get(API_URL + "/api/room/all");
  },
  edit: (id, roomUpdate) => {
    return axios.put(API_URL + `/api/room/edit/${id}`, roomUpdate, {
      headers: authServices.authHeader(),
    });
  },
  delete: (id) => {
    return axios.delete(API_URL + `/api/room/delete/${id}`, {
      headers: authServices.authHeader(),
    });
  },
  create: (formData) => {
    return axios.post(API_URL + "/api/room/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...authServices.authHeader(), // Đảm bảo authHeader cung cấp token đúng
      },
    });
  },
};
