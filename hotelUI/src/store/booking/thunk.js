// src/store/booking/thunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { bookingServices } from "../../services";

// ADMIN ONLY - giữ nguyên
export const fetchAllBooking = createAsyncThunk(
  "booking/fetchAllBooking",
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingServices.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

// ✅ LOGIN REQUIRED - dùng cho trang /review
export const fetchAllReviews = createAsyncThunk(
  "booking/fetchAllReviews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingServices.getReviews(); // <-- cần có getReviews ở bookingServices
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);
