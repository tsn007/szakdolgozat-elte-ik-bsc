import type { paths } from "../types/schema";
import { baseApi } from "./baseApi";

type CategoryResponse = paths["/api/categories/all/"]["get"]["responses"]["200"]["content"]["application/json"];

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllCategory: builder.query<CategoryResponse, void>({
            query: () => ({
                url: "api/categories/all/",
                method: "GET",
            }),
        }),
    }),
});

export const { useGetAllCategoryQuery } = categoryApi;
