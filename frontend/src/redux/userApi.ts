import type { paths } from "../types/schema";
import { baseApi } from "./baseApi";

export type UserItemsResponse = paths["/api/users/items/"]["get"]["responses"]["200"]["content"]["application/json"];
export type UserLocationsResponse =
    paths["/api/users/locations/"]["get"]["responses"]["200"]["content"]["application/json"];
export type UpdateUserRequest = NonNullable<
    paths["/api/users/update_profile/"]["patch"]["requestBody"]
>["content"]["application/json"];
export type UpdateUserResponse =
    paths["/api/users/update_profile/"]["patch"]["responses"]["200"]["content"]["application/json"];

export type AddLocationRequest =
    paths["/api/users/add_location/"]["post"]["requestBody"]["content"]["application/json"];

export type AddLocationResponse =
    paths["/api/users/add_location/"]["post"]["responses"]["201"]["content"]["application/json"];

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUserItems: builder.query<UserItemsResponse, void>({
            query: () => ({
                url: "api/users/items/",
                method: "GET",
            }),
        }),
        getUserLocations: builder.query<UserLocationsResponse, void>({
            query: () => ({
                url: "api/users/locations/",
                method: "GET",
            }),
            providesTags: ["Addresses"],
        }),
        updateUserData: builder.mutation<UpdateUserResponse, UpdateUserRequest>({
            query: (userData) => ({
                url: "api/users/update_profile/",
                method: "PATCH",
                body: userData,
            }),
            invalidatesTags: ["User"],
        }),
        addNewLocation: builder.mutation<AddLocationResponse, AddLocationRequest>({
            query: (locData) => ({
                url: "api/users/add_location/",
                method: "POST",
                body: locData,
            }),
            invalidatesTags: ["Addresses"],
        }),
    }),
});

export const { useGetUserItemsQuery, useGetUserLocationsQuery, useUpdateUserDataMutation, useAddNewLocationMutation } =
    userApi;
