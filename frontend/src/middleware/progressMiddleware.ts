import { nprogress } from "@mantine/nprogress";
import { isFulfilled, isPending, isRejected, type Middleware, isAsyncThunkAction } from "@reduxjs/toolkit";

const SILENT_ENDPOINTS = ["getPreviewItems"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const progressMiddleware: Middleware = () => (next) => (action: any) => {
    if (isAsyncThunkAction(action)) {
        const endpointName = action.meta?.arg?.endpointName;

        if (endpointName && SILENT_ENDPOINTS.includes(endpointName)) {
            return next(action);
        }
    }

    if (isPending(action)) {
        nprogress.start();
    }

    if (isFulfilled(action) || isRejected(action)) {
        nprogress.complete();
    }

    return next(action);
};
