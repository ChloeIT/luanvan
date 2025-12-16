// src/store/favorite/slice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchAllFavorite, fetchMyFavorite, ensureMyFavorite } from "./thunk";

const initialState = {
  favorites: [], // ✅ list favorites
  myFavorite: null, // ✅ object: { id, user, rooms }
  loading: false,
  error: null,
  message: "",
};

export const { actions: favoriteAction, reducer: favoriteReducer } =
  createSlice({
    name: "favorite",
    initialState,
    reducers: {
      // set list favorites
      setFavorites: (state, action) => {
        state.favorites = Array.isArray(action.payload) ? action.payload : [];
      },

      // set my favorite (object)
      setMyFavorite: (state, action) => {
        state.myFavorite =
          action.payload && typeof action.payload === "object"
            ? action.payload
            : null;
      },

      // reset (khi logout, hoặc cần clear)
      resetFavorite: (state) => {
        state.favorites = [];
        state.myFavorite = null;
        state.loading = false;
        state.error = null;
        state.message = "";
      },

      // update 1 favorite trong list + sync nếu trùng myFavorite
      updateFavorites: (state, action) => {
        const updated = action.payload;

        if (!updated || typeof updated !== "object") return;

        state.favorites = Array.isArray(state.favorites)
          ? state.favorites.map((f) =>
              String(f?.id) === String(updated?.id) ? updated : f
            )
          : [];

        if (String(state.myFavorite?.id) === String(updated?.id)) {
          state.myFavorite = updated;
        }
      },
    },

    extraReducers: (builder) => {
      builder
        /* =========================
         FETCH ALL FAVORITES
      ========================= */
        .addCase(fetchAllFavorite.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchAllFavorite.fulfilled, (state, action) => {
          state.loading = false;
          state.favorites = Array.isArray(action.payload) ? action.payload : [];
          // ✅ không set myFavorite ở đây (vì myFavorite là object)
        })
        .addCase(fetchAllFavorite.rejected, (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            action.error?.message ||
            "Failed to load favorites";
          state.favorites = [];
        })

        /* =========================
         FETCH MY FAVORITE
      ========================= */
        .addCase(fetchMyFavorite.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchMyFavorite.fulfilled, (state, action) => {
          state.loading = false;
          state.myFavorite =
            action.payload && typeof action.payload === "object"
              ? action.payload
              : null;
        })
        .addCase(fetchMyFavorite.rejected, (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            action.error?.message ||
            "Failed to load my favorite";
          state.myFavorite = null;
        })

        /* =========================
         ENSURE MY FAVORITE
      ========================= */
        .addCase(ensureMyFavorite.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(ensureMyFavorite.fulfilled, (state, action) => {
          state.loading = false;
          state.myFavorite =
            action.payload && typeof action.payload === "object"
              ? action.payload
              : null;
        })
        .addCase(ensureMyFavorite.rejected, (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            action.error?.message ||
            "Failed to ensure my favorite";
          state.myFavorite = null;
        });
    },
  });
