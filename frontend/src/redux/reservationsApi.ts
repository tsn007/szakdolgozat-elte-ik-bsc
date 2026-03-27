import type { components, paths } from "../types/schema";
import { baseApi } from "./baseApi";

type CreateResReq = paths["/api/reservations/create/"]["post"]["requestBody"]["content"]["application/json"];
type CreateResResp = paths["/api/reservations/create/"]["post"]["responses"]["201"]["content"]["application/json"];
type ReservationPayload = Omit<CreateResReq, "id" | "renter">;
type GetRentalsResponse = paths["/api/reservations/get/"]["get"]["responses"]["200"]["content"]["application/json"];
export type Rental = components["schemas"]["UserReservation"];
export type Inbox = components["schemas"]["ReservationRequest"];
type GetRequestsResp =
    paths["/api/reservations/get/requests/"]["get"]["responses"]["200"]["content"]["application/json"];
type ChangeStatusResp =
    paths["/api/reservations/update/{id}"]["patch"]["responses"]["200"]["content"]["application/json"];
type ChangeStatusReq = NonNullable<
    paths["/api/reservations/update/{id}"]["patch"]["requestBody"]
>["content"]["application/json"];

export const reservationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createReservation: builder.mutation<CreateResResp, ReservationPayload>({
            query: (resData) => ({
                url: "api/reservations/create/",
                method: "POST",
                body: resData,
            }),
            invalidatesTags: ["Item", "Rentals"],
        }),
        getUserRentals: builder.query<GetRentalsResponse, string>({
            query: (tab) => ({
                url: "api/reservations/get/",
                method: "GET",
                params: { tab },
            }),
            providesTags: ["Rentals"],
        }),
        getUserRequests: builder.query<GetRequestsResp, string>({
            query: (tab) => ({
                url: "api/reservations/get/requests/",
                method: "GET",
                params: { tab },
            }),
            providesTags: ["Requests"],
        }),
        changeStatus: builder.mutation<ChangeStatusResp, ChangeStatusReq>({
            query: (newStatus) => ({
                url: `api/reservations/update/${newStatus.id}`,
                method: "PATCH",
                body: newStatus,
            }),
            invalidatesTags: ["Requests", "Rentals"],
        }),
    }),
});

export const {
    useCreateReservationMutation,
    useGetUserRentalsQuery,
    useGetUserRequestsQuery,
    useChangeStatusMutation,
} = reservationsApi;
