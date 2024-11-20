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
    updateUsers: (state, action) => {
      const updateUser = action.payload;
      state.users = state.users.map((user) =>
        user.id === updateUser.id ? updateUser : user
      );
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
