import type { components } from "../types/schema";
import { logout, setUser } from "./authSlice";
import { baseApi } from "./baseApi";

type UserResponse = components["schemas"]["UserResponse"];

export const meApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        user: builder.query<UserResponse, void>({
            query: () => ({
                url: "api/users/me/",
                method: "GET",
            }),

            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data.user));
                } catch {
                    logout();
                }
            },
            providesTags: ["User"],
        }),
    }),
});

export const { useUserQuery } = meApi;
