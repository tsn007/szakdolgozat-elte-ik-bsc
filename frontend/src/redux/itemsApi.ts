import type { components, paths } from "../types/schema";
import { baseApi } from "./baseApi";

export type Item = components["schemas"]["AllItemResponse"];
export type ItemsResponse = paths["/api/items/all/"]["get"]["responses"]["200"]["content"]["application/json"];
export type ItemsParams = paths["/api/items/all/"]["get"]["parameters"]["query"];

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
    }),
});

export const { useGetAllItemsQuery, useGetPreviewItemsQuery } = itemsApi;
