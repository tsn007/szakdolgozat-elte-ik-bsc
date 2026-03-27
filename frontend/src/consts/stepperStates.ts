import { IconX } from "@tabler/icons-react";
import type React from "react";
import type { ReservationStatus } from "../utils/rentalStatus";

type StepperConfig = {
    active: number;
    color?: string;
    steps: { label: string; description: string; icon?: React.ElementType }[];
    stepColor?: string;
};

export const STEPPERS: Record<ReservationStatus, StepperConfig> = {
    PENDING: {
        active: 0,
        steps: [
            { label: "Request sent", description: "Waiting for owner approval" },
            { label: "", description: "" },
            { label: "", description: "" },
            { label: "", description: "" },
        ],
        stepColor: "blue",
    },
    ACCEPTED: {
        active: 1,
        steps: [
            { label: "", description: "" },
            { label: "Accepted", description: "Ready for pickup" },
            { label: "", description: "" },
            { label: "", description: "" },
        ],
        stepColor: "blue",
    },
    IN_PROGRESS: {
        active: 2,
        steps: [
            { label: "", description: "" },
            { label: "", description: "" },
            { label: "In progress", description: "You have the item" },
            { label: "", description: "" },
        ],
        stepColor: "blue",
    },
    RETURN_PENDING: {
        active: 3,
        steps: [
            { label: "", description: "" },
            { label: "", description: "" },
            { label: "", description: "" },
            { label: "Pending...", description: "Waiting for owner confirmation" },
        ],
        stepColor: "blue",
    },
    COMPLETED: {
        active: 4,
        color: "teal",
        steps: [
            { label: "", description: "" },
            { label: "", description: "" },
            { label: "", description: "" },
            { label: "Success", description: "The item is safely returned" },
        ],
        stepColor: "blue",
    },

    REJECTED: {
        active: 1,
        color: "red",
        steps: [
            { label: "", description: "" },
            { label: "Rejected", description: "The owner declined your request", icon: IconX },
            { label: "", description: "" },
            { label: "", description: "" },
        ],
        stepColor: "red",
    },
};
