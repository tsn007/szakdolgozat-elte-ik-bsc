import { IconUser, IconCubeSend, IconArchive, IconInbox } from "@tabler/icons-react";

export const profileMenuData = [
    {
        icon: IconUser,
        title: "Profile",
        to: "/profile",
    },
    {
        icon: IconCubeSend,
        title: "My rentals",
        to: "/profile/rentals/in-progress",
    },
    {
        icon: IconArchive,
        title: "My items",
        to: "/profile/my-items",
    },
    {
        icon: IconInbox,
        title: "Inbox",
        to: "/profile/inbox/requests",
    },
];
