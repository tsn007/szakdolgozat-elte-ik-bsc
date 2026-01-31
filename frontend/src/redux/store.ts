import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDisPatch = ReturnType<typeof store.dispatch>;
