import { IconClock, IconCheck, IconX, IconActivity, IconArrowBackUp, IconCircleCheckFilled } from "@tabler/icons-react";
import type { ReservationStatus } from "../utils/rentalStatus";

export function StatusMobileIcon({ status }: { status: ReservationStatus }) {
    switch (status) {
        case "PENDING":
            return <IconClock color="yellow" />;
        case "ACCEPTED":
            return <IconCheck color="teal" />;
        case "REJECTED":
            return <IconX color="red" />;
        case "IN_PROGRESS":
            return <IconActivity color="blue" />;
        case "RETURN_PENDING":
            return <IconArrowBackUp color="brown" />;
        case "COMPLETED":
            return <IconCircleCheckFilled color="teal" />;
        default:
            return <IconClock color="gray" />;
    }
}
