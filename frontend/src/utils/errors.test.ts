/* eslint-disable no-magic-numbers */
import { describe, it, expect } from "vitest";
import { getApiErrorMessage } from "./errors";

describe("getApiErrorMessage", () => {
    const FALLBACK_MESSAGE = "An unexpected error occurred. Please try again.";

    describe("Standard JavaScript Errors", () => {
        it("should return the message from a standard Error object", () => {
            const error = new Error("Network connection lost");
            expect(getApiErrorMessage(error)).toBe("Network connection lost");
        });
    });

    describe("FetchBaseQueryError (RTK Query API Errors)", () => {
        it("should handle 'non_field_errors' arrays", () => {
            const error = {
                status: 400,
                data: { non_field_errors: ["Invalid credentials provided.", "Try again."] },
            };
            expect(getApiErrorMessage(error)).toBe("Invalid credentials provided.");
        });

        it("should handle a 'detail' string", () => {
            const error = {
                status: 401,
                data: { detail: "Authentication credentials were not provided." },
            };
            expect(getApiErrorMessage(error)).toBe("Authentication credentials were not provided.");
        });

        it("should handle data as a direct array of strings", () => {
            const error = {
                status: 400,
                data: ["A system error occurred.", "Please contact support."],
            };
            expect(getApiErrorMessage(error)).toBe("A system error occurred.");
        });

        it("should handle field-specific errors where the value is an array", () => {
            const error = {
                status: 400,
                data: { email: ["This field is required.", "Enter a valid email."] },
            };
            expect(getApiErrorMessage(error)).toBe("This field is required.");
        });

        it("should handle field-specific errors where the value is a string", () => {
            const error = {
                status: 400,
                data: { username: "This username is already taken." },
            };
            expect(getApiErrorMessage(error)).toBe("This username is already taken.");
        });

        it("should handle data as a direct string (e.g., 500 Internal Server Error HTML)", () => {
            const error = {
                status: 500,
                data: "Server crashed unexpectedly.",
            };
            expect(getApiErrorMessage(error)).toBe("Server crashed unexpectedly.");
        });
    });

    describe("Fallbacks and Unknown Structures", () => {
        it("should return fallback for RTK Query error with no data", () => {
            const error = { status: 500 };
            expect(getApiErrorMessage(error)).toBe(FALLBACK_MESSAGE);
        });

        it("should return fallback for RTK Query error with an unhandled data structure", () => {
            const error = {
                status: 400,
                data: { nested: { deepError: "Cannot parse this" } },
            };
            expect(getApiErrorMessage(error)).toBe(FALLBACK_MESSAGE);
        });

        it("should return fallback for completely unknown objects", () => {
            const error = { randomProperty: "Something went wrong" };
            expect(getApiErrorMessage(error)).toBe(FALLBACK_MESSAGE);
        });

        it("should return fallback for primitive types that aren't expected", () => {
            expect(getApiErrorMessage("Just a random string")).toBe(FALLBACK_MESSAGE);
            expect(getApiErrorMessage(404)).toBe(FALLBACK_MESSAGE);
            expect(getApiErrorMessage(null)).toBe(FALLBACK_MESSAGE);
            expect(getApiErrorMessage(undefined)).toBe(FALLBACK_MESSAGE);
        });
    });
});
