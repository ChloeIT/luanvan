// src/services/favorite.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API;

export const favoriteServices = {
  // 🔐 Admin-only
  getAll: () => {
    return axios.get(API_URL + "/api/favorite/all", {
      headers: authServices.authHeader(),
    });
  },

  // Lấy favorite của user đang login
  getMy: () => {
    return axios.get(API_URL + "/api/favorite/my", {
      headers: authServices.authHeader(),
    });
  },

  // Lấy 1 favorite theo ID
  getById: (id) => {
    return axios.get(API_URL + `/api/favorite/${id}`, {
      headers: authServices.authHeader(),
    });
  },

  // Thêm room vào favorite
  addRoom: (favoriteId, roomId) => {
    return axios.post(
      API_URL + `/api/favorite/${favoriteId}/add/${roomId}`,
      {},
      { headers: authServices.authHeader() }
    );
  },

  // Xoá phòng khỏi favorite
  removeRoom: (favoriteId, roomId) => {
    return axios.post(
      API_URL + `/api/favorite/${favoriteId}/remove/${roomId}`,
      {},
      { headers: authServices.authHeader() }
    );
  },
};
