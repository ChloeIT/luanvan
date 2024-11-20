import { createSlice } from "@reduxjs/toolkit";
import { fetchAllBooking } from "./thunk";

export const { actions: bookingAction, reducer: bookingReducer } = createSlice({
  name: "booking",
  initialState: {
    bookings: [],
    loading: false,
    error: null,
    message: "",
  },
  reducers: {
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    updateBookings: (state, action) => {
      const updateBooking = action.payload;
      state.bookings = state.bookings.map((booking) =>
        booking.id === updateBooking.id ? updateBooking : booking
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchAllBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
