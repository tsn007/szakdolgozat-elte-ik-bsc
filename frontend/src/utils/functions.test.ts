/* eslint-disable no-magic-numbers */
import { describe, it, expect } from "vitest";
import { formatTime } from "./functions";

const MINUTE_IN_MS = 1000 * 60;
const HOUR_IN_MS = MINUTE_IN_MS * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;

describe("formatTime utility", () => {
    describe("Just now (Under 1 minute)", () => {
        it('should return "Just now" for 0 milliseconds', () => {
            expect(formatTime(0)).toBe("Just now");
        });

        it('should return "Just now" for exactly 59 seconds', () => {
            expect(formatTime(59 * 1000)).toBe("Just now");
        });
        
        it('should return "Just now" for negative numbers (in case of clock skew)', () => {
            expect(formatTime(-5000)).toBe("Just now");
        });
    });

    describe("Minutes", () => {
        it("should format a single minute properly (singular)", () => {
            expect(formatTime(MINUTE_IN_MS)).toBe("1 minute ago");
        });

        it("should format multiple minutes properly (plural)", () => {
            expect(formatTime(45 * MINUTE_IN_MS)).toBe("45 minutes ago");
        });

        it("should round down to minutes even if seconds are present", () => {
            expect(formatTime(5 * MINUTE_IN_MS + 45 * 1000)).toBe("5 minutes ago");
        });
    });

    describe("Hours", () => {
        it("should format a single hour properly (singular)", () => {
            expect(formatTime(HOUR_IN_MS)).toBe("1 hour ago");
        });

        it("should format multiple hours properly (plural)", () => {
            expect(formatTime(12 * HOUR_IN_MS)).toBe("12 hours ago");
        });

        it("should round down to hours even if 59 minutes are present", () => {
            expect(formatTime(3 * HOUR_IN_MS + 59 * MINUTE_IN_MS)).toBe("3 hours ago");
        });
    });

    describe("Days", () => {
        it("should format a single day properly (singular)", () => {
            expect(formatTime(DAY_IN_MS)).toBe("1 day ago");
        });

        it("should format multiple days properly (plural)", () => {
            expect(formatTime(30 * DAY_IN_MS)).toBe("30 days ago");
            expect(formatTime(365 * DAY_IN_MS)).toBe("365 days ago");
        });

        it("should round down to days even if 23 hours are present", () => {
            expect(formatTime(5 * DAY_IN_MS + 23 * HOUR_IN_MS)).toBe("5 days ago");
        });
    });
});
