import { createSlice } from "@reduxjs/toolkit";
import { login, register } from "./thunk";

export const { actions: authAction, reducer: authReducer} = createSlice ({
    name: 'auth',
    initialState: {
        user: null,
        loading: false,
        error: null,
        message: '',
    },
    reducers: {
        setUser: (state, aciton) => {
            state.user = aciton.payload;
        }
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
        .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
        })
        .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
})