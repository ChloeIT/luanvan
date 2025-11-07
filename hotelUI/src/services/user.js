// src/services/user.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API;
const auth = () => authServices?.authHeader?.() || {};

export const userServices = {
  getAll: () =>
    axios.get(`${API_URL}/api/user/all`, { headers: auth() }),

  edit: (id, payload) => {
    const isFormData = payload instanceof FormData;
    const url = isFormData
      ? `${API_URL}/api/user/edit/${id}/avatar`
      : `${API_URL}/api/user/edit/${id}`;

    return axios.put(url, payload, {
      headers: {
        ...auth(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
  },

  delete: (id) =>
    axios.delete(`${API_URL}/api/user/delete/${id}`, { headers: auth() }),

  // DÙNG FormData, để Axios tự set Content-Type + boundary
  create: (data) => {
    const final_data = Object.fromEntries(data.entries());
    const fd = new FormData();
    fd.append("fullName", final_data.fullName ?? "");
    fd.append("phone", String(final_data.phone ?? ""));     // backend parseInt → gửi chuỗi số
    fd.append("email", final_data.email ?? "");
    fd.append("username", final_data.username ?? "");
    fd.append("password", final_data.password ?? "");
    fd.append("gender", final_data.gender ?? "");
    fd.append("address", final_data.address ?? "");
    console.log(final_data.roles)
    const roles = JSON.parse(final_data.roles || "[]");

    roles.forEach((r) => fd.append("roles", r));
    const debug_data = Object.fromEntries(data.entries());
    // file là bắt buộc theo backend bạn gửi
    if (final_data.file instanceof File) {
      fd.append("file", final_data.file);   // KEY PHẢI LÀ "file"
    }
    console.log(auth())
    return axios.post(`${API_URL}/api/user/create`, fd, {
      headers: { ...auth() },         // KHÔNG set Content-Type ở đây
    });
  },
};
