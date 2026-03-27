import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { StatusCodes } from "http-status-codes";
import { logout } from "./authSlice";

const baseQuery = fetchBaseQuery({
    baseUrl: "/",
    credentials: "include",
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result.error && result.error.status === StatusCodes.UNAUTHORIZED) {
        const refreshRes = await baseQuery({ url: "api/users/refresh/", method: "GET" }, api, extraOptions);

        if (refreshRes.data) {
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(logout());
        }
    }

    return result;
};

export const baseApi = createApi({
    baseQuery: baseQueryWithAuth,
    endpoints: () => ({}),
    tagTypes: ["User", "Addresses", "Items", "Item", "Rentals", "Requests"],
});
