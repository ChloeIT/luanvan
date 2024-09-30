import { combineReducers } from "@reduxjs/toolkit";
import { shareReducer } from "./share";

export const rootReducer = combineReducers({
    share: shareReducer
})