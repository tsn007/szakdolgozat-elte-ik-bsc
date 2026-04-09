import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { NotificationType, type NotificationProps } from "./notificationTypes";

export const showCustomNotification = ({ id, title, message, type }: NotificationProps) => {
    let baseColor = "blue";
    if (type === NotificationType.SUCCESS) baseColor = "teal";
    if (type === NotificationType.ERROR) baseColor = "red";
    if (type === NotificationType.INFO) baseColor = "blue";
    if (type === NotificationType.WARNING) baseColor = "yellow";

    notifications.show({
        id: id,
        title: title,
        message: message,
        color: baseColor,
        radius: "lg",
        withBorder: true,
        autoClose: 4000,
        position: "top-right",
        icon: type === NotificationType.SUCCESS ? <IconCheck size={18} /> : null,
        styles: {
            root: {
                marginTop: "70px",
                backgroundColor: `light-dark(
                    var(--mantine-color-${baseColor}-0), 
                    color-mix(in srgb, var(--mantine-color-dark-8) 85%, var(--mantine-color-${baseColor}-9))
                )`,
                borderColor: `light-dark(
                    var(--mantine-color-${baseColor}-2), 
                    transparent
                )`,
            },
            title: {
                color: `light-dark(var(--mantine-color-${baseColor}-9), var(--mantine-color-${baseColor}-1))`,
                fontWeight: 600,
            },
            description: {
                color: `light-dark(var(--mantine-color-${baseColor}-8), var(--mantine-color-${baseColor}-2))`,
            },
            closeButton: {
                color: `light-dark(var(--mantine-color-${baseColor}-8), var(--mantine-color-${baseColor}-3))`,
            },
        },
    });
};
