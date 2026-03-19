import type { components, paths } from "../types/schema";
import { baseApi } from "./baseApi";

export type Item = components["schemas"]["ItemResponse"];
export type ItemsResponse = paths["/api/items/all/"]["get"]["responses"]["200"]["content"]["application/json"];
export type ItemsParams = paths["/api/items/all/"]["get"]["parameters"]["query"];
export type ItemResponse = paths["/api/items/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type CreateItemResp = paths["/api/items/create/"]["post"]["responses"]["201"]["content"]["application/json"];

export const itemsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllItems: builder.query<ItemsResponse, ItemsParams>({
            query: ({ page, search, page_size, lat, lng, max_price, min_price, category } = {}) => ({
                url: "api/items/all/",
                method: "GET",
                params: { page, search, page_size, lat, lng, max_price, min_price, category },
            }),
        }),
        getPreviewItems: builder.query<ItemsResponse, ItemsParams>({
            query: ({ page, search, page_size, lat, lng } = {}) => ({
                url: "api/items/all/",
                method: "GET",
                params: { page, search, page_size, lat, lng },
            }),
        }),
        getItemById: builder.query<ItemResponse, string>({
            query: (itemId) => ({
                url: `api/items/${itemId}`,
                method: "GET",
            }),
        }),
        createItem: builder.mutation<CreateItemResp, FormData>({
            query: (formData) => ({
                url: "api/items/create/",
                method: "POST",
                body: formData,
                formData: true,
            }),
        }),
    }),
});

export const { useGetAllItemsQuery, useGetPreviewItemsQuery, useGetItemByIdQuery, useCreateItemMutation } = itemsApi;
