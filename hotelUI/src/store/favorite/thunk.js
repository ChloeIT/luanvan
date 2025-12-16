// src/store/favorite/thunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { favoriteServices } from "@/services/favorite";

// ✅ lấy toàn bộ favorites (list)
export const fetchAllFavorite = createAsyncThunk(
  "favorite/fetchAllFavorite",
  async (_, { rejectWithValue }) => {
    try {
      const res = await favoriteServices.getAll(); // GET /api/favorite/all
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Fetch favorites failed"
      );
    }
  }
);

// ✅ lấy favorite của user hiện tại (object)
export const fetchMyFavorite = createAsyncThunk(
  "favorite/fetchMyFavorite",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await favoriteServices.getAll();
      const list = Array.isArray(res.data) ? res.data : [];
      const mine =
        list.find((f) => String(f?.user?.id) === String(userId)) || null;
      return mine;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Fetch my favorite failed"
      );
    }
  }
);

// ✅ (OPTION) đảm bảo user có favorite (nếu chưa có thì create)
export const ensureMyFavorite = createAsyncThunk(
  "favorite/ensureMyFavorite",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      // thử fetch
      const mine = await dispatch(fetchMyFavorite(userId)).unwrap();
      if (mine?.id) return mine;

      // chưa có -> create rồi fetch lại
      await favoriteServices.create(); // POST /api/favorite/create
      const mine2 = await dispatch(fetchMyFavorite(userId)).unwrap();
      return mine2;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Ensure my favorite failed"
      );
    }
  }
);
