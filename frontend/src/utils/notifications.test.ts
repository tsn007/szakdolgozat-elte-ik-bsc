import { describe, it, expect, vi, beforeEach } from "vitest";
import { showCustomNotification } from "./notifications"; //
import { notifications } from "@mantine/notifications";
import { NotificationType } from "./notificationTypes";

vi.mock("@mantine/notifications", () => ({
    notifications: {
        show: vi.fn(),
    },
}));

describe("showCustomNotification", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should call notifications.show with base payload", () => {
        showCustomNotification({
            id: "test-1",
            title: "Hello",
            message: "World",
            type: NotificationType.INFO,
        });

        expect(notifications.show).toHaveBeenCalledTimes(1);
        expect(notifications.show).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "test-1",
                title: "Hello",
                message: "World",
                color: "blue",
                radius: "lg",
                withBorder: true,
                autoClose: 4000,
            })
        );
    });

    it("should map SUCCESS type to teal color and include the check icon", () => {
        showCustomNotification({
            id: "test-notification",
            title: "Success",
            message: "It worked",
            type: NotificationType.SUCCESS,
        });

        const callArgs = vi.mocked(notifications.show).mock.calls[0][0];

        expect(callArgs.color).toBe("teal");
        expect(callArgs.icon).not.toBeNull();
    });

    it("should map ERROR type to red color and NOT include an icon", () => {
        showCustomNotification({
            id: "test-notification",
            title: "Error",
            message: "It failed",
            type: NotificationType.ERROR,
        });

        const callArgs = vi.mocked(notifications.show).mock.calls[0][0];

        expect(callArgs.color).toBe("red");
        expect(callArgs.icon).toBeNull();
    });

    it("should map WARNING type to yellow color", () => {
        showCustomNotification({
            id: "test-notification",
            title: "Warning",
            message: "Watch out",
            type: NotificationType.WARNING,
        });

        expect(notifications.show).toHaveBeenCalledWith(
            expect.objectContaining({ color: "yellow" })
        );
    });
});
