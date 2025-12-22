// src/services/favorite.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API || "http://localhost:8080";

export const favoriteServices = {
  getAll: () =>
    axios.get(`${API_URL}/api/favorite/all`, {
      headers: authServices.authHeader(),
    }),

  getMy: () =>
    axios.get(`${API_URL}/api/favorite/my`, {
      headers: authServices.authHeader(),
    }),

  getById: (id) =>
    axios.get(`${API_URL}/api/favorite/${id}`, {
      headers: authServices.authHeader(),
    }),

  addRoom: (favoriteId, roomId) =>
    axios.post(
      `${API_URL}/api/favorite/${favoriteId}/add/${roomId}`,
      {},
      { headers: authServices.authHeader() }
    ),

  removeRoom: (favoriteId, roomId) =>
    axios.post(
      `${API_URL}/api/favorite/${favoriteId}/remove/${roomId}`,
      {},
      { headers: authServices.authHeader() }
    ),
};
