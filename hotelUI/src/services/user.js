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
    const fd = new FormData();
    fd.append("fullName", data.fullName ?? "");
    fd.append("phone", String(data.phone ?? ""));     // backend parseInt → gửi chuỗi số
    fd.append("email", data.email ?? "");
    fd.append("username", data.username ?? "");
    fd.append("password", data.password ?? "");
    fd.append("gender", data.gender ?? "");
    fd.append("address", data.address ?? "");
    (data.roles ?? []).forEach((r) => fd.append("roles", String(r).toLowerCase()));

    // file là bắt buộc theo backend bạn gửi
    if (data.file instanceof File) {
      fd.append("file", data.file);   // KEY PHẢI LÀ "file"
    }

    return axios.post(`${API_URL}/api/user/create`, fd, {
      headers: { ...auth() },         // KHÔNG set Content-Type ở đây
    });
  },
};
