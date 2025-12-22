// src/services/user.js
import axios from "axios";
import { authServices } from "./auth";

const API_URL = import.meta.env.VITE_HOTEL_API || "http://localhost:8080";
const auth = () => authServices?.authHeader?.() || {};

// ===== Helpers =====
const pickName = (body = {}) => {
  const raw =
    body.full_name ?? body.fullName ?? body.fullname ?? body.full_name;
  return String(raw ?? "").trim();
};

const mapUserToBE_JSON = (body = {}) => {
  const name = pickName(body);

  const payload = {
    ...body,
    phone:
      body.phone === null || body.phone === undefined
        ? ""
        : String(body.phone).trim(),
    address:
      body.address === null || body.address === undefined
        ? ""
        : String(body.address).trim(),
    birthDate: body.birthDate ?? null,
    gender: body.gender ?? null,
  };

  // ✅ name: chỉ set nếu có giá trị
  if (name) {
    payload.full_name = name; // ✅ đúng DB
    payload.fullName = name; // compat
    payload.fullname = name; // compat
  }

  return payload;
};

const mapUserToBE_FormData = (formDataOrObj) => {
  // Nếu bạn đang gửi FormData từ AdAddUser
  if (formDataOrObj instanceof FormData) {
    const name =
      (
        formDataOrObj.get("full_name") ||
        formDataOrObj.get("fullName") ||
        formDataOrObj.get("fullname") ||
        ""
      )
        ?.toString?.()
        .trim?.() || "";

    // ✅ đảm bảo có full_name trong formData
    if (name) {
      if (!formDataOrObj.get("full_name")) formDataOrObj.set("full_name", name);
      if (!formDataOrObj.get("fullName")) formDataOrObj.set("fullName", name);
      if (!formDataOrObj.get("fullname")) formDataOrObj.set("fullname", name);
    }
    return formDataOrObj;
  }

  // Nếu vô tình truyền object vào create
  const name = pickName(formDataOrObj);
  const fd = new FormData();
  Object.entries(formDataOrObj || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  if (name) {
    fd.set("full_name", name);
    fd.set("fullName", name);
    fd.set("fullname", name);
  }
  return fd;
};

export const userServices = {
  getAll: () => axios.get(`${API_URL}/api/user/all`, { headers: auth() }),

  // ✅ EDIT (JSON)
  edit: (id, body) =>
    axios.put(`${API_URL}/api/user/edit/${id}`, mapUserToBE_JSON(body), {
      headers: { ...auth(), "Content-Type": "application/json" },
    }),

  // ✅ CREATE (FormData)
  create: (formData) =>
    axios.post(`${API_URL}/api/user/create`, mapUserToBE_FormData(formData), {
      headers: { ...auth() },
    }),

  updateAvatar: (id, formData) =>
    axios.put(`${API_URL}/api/user/edit/${id}/avatar`, formData, {
      headers: { ...auth() },
    }),

  delete: (id) =>
    axios.delete(`${API_URL}/api/user/delete/${id}`, { headers: auth() }),
};
