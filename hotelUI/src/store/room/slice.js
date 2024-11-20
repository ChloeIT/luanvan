import { createSlice } from "@reduxjs/toolkit";
import { fetchAllRoom } from "./thunk";

export const { actions: roomAction, reducer: roomReducer } = createSlice({
  name: "room",
  initialState: {
    rooms: [],
    loading: false,
    error: null,
    message: "",
  },
  reducers: {
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    updateRooms: (state, action) => {
      const updateRoom = action.payload;
      state.rooms = state.rooms.map((room) =>
        room.id === updateRoom.id ? updateRoom : room
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchAllRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
