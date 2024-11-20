import { createAsyncThunk } from "@reduxjs/toolkit";
import { bookingServices } from "../../services";

export const fetchAllBooking = createAsyncThunk(
    'booking/fetchAllBooking',
    async () => {
        try {
            const response = await bookingServices.getAll();
            return response.data;
        } catch (error) {
            return (error.response.data);
        }
    }
)