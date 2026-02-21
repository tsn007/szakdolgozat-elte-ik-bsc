import type { components, paths } from "../types/schema";
import { baseApi } from "./baseApi";

export type Item = components["schemas"]["AllItemResponse"];
type ItemsResponse =
    paths["/api/items/all/"]["get"]["responses"]["200"]["content"]["application/json"];

export const itemsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllItems: builder.query<ItemsResponse, void>({
            query: () => ({
                url: "api/items/all/",
                method: "GET",
            }),
        }),
    }),
});

export const { useGetAllItemsQuery } = itemsApi;
