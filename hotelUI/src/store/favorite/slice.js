import { createSlice } from "@reduxjs/toolkit";
import { fetchAllFavorite } from './thunk';

export const { actions: favoriteAction, reducer: favoriteReducer } = createSlice({
  name: "favorite",
  initialState: {
    favorites: [],
    myFavorite: null,
    loading: false,
    error: null,
    message: "",
  },
  reducers: {
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    setMyFavorite: (state, action) => {
        state.myFavorite = action.payload;
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
      .addCase(fetchAllFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchAllFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
