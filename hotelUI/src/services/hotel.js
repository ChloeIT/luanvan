import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API;

export const hotelServices = {
  getAll: () => {
    return axios.get(API_URL + "/api/hotel/all");
  },
  edit: (id, hotelUpdate) => {
    return axios.put(API_URL + `/api/hotel/edit/${id}`, hotelUpdate, {
      headers: authServices.authHeader(),
    });
  },
  delete: (id) => {
    return axios.delete(API_URL + `/api/hotel/delete/${id}`, {
      headers: authServices.authHeader(),
    });
  },
  create: (formData) => {
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    return axios.post(API_URL + "/api/hotel/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...authServices.authHeader(), // Đảm bảo authHeader cung cấp token đúng
      },
    });
  },
};
