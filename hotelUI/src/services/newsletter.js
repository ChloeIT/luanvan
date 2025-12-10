// src/services/newsletter.js
import axios from "axios";

const API_URL = import.meta.env.VITE_HOTEL_API;

export const newsletterService = {
  subscribe(email) {
    return axios.post(`${API_URL}/api/newsletter/subscribe`, { email });
  },
};
