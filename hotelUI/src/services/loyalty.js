// src/services/loyalty.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API || "http://localhost:8080";

export const loyaltyService = {
  async getMyLoyalty() {
    const headers = authServices.authHeader();
    const res = await axios.get(`${API_URL}/api/loyalty/me`, { headers });
    return res.data; // { points, tier }
  },
};
