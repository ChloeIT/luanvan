
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducers";

export const store = configureStore({
    reducer: rootReducer,
    devTools: true
})

export * from './auth'
export * from  './share'
export * from './user'
export * from './hotel'
export * from './room'
export * from './booking'
export * from './favorite'