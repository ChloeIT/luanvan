import { createAsyncThunk } from "@reduxjs/toolkit";
import {  userServices } from "../../services";

export const fetchAllUser = createAsyncThunk(
    'user/fetchAllUser',
    async () => {
        try {
            const response = await userServices.getAll();
            return response.data;
        } catch (error) {
            return (error.response.data);
        }
    }
)