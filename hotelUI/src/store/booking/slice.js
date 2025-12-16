// src/store/booking/slice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchAllBooking } from "./thunk";

/* ===================== Persist helpers ===================== */
const CART_KEY = "sb_booking_cart_v2";
const SELECTED_KEY = "sb_booking_selected_v2";
const LOCKED_HOTEL_KEY = "sb_booking_locked_hotel_v2";

const safeParse = (raw, fallback) => {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
};

const loadArr = (key) => {
  const raw = localStorage.getItem(key);
  const parsed = raw ? safeParse(raw, []) : [];
  return Array.isArray(parsed) ? parsed : [];
};

const saveArr = (key, arr) => {
  try {
    localStorage.setItem(key, JSON.stringify(arr || []));
  } catch {}
};

const loadLockedHotelId = () => {
  const raw = localStorage.getItem(LOCKED_HOTEL_KEY);
  const v = raw ? safeParse(raw, null) : null;
  return v ?? null;
};

const saveLockedHotelId = (hotelId) => {
  try {
    localStorage.setItem(LOCKED_HOTEL_KEY, JSON.stringify(hotelId ?? null));
  } catch {}
};

/* ===================== Helpers ===================== */
const calcNights = (checkIn, checkOut) => {
  const inD = new Date(checkIn);
  const outD = new Date(checkOut);
  const diff = Math.ceil((outD - inD) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

const todayStr = () => new Date().toISOString().split("T")[0];
const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const getRoomHotelId = (room) =>
  room?.hotelId ?? room?.hotel?.id ?? room?.hotel?.hotelId ?? null;

const normalizeId = (v) => (v == null ? "" : String(v));

const computeLockedHotelIdFromSelected = (cart, selectedIds) => {
  const selectedSet = new Set(selectedIds.map(normalizeId));
  const first = cart.find((x) => selectedSet.has(normalizeId(x.roomId)));
  return first?.hotelId ?? null;
};

/* ===================== Slice ===================== */
export const { actions: bookingAction, reducer: bookingReducer } = createSlice({
  name: "booking",
  initialState: {
    // ===== Bookings from API =====
    bookings: [],
    loading: false,
    error: null,

    // UI message for toast/alert (antd message, Modal, Alert...)
    message: "",

    // ===== CART (multi-room) =====
    cart: loadArr(CART_KEY), // [{ roomId, room, hotelId, ... }]
    selectedIds: loadArr(SELECTED_KEY), // [roomId, ...]
    lockedHotelId: loadLockedHotelId(), // hotelId currently "locked" for checkout
  },

  reducers: {
    /* ===== utils ===== */
    clearMessage: (state) => {
      state.message = "";
    },

    /* ===== Bookings list (keep) ===== */
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },

    updateBookings: (state, action) => {
      const updatedBooking = action.payload;
      state.bookings = state.bookings.map((booking) =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      );
    },

    /* ===================== CART ACTIONS ===================== */

    // Add room to cart (if exists -> update)
    // payload: { room, checkIn?, checkOut?, hotelName?, hotelAddress? }
    addToCart: (state, action) => {
      state.message = "";

      const room = action.payload?.room;
      if (!room?.id) return;

      const checkIn = action.payload?.checkIn || todayStr();
      const checkOut = action.payload?.checkOut || tomorrowStr();

      const nights = calcNights(checkIn, checkOut);
      const totalPrice = (room.price || 0) * nights;

      const hotelName =
        action.payload?.hotelName ||
        room?.hotelName ||
        room?.hotel?.name ||
        "Unknown";

      const hotelAddress =
        action.payload?.hotelAddress ||
        room?.hotelAddress ||
        room?.hotel?.address ||
        "Unknown";

      const hotelId = getRoomHotelId(room);

      const idx = state.cart.findIndex(
        (x) => normalizeId(x.roomId) === normalizeId(room.id)
      );

      const nextItem = {
        roomId: room.id,
        room, // keep full room for rendering
        hotelId, // important for "same hotel" rule
        checkIn,
        checkOut,
        nights,
        totalPrice,

        image: room.image,
        name: room.name,
        price: room.price,
        capacity: room.capacity,
        hotelName,
        hotelAddress,
      };

      if (idx >= 0) state.cart[idx] = { ...state.cart[idx], ...nextItem };
      else state.cart.unshift(nextItem);

      // Auto-select like e-commerce cart, but respect "same hotel" rule
      const alreadySelected = state.selectedIds.some(
        (id) => normalizeId(id) === normalizeId(room.id)
      );

      if (!alreadySelected) {
        // If nothing selected yet -> lock to this hotel and select it
        if (!state.lockedHotelId && state.selectedIds.length === 0) {
          state.lockedHotelId = hotelId ?? null;
          state.selectedIds.push(room.id);
        } else {
          // If locked and different hotel -> do not auto-select
          if (
            state.lockedHotelId != null &&
            hotelId != null &&
            normalizeId(state.lockedHotelId) !== normalizeId(hotelId)
          ) {
            state.message =
              "You can only check out rooms from the same hotel. Please deselect rooms from other hotels.";
          } else {
            // Same hotel / lock not set clearly -> select and set lock if needed
            if (!state.lockedHotelId) state.lockedHotelId = hotelId ?? null;
            state.selectedIds.push(room.id);
          }
        }
      }

      saveArr(CART_KEY, state.cart);
      saveArr(SELECTED_KEY, state.selectedIds);
      saveLockedHotelId(state.lockedHotelId);
    },

    // Update dates in cart
    // payload: { roomId, checkIn, checkOut }
    updateCartDates: (state, action) => {
      const { roomId, checkIn, checkOut } = action.payload || {};
      if (!roomId) return;

      const idx = state.cart.findIndex(
        (x) => normalizeId(x.roomId) === normalizeId(roomId)
      );
      if (idx < 0) return;

      const room = state.cart[idx].room;
      const nights = calcNights(checkIn, checkOut);
      const totalPrice = (room?.price || 0) * nights;

      state.cart[idx] = {
        ...state.cart[idx],
        checkIn,
        checkOut,
        nights,
        totalPrice,
      };

      saveArr(CART_KEY, state.cart);
    },

    // Remove item from cart
    removeFromCart: (state, action) => {
      const roomId = action.payload;

      state.cart = state.cart.filter(
        (x) => normalizeId(x.roomId) !== normalizeId(roomId)
      );
      state.selectedIds = state.selectedIds.filter(
        (id) => normalizeId(id) !== normalizeId(roomId)
      );

      // Recompute lock
      state.lockedHotelId = computeLockedHotelIdFromSelected(
        state.cart,
        state.selectedIds
      );

      saveArr(CART_KEY, state.cart);
      saveArr(SELECTED_KEY, state.selectedIds);
      saveLockedHotelId(state.lockedHotelId);
    },

    // Toggle select for checkout (same hotel rule)
    toggleSelect: (state, action) => {
      state.message = "";

      const roomId = action.payload;
      if (!roomId) return;

      const exists = state.selectedIds.some(
        (id) => normalizeId(id) === normalizeId(roomId)
      );

      if (exists) {
        // Unselect
        state.selectedIds = state.selectedIds.filter(
          (id) => normalizeId(id) !== normalizeId(roomId)
        );
        // If none selected -> unlock; else -> lock based on first selected
        state.lockedHotelId = computeLockedHotelIdFromSelected(
          state.cart,
          state.selectedIds
        );
      } else {
        // Select -> validate hotel rule
        const item = state.cart.find(
          (x) => normalizeId(x.roomId) === normalizeId(roomId)
        );
        const hotelId = item?.hotelId ?? null;

        // If nothing selected -> lock to this hotel and select it
        if (!state.lockedHotelId || state.selectedIds.length === 0) {
          state.lockedHotelId = hotelId ?? null;
          state.selectedIds.push(roomId);
        } else {
          // Different hotel -> block
          if (
            state.lockedHotelId != null &&
            hotelId != null &&
            normalizeId(state.lockedHotelId) !== normalizeId(hotelId)
          ) {
            state.message =
              "You can only check out rooms from the same hotel. Please deselect rooms from other hotels.";
          } else {
            state.selectedIds.push(roomId);
          }
        }
      }

      saveArr(SELECTED_KEY, state.selectedIds);
      saveLockedHotelId(state.lockedHotelId);
    },

    // Select all (only within the locked hotel)
    selectAll: (state) => {
      state.message = "";

      if (!state.cart.length) {
        state.selectedIds = [];
        state.lockedHotelId = null;
        saveArr(SELECTED_KEY, state.selectedIds);
        saveLockedHotelId(state.lockedHotelId);
        return;
      }

      // If not locked yet -> lock to the first item hotel
      const lock = state.lockedHotelId ?? state.cart[0]?.hotelId ?? null;
      state.lockedHotelId = lock;

      // Select only rooms from the same hotel
      const next = state.cart
        .filter((x) => normalizeId(x.hotelId) === normalizeId(lock))
        .map((x) => x.roomId);

      state.selectedIds = next;

      // If there are rooms from other hotels -> gentle notice
      const hasOther = state.cart.some(
        (x) => normalizeId(x.hotelId) !== normalizeId(lock)
      );
      if (hasOther) {
        state.message =
          "Some rooms belong to a different hotel and were not selected. You can only check out rooms from the same hotel.";
      }

      saveArr(SELECTED_KEY, state.selectedIds);
      saveLockedHotelId(state.lockedHotelId);
    },

    // Clear all selected
    clearSelected: (state) => {
      state.selectedIds = [];
      state.lockedHotelId = null;
      saveArr(SELECTED_KEY, state.selectedIds);
      saveLockedHotelId(state.lockedHotelId);
    },

    // Clear entire cart
    clearCart: (state) => {
      state.cart = [];
      state.selectedIds = [];
      state.lockedHotelId = null;
      state.message = "";
      saveArr(CART_KEY, state.cart);
      saveArr(SELECTED_KEY, state.selectedIds);
      saveLockedHotelId(state.lockedHotelId);
    },

    // Optional: sync lock on app mount
    hydrateLockFromSelected: (state) => {
      state.lockedHotelId = computeLockedHotelIdFromSelected(
        state.cart,
        state.selectedIds
      );
      saveLockedHotelId(state.lockedHotelId);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchAllBooking.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Fetch bookings failed";
      });
  },
});
