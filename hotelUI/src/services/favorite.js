import axios from "axios";
import { authServices } from "./auth";
const API_URL = import.meta.env.VITE_HOTEL_API;

export const favoriteServices = {
  getAll: () => {
    return axios.get(API_URL + "/api/favorite/all");
  },
  create: () => {
    return axios.post(API_URL + "/api/favorite/create", {
      headers: authServices.authHeader(),
    });
  },
  getById: (id) => {
    return axios.get(API_URL + `/api/favorite/${id}`);
  },
  addRoom: (roomId, favoriteId) => {
    return axios.post(API_URL + `/api/favorite/${favoriteId}/add/${roomId}`);
  },
  removeRoom: (roomId, favoriteId) => {
    return axios.post(API_URL + `/api/favorite/${favoriteId}/remove/${roomId}`);
  },
};
