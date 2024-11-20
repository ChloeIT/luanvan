import { createAsyncThunk } from "@reduxjs/toolkit";
import { authServices } from "../../services";

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authServices.login(username, password);
      console.log(response.data);
      if (response.data.accessToken) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await authServices.register(username, email, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
