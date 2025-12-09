// src/services/loyalty.js
import axios from "axios";
import { authServices } from "./auth"; // giống chỗ bạn dùng ở MyBookings

const API_URL = import.meta.env.VITE_HOTEL_API || "";

export const loyaltyService = {
  async getMyLoyalty() {
    // nếu bạn đang dùng authServices.authHeader() để gắn token
    const headers = authServices?.authHeader ? authServices.authHeader() : {};
    const res = await axios.get(`${API_URL}/api/loyalty/me`, { headers });
    return res.data; // { points, tier }
  },
};
