import { createAsyncThunk } from "@reduxjs/toolkit";
import { favoriteServices } from './../../services/favorite';

export const fetchAllFavorite = createAsyncThunk(
  "favorite/fetchAllFavorite",
  async () => {
    try {
      const response = await favoriteServices.getAll();
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  }
);
