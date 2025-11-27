// src/store/favorite/slice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchAllFavorite } from "./thunk";

const initialState = {
  favorites: [],      // tất cả favorite (nếu bạn dùng)
  myFavorite: [],     // favorite của user đang login → LUÔN là array
  loading: false,
  error: null,
  message: "",
};

export const { actions: favoriteAction, reducer: favoriteReducer } = createSlice({
  name: "favorite",
  initialState,
  reducers: {
    setFavorites: (state, action) => {
      state.favorites = Array.isArray(action.payload) ? action.payload : [];
    },
    setMyFavorite: (state, action) => {
      state.myFavorite = Array.isArray(action.payload) ? action.payload : [];
    },
    updateFavorites: (state, action) => {
      const updateFavorite = action.payload;
      state.favorites = state.favorites.map((favorite) =>
        favorite.id === updateFavorite.id ? updateFavorite : favorite
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFavorite.fulfilled, (state, action) => {
        state.loading = false;
        // đảm bảo luôn là array
        const data = Array.isArray(action.payload) ? action.payload : [];
        state.favorites = data;
        state.myFavorite = data; // nếu bạn đang dùng myFavorite cho user hiện tại
      })
      .addCase(fetchAllFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Failed to load favorites";
        // khi lỗi (401, 500, ...) giữ state là array rỗng để .map/.find không crash
        state.favorites = [];
        state.myFavorite = [];
      });
  },
});
