import type { components } from "../types/schema";

export type ReservationStatus = components["schemas"]["StatusEnum"];

export const RESERVATION_STATUS: Record<ReservationStatus, ReservationStatus> = {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
    IN_PROGRESS: "IN_PROGRESS",
    RETURN_PENDING: "RETURN_PENDING",
    COMPLETED: "COMPLETED",
};

export const formatStatusLabel = (status: ReservationStatus): string => {
    const labels: Record<ReservationStatus, string> = {
        PENDING: "Pending",
        ACCEPTED: "Accepted",
        REJECTED: "Rejected",
        IN_PROGRESS: "In Progress",
        RETURN_PENDING: "Return Pending",
        COMPLETED: "Completed",
    };

    return labels[status] || status;
};

export const decideBadgeColor = (status: ReservationStatus | undefined): string => {
    if (!status) return "gray";

    const colors: Record<ReservationStatus, string> = {
        PENDING: "yellow",
        ACCEPTED: "teal",
        IN_PROGRESS: "blue",
        REJECTED: "red",
        RETURN_PENDING: "brown",
        COMPLETED: "teal",
    };

    return colors[status] || "gray";
};
