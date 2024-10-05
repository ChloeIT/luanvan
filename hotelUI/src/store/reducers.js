import { combineReducers } from "@reduxjs/toolkit";
import { shareReducer } from "./share";
import { authReducer } from "./auth";

export const rootReducer = combineReducers({
    share: shareReducer,
    auth: authReducer,
})
