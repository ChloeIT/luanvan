import { createSlice } from "@reduxjs/toolkit";
import { fetchAllRoom } from "./thunk";

/**
 * Chuẩn hoá 1 room:
 * - Đảm bảo có discountPercent (mặc định 0)
 * - Tính discountActive nếu BE chưa gửi
 * - Tính finalPrice nếu BE chưa gửi
 */
const normalizeRoom = (room) => {
  if (!room) return room;

  const discountPercent = room.discountPercent || 0;

  // Nếu BE đã gửi discountActive thì dùng luôn
  let discountActive = room.discountActive;

  if (discountActive === undefined || discountActive === null) {
    // Tự tính theo ngày + percent
    if (!discountPercent || discountPercent <= 0) {
      discountActive = false;
    } else {
      const today = new Date();
      const start = room.discountStart ? new Date(room.discountStart) : null;
      const end = room.discountEnd ? new Date(room.discountEnd) : null;

      let isActive = true;

      if (start && today < start) isActive = false;
      if (end && today > end) isActive = false;

      discountActive = isActive;
    }
  }

  // Nếu BE đã gửi finalPrice thì dùng luôn, không thì tự tính
  const finalPrice =
    room.finalPrice ??
    (discountActive
      ? (room.price * (100 - discountPercent)) / 100
      : room.price);

  return {
    ...room,
    discountPercent,
    discountActive,
    finalPrice,
  };
};

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
      state.rooms = (action.payload || []).map(normalizeRoom);
    },
    updateRooms: (state, action) => {
      const updateRoom = normalizeRoom(action.payload);
      state.rooms = state.rooms.map((room) =>
        room.id === updateRoom.id ? updateRoom : room
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = (action.payload || []).map(normalizeRoom);
      })
      .addCase(fetchAllRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch rooms";
      });
  },
});
