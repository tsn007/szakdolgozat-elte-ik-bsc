import { describe, it, expect } from "vitest";
import { formatStatusLabel, decideBadgeColor, RESERVATION_STATUS } from "./rentalStatus";

describe("rentalStatus utilities", () => {
    describe("Format status", () => {
        it('should return "Pending" for ReservationStatus.PENDING', () => {
            expect(formatStatusLabel(RESERVATION_STATUS.PENDING)).toBe("Pending");
        });

        it('should return "Accepted" for ReservationStatus.ACCEPTED', () => {
            expect(formatStatusLabel(RESERVATION_STATUS.ACCEPTED)).toBe("Accepted");
        });

        it('should return "Rejected" for ReservationStatus.REJECTED', () => {
            expect(formatStatusLabel(RESERVATION_STATUS.REJECTED)).toBe("Rejected");
        });

        it('should return "In progress" for ReservationStatus.IN_PROGRESS', () => {
            expect(formatStatusLabel(RESERVATION_STATUS.IN_PROGRESS)).toBe("In Progress");
        });

        it('should return "Return Pending" for ReservationStatus.RETURN_PENDING', () => {
            expect(formatStatusLabel(RESERVATION_STATUS.RETURN_PENDING)).toBe("Return Pending");
        });

        it('should return "Completed" for ReservationStatus.COMPLETED', () => {
            expect(formatStatusLabel(RESERVATION_STATUS.COMPLETED)).toBe("Completed");
        });

        it("should return the raw string if the status is unknown", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(formatStatusLabel("UNKNOWN_STATUS" as any)).toBe("UNKNOWN_STATUS");
        });
    });

    describe("badge colors", () => {
        it('should return "yellow" for ReservationStatus.PENDING', () => {
            expect(decideBadgeColor(RESERVATION_STATUS.PENDING)).toBe("yellow");
        });

        it('should return "teal" for ReservationStatus.ACCEPTED', () => {
            expect(decideBadgeColor(RESERVATION_STATUS.ACCEPTED)).toBe("teal");
        });

        it('should return "blue" for ReservationStatus.IN_PROGRESS', () => {
            expect(decideBadgeColor(RESERVATION_STATUS.IN_PROGRESS)).toBe("blue");
        });

        it('should return "red" for ReservationStatus.REJECTED', () => {
            expect(decideBadgeColor(RESERVATION_STATUS.REJECTED)).toBe("red");
        });

        it('should return "brown" for ReservationStatus.RETURN_PENDING', () => {
            expect(decideBadgeColor(RESERVATION_STATUS.RETURN_PENDING)).toBe("brown");
        });

        it('should return "teal" for ReservationStatus.COMPLETED', () => {
            expect(decideBadgeColor(RESERVATION_STATUS.COMPLETED)).toBe("teal");
        });

        it('should return "gray" if the status is undefined', () => {
            expect(decideBadgeColor(undefined)).toBe("gray");
        });

        it('should return "gray" if the status is unknown', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(decideBadgeColor("UNKNOWN_STATUS" as any)).toBe("gray");
        });
    });
});
