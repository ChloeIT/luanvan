// src/store/auth/thunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { authServices } from "../../services";

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const res = await authServices.login(username, password);

      // ✅ authServices.login đã persist localStorage an toàn rồi
      // Chỉ return data để authSlice cập nhật redux state
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const res = await authServices.register(username, email, password);
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Register failed");
    }
  }
);
