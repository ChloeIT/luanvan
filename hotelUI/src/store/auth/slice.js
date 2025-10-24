// src/store/auth/slice.js
import { createSlice } from "@reduxjs/toolkit";
import { login, register } from "./thunk";

const persistedUser = (() => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
})();

export const { actions: authAction, reducer: authReducer } = createSlice({
  name: "auth",
  initialState: {
    user: persistedUser,          // ✅ hydrate từ localStorage
    loading: false,
    error: null,
    message: "",
  },
  reducers: {
    setUser: (state, action) => { // ✅ sửa chính tả
      state.user = action.payload || null;
      try { localStorage.setItem("user", JSON.stringify(state.user)); } catch {}
    },
    // (tuỳ chọn) gộp user thay vì ghi đè
    // mergeUser: (state, action) => {
    //   state.user = { ...(state.user || {}), ...(action.payload || {}) };
    //   try { localStorage.setItem("user", JSON.stringify(state.user)); } catch {}
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false; state.message = action.payload; state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload;         // ✅ cập nhật store
        try { localStorage.setItem("user", JSON.stringify(action.payload)); } catch {}
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });
  },
});
