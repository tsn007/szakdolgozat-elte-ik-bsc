import { type FetchBaseQueryError } from "@reduxjs/toolkit/query";

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return typeof error === "object" && error !== null && "status" in error;
}

export const getApiErrorMessage = (error: unknown): string => {
    const fallbackMessage = "An unexpected error occurred. Please try again.";

    if (isFetchBaseQueryError(error)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorData = error.data as any;

        if (!errorData) return fallbackMessage;

        if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            return errorData.non_field_errors[0];
        }

        if (typeof errorData.detail === "string") {
            return errorData.detail;
        }

        if (Array.isArray(errorData) && errorData.length > 0) {
            if (typeof errorData[0] === "string") {
                return errorData[0];
            }
        }

        if (typeof errorData === "object" && !Array.isArray(errorData)) {
            const firstKey = Object.keys(errorData)[0];
            if (firstKey && Array.isArray(errorData[firstKey])) {
                return errorData[firstKey][0];
            }
            if (firstKey && typeof errorData[firstKey] === "string") {
                return errorData[firstKey];
            }
        }

        if (typeof errorData === "string") {
            return errorData;
        }
    } else if (error instanceof Error) {
        return error.message;
    }

    return fallbackMessage;
};
