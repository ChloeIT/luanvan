// src/store/user/slice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchAllUser } from "./thunk";

export const { actions: userAction, reducer: userReducer } = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
    message: "",
  },
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },

    // ✅ FIX: merge user cũ + user mới, không overwrite làm mất fullName/fullname
    updateUsers: (state, action) => {
      const updated = action.payload;
      state.users = state.users.map((u) => {
        if (u.id !== updated.id) return u;

        const nextName =
          updated.fullName ||
          updated.fullname ||
          u.fullName ||
          u.fullname ||
          "";

        return {
          ...u,
          ...updated,
          fullName: nextName,
          fullname: nextName,
        };
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
