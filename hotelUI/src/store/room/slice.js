import { createSlice } from "@reduxjs/toolkit";
import { fetchAllRoom } from "./thunk";

/** Parse date an toàn: chấp nhận "YYYY-MM-DD" hoặc ISO */
const toDateSafe = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Chuẩn hoá 1 room:
 * - Đảm bảo discountPercent (mặc định 0)
 * - Tính discountActive nếu BE chưa gửi
 * - Tính finalPrice nếu BE chưa gửi
 */
const normalizeRoom = (room) => {
  if (!room) return room;

  // ✅ dùng ?? để giữ đúng giá trị 0
  const discountPercent = room.discountPercent ?? 0;

  // ✅ Nếu BE đã gửi discountActive thì dùng luôn
  let discountActive = room.discountActive;

  if (discountActive === undefined || discountActive === null) {
    if (!discountPercent || discountPercent <= 0) {
      discountActive = false;
    } else {
      const today = new Date();
      const start = toDateSafe(room.discountStart);
      const end = toDateSafe(room.discountEnd);

      let isActive = true;
      if (start && today < start) isActive = false;
      if (end && today > end) isActive = false;

      discountActive = isActive;
    }
  }

  // ✅ finalPrice: dùng của BE nếu có
  const priceNum = Number(room.price || 0);
  const finalPrice =
    room.finalPrice ??
    (discountActive
      ? (priceNum * (100 - Number(discountPercent || 0))) / 100
      : priceNum);

  return {
    ...room,
    price: priceNum,
    discountPercent: Number(discountPercent || 0),
    discountActive: Boolean(discountActive),
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

    // ✅ update 1 room
    updateRooms: (state, action) => {
      const updated = normalizeRoom(action.payload);
      if (!updated?.id) return;

      const idx = state.rooms.findIndex(
        (r) => String(r.id) === String(updated.id)
      );

      if (idx >= 0) {
        state.rooms[idx] = updated;
      } else {
        // nếu chưa có trong list thì thêm vào (optional)
        state.rooms.unshift(updated);
      }
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
