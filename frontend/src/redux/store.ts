import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import authReducer from "./authSlice";
import { progressMiddleware } from "../middleware/progressMiddleware";

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware).concat(progressMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDisPatch = ReturnType<typeof store.dispatch>;
