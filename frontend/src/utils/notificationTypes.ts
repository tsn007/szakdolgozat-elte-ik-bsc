export const NotificationType = {
    INFO: "info",
    ERROR: "error",
    SUCCESS: "success",
    WARNING: "warning",
} as const;

export type NotificationValue = (typeof NotificationType)[keyof typeof NotificationType];

export type NotificationProps = {
    id: string;
    title: string;
    message: string;
    type: NotificationValue;
};
