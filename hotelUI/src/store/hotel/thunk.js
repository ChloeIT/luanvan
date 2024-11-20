import { createAsyncThunk } from "@reduxjs/toolkit";
import { hotelServices } from "../../services";

export const fetchAllHotel = createAsyncThunk(
    'hotel/fetchAllHotel',
    async () => {
        try {
            const response = await hotelServices.getAll();
            return response.data;
        } catch (error) {
            return (error.response.data);
        }
    }
)