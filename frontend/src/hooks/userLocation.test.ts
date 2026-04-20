/* eslint-disable no-magic-numbers */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as reactRedux from "react-redux";
import { useUserData, fetchAddressFromCoords } from "./userLocation";

vi.mock("react-redux", () => ({
    useSelector: vi.fn(),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const originalConsoleError = console.error;
beforeEach(() => {
    console.error = vi.fn();
});
afterEach(() => {
    console.error = originalConsoleError;
});

const mockGeolocation = {
    getCurrentPosition: vi.fn(),
};

describe("useUserData hook and utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.stubGlobal("navigator", {
            geolocation: mockGeolocation,
        });
    });

    describe("fetchAddressFromCoords", () => {
        it("should return address data on successful fetch", async () => {
            const mockAddress = { city: "Budapest", country: "Hungary" };
            mockFetch.mockResolvedValueOnce({
                json: async () => ({ address: mockAddress }),
            } as Response);

            const result = await fetchAddressFromCoords(47.4979, 19.0402);

            expect(mockFetch).toHaveBeenCalledWith(
                "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=47.4979&lon=19.0402",
            );
            expect(result).toEqual(mockAddress);
        });

        it("should return null if address is missing in the response", async () => {
            mockFetch.mockResolvedValueOnce({
                json: async () => ({ someOtherData: true }),
            } as Response);

            const result = await fetchAddressFromCoords(10, 20);
            expect(result).toBeNull();
        });

        it("should catch errors, log them, and return undefined", async () => {
            const error = new Error("Network Error");
            mockFetch.mockRejectedValueOnce(error);

            const result = await fetchAddressFromCoords(10, 20);

            expect(console.error).toHaveBeenCalledWith(error);
            expect(result).toBeUndefined();
        });
    });

    describe("useUserData", () => {
        it("should return user data from the Redux store", () => {
            const mockUser = { id: 1, name: "John Doe" };
            vi.mocked(reactRedux.useSelector).mockReturnValueOnce(mockUser);

            const { result } = renderHook(() => useUserData());

            expect(result.current.user).toEqual(mockUser);
            expect(reactRedux.useSelector).toHaveBeenCalled();
        });

        it("should successfully fetch location using browser geolocation", async () => {
            mockGeolocation.getCurrentPosition.mockImplementationOnce((successCallback) => {
                successCallback({
                    coords: { latitude: 40.7128, longitude: -74.006 },
                });
            });

            const { result } = renderHook(() => useUserData());

            let coordsResult;
            await act(async () => {
                coordsResult = await result.current.fetchLocation();
            });

            expect(coordsResult).toEqual({ lat: 40.7128, lng: -74.006 });
            expect(result.current.userCoords).toEqual({ lat: 40.7128, lng: -74.006 });
        });

        it("should fallback to IP location if browser geolocation fails", async () => {
            mockGeolocation.getCurrentPosition.mockImplementationOnce((_, errorCallback) => {
                errorCallback(new Error("User denied Geolocation"));
            });

            mockFetch.mockResolvedValueOnce({
                json: async () => ({ latitude: 51.5074, longitude: -0.1278, error: false }),
            } as Response);

            const { result } = renderHook(() => useUserData());

            let coordsResult;
            await act(async () => {
                coordsResult = await result.current.fetchLocation();
            });

            expect(mockFetch).toHaveBeenCalledWith("https://ipapi.co/json/");
            expect(coordsResult).toEqual({ lat: 51.5074, lng: -0.1278 });
            expect(result.current.userCoords).toEqual({ lat: 51.5074, lng: -0.1278 });
        });

        it("should resolve to null if both geolocation and fallback fail", async () => {
            mockGeolocation.getCurrentPosition.mockImplementationOnce((_, errorCallback) => {
                errorCallback(new Error("User denied"));
            });

            mockFetch.mockRejectedValueOnce(new Error("API Down"));

            const { result } = renderHook(() => useUserData());

            let coordsResult;
            await act(async () => {
                coordsResult = await result.current.fetchLocation();
            });

            expect(coordsResult).toBeNull();
            expect(result.current.userCoords).toBeUndefined();
            expect(console.error).toHaveBeenCalled();
        });

        it("should resolve to null if navigator.geolocation is unavailable", async () => {
            vi.stubGlobal("navigator", {});

            const { result } = renderHook(() => useUserData());

            let coordsResult;
            await act(async () => {
                coordsResult = await result.current.fetchLocation();
            });

            expect(coordsResult).toBeNull();
            expect(result.current.userCoords).toBeUndefined();
        });
    });
});
