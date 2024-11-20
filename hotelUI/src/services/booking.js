import axios from "axios";
import { authServices } from "./auth";
const API_URL = import.meta.env.VITE_HOTEL_API;

export const bookingServices = {
  getAll: () => {
    return axios.get(API_URL + "/api/booking/all");
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
  create: (newBooking) => {
    return axios.post(API_URL + "/api/booking/create", newBooking, {
      headers: authServices.authHeader(),
    });
  },
};
