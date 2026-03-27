export const InboxTab = {
    REQUESTS: "requests",
    ACTIVE: "active",
    HISTORY: "history",
} as const;

export type InboxTabType = (typeof InboxTab)[keyof typeof InboxTab];
