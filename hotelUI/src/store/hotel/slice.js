import { createSlice } from "@reduxjs/toolkit";
import { fetchAllHotel } from "./thunk";

export const { actions: hotelAction, reducer: hotelReducer } = createSlice({
  name: "hotel",
  initialState: {
    hotels: [],
    loading: false,
    error: null,
    message: "",
  },
  reducers: {
    setHotels: (state, action) => {
      state.hotels = action.payload;
    },
    updateHotels: (state, action) => {
      const updateHotel = action.payload;
      state.hotels = state.hotels.map((hotel) =>
        hotel.id === updateHotel.id ? updateHotel : hotel
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })
      .addCase(fetchAllHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
