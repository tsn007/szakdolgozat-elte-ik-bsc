import type { paths } from "../types/schema";
import { baseApi } from "./baseApi";

type CreateReviewReq =
    paths["/api/reviews/{reservation_id}/create/"]["post"]["requestBody"]["content"]["application/json"];
type CreateReviewResp =
    paths["/api/reviews/{reservation_id}/create/"]["post"]["responses"]["201"]["content"]["application/json"];
export type CreateReviewRequest = {
    resId: string;
    reviewData: CreateReviewReq;
};

export const reviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createReview: builder.mutation<CreateReviewResp, CreateReviewRequest>({
            query: ({ resId, reviewData }) => ({
                url: `api/reviews/${resId}/create/`,
                method: "POST",
                body: reviewData,
            }),
            invalidatesTags: ["Reviews"],
        }),
    }),
});

export const { useCreateReviewMutation } = reviewApi;
