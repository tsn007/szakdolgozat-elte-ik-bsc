import type { components, paths } from "../types/schema";
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
export type UpdateProfilePicResponse =
    paths["/api/users/update_profilepic/"]["patch"]["responses"]["200"]["content"]["application/json"];
export type EditLocationResp =
    paths["/api/users/edit_location/{id}/"]["patch"]["responses"]["200"]["content"]["application/json"];
export type EditLocationReq = NonNullable<
    paths["/api/users/edit_location/{id}/"]["patch"]["requestBody"]
>["content"]["application/json"];
export type OwnLocation = components["schemas"]["OwnLocation"];
type EditLocRequestFull = {
    locId: string;
    locData: EditLocationReq;
};
type ReviewsResp = paths["/api/users/reviews/"]["get"]["responses"]["200"]["content"]["application/json"];
type AllUsersResp = paths["/api/users/all/"]["get"]["responses"]["200"]["content"]["application/json"];
type ChangeIsActiveResp = paths["/api/users/{id}/suspend/"]["patch"]["responses"]["200"]["content"]["application/json"];
type ChangeIsActiveReq = {
    userId: string;
    isActive: boolean;
};

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUserItems: builder.query<UserItemsResponse, void>({
            query: () => ({
                url: "api/users/items/",
                method: "GET",
            }),
            providesTags: ["Items"],
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
        deleteLocation: builder.mutation<void, string>({
            query: (locId) => ({
                url: `api/users/delete_location/${locId}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Addresses"],
        }),
        changeProfilePic: builder.mutation<UpdateProfilePicResponse, FormData>({
            query: (formData) => ({
                url: "api/users/update_profilepic/",
                method: "PATCH",
                body: formData,
                formData: true,
            }),
            invalidatesTags: ["User"],
        }),
        editLocation: builder.mutation<EditLocationResp, EditLocRequestFull>({
            query: ({ locId, locData }) => ({
                url: `api/users/edit_location/${locId}/`,
                method: "PATCH",
                body: locData,
            }),
            invalidatesTags: ["Addresses"],
        }),
        getUserReviews: builder.query<ReviewsResp, void>({
            query: () => ({
                url: "api/users/reviews/",
                method: "GET",
            }),
            providesTags: ["Reviews"],
        }),

        //Staff
        getAllUsers: builder.query<AllUsersResp, number>({
            query: (page) => ({
                url: `api/users/all/`,
                method: "GET",
                params: { page },
            }),
            providesTags: ["StaffUsers"],
        }),
        changeActiveStatus: builder.mutation<ChangeIsActiveResp, ChangeIsActiveReq>({
            query: ({ userId, isActive }) => ({
                url: `api/users/${userId}/suspend/`,
                method: "PATCH",
                body: { is_active: !isActive },
            }),
            invalidatesTags: ["StaffUsers"],
        }),
    }),
});

export const {
    useGetUserItemsQuery,
    useGetUserLocationsQuery,
    useUpdateUserDataMutation,
    useAddNewLocationMutation,
    useDeleteLocationMutation,
    useChangeProfilePicMutation,
    useEditLocationMutation,
    useGetUserReviewsQuery,
    useGetAllUsersQuery,
    useChangeActiveStatusMutation,
} = userApi;
