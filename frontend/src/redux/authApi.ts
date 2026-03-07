import type { paths } from "../types/schema";
import { baseApi } from "./baseApi";

type LoginRequest = paths["/api/users/login/"]["post"]["requestBody"]["content"]["application/json"];
type LoginResponse = paths["/api/users/login/"]["post"]["responses"]["200"]["content"]["application/json"];
type RegisterRequest = paths["/api/users/register/"]["post"]["requestBody"]["content"]["application/json"];
type RegisterResponse = paths["/api/users/register/"]["post"]["responses"]["200"]["content"]["application/json"];
type LogoutResponse = paths["/api/users/logout/"]["post"]["responses"]["200"]["content"]["application/json"];

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (userInfo) => ({
                url: "api/users/login/",
                method: "POST",
                body: userInfo,
            }),
        }),
        register: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (regInfo) => ({
                url: "api/users/register/",
                method: "POST",
                body: regInfo,
            }),
        }),
        logout: builder.mutation<LogoutResponse, void>({
            query: () => ({
                url: "api/users/logout/",
                method: "POST",
            }),
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;
