import { createAsyncThunk } from "@reduxjs/toolkit";
import { roomServices } from "../../services";

export const fetchAllRoom = createAsyncThunk(
    'room/fetchAllRoom',
    async () => {
        try {
            const response = await roomServices.getAll();
            return response.data;
        } catch (error) {
            return (error.response.data);
        }
    }
)