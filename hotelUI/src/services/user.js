import axios from "axios";
import { authServices } from "./auth";
const API_URL = import.meta.env.VITE_HOTEL_API;

export const userServices = {
  getAll: () => {
    return axios.get(API_URL + "/api/user/all");
  },
  edit: (id, userUpdate) => {
    return axios.put(API_URL + `/api/user/edit/${id}`, userUpdate, {
      headers: authServices.authHeader(),
    });
  },
  delete: (id) => {
    return axios.delete(API_URL + `/api/user/delete/${id}`, {
      headers: authServices.authHeader(),
    });
  },
  create: (formData) => {
    return axios.post(API_URL + "/api/user/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...authServices.authHeader(), // Đảm bảo authHeader cung cấp token đúng
      },
    });
  },
};
