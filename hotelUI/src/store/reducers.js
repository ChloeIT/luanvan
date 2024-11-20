import { combineReducers } from "@reduxjs/toolkit";
import { shareReducer } from "./share";
import { authReducer } from "./auth";
import { userReducer } from "./user/slice";
import { hotelReducer } from "./hotel/slice";
import { roomReducer } from "./room";
import { bookingReducer } from "./booking";
import { favoriteReducer } from "./favorite"

export const rootReducer = combineReducers({
    share: shareReducer,
    auth: authReducer,
    user: userReducer,
    hotel: hotelReducer,
    room: roomReducer,
    booking: bookingReducer,
    favorite: favoriteReducer,
})
