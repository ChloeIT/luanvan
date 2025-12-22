// src/store/auth/slice.js
import { createSlice } from "@reduxjs/toolkit";
import { login, register } from "./thunk";

/** Hydrate từ localStorage */
const loadPersistedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const savePersistedUser = (user) => {
  try {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  } catch {}
};

/** ✅ Clear booking persist (cart/selected/lock + draft checkout data) */
const clearBookingPersist = () => {
  try {
    localStorage.removeItem("sb_booking_cart_v2");
    localStorage.removeItem("sb_booking_selected_v2");
    localStorage.removeItem("sb_booking_locked_hotel_v2");
    localStorage.removeItem("bookData"); // bạn set ở BookingItem -> onProceed
  } catch {}
};

export const { actions: authAction, reducer: authReducer } = createSlice({
  name: "auth",
  initialState: {
    user: loadPersistedUser(),
    loading: false,
    error: null,
    message: "",
  },
  reducers: {
    /**
     * setUser: dùng khi bạn chắc payload đã đầy đủ (vd: login),
     * nhưng vẫn an toàn: nếu payload thiếu accessToken thì giữ token cũ.
     */
    setUser: (state, action) => {
      const incoming = action.payload || null;

      if (!incoming) {
        state.user = null;
        savePersistedUser(null);
        return;
      }

      const prev = state.user || loadPersistedUser();
      const keepToken = prev?.accessToken;

      state.user = {
        ...prev, // giữ các field cũ (token, roles, ...)
        ...incoming, // cập nhật field mới
        accessToken: incoming.accessToken ?? keepToken, // ✅ giữ token nếu payload không có
      };

      savePersistedUser(state.user);
    },

    /**
     * mergeUser: dùng cho update profile/avatar
     * (chỉ cần merge field thay đổi, không bao giờ làm mất token)
     */
    mergeUser: (state, action) => {
      const patch = action.payload || {};
      const prev = state.user || loadPersistedUser() || null;

      if (!prev) return; // chưa login thì thôi

      state.user = {
        ...prev,
        ...patch,
        accessToken: prev.accessToken, // ✅ khóa token luôn giữ nguyên
      };

      savePersistedUser(state.user);
    },

    /** ✅ logout: clear auth + clear booking cart in localStorage */
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.message = "";
      savePersistedUser(null);

      // ✅ FIX: tránh dính cart của user trước
      clearBookingPersist();
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Login: payload phải có accessToken
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload || null;
        savePersistedUser(state.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
