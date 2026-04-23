import {
    Container,
    Avatar,
    Box,
    Text,
    Button,
    Rating,
    Tabs,
    Overlay,
    FileButton,
    Menu,
    Indicator,
    Flex,
} from "@mantine/core";
import { useUserData } from "../hooks/userLocation";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import type { User } from "../redux/authSlice";
import { useDisclosure, useHover } from "@mantine/hooks";
import { UploadEditItemModal } from "./UploadEditItemModal";
import { useMemo } from "react";
import { useChangeProfilePicMutation, useGetUserLocationsQuery, type UserLocationsResponse } from "../redux/userApi";
import type { CoordsType } from "./SearchLayout";
import { IconCameraPlus } from "@tabler/icons-react";
import { InboxTab } from "../consts/inboxTabs";
import { useGetUserRequestsQuery } from "../redux/reservationsApi";
import { getApiErrorMessage } from "../utils/errors";
import { showCustomNotification } from "../utils/notifications";

export type ProfileContextType = {
    user: User;
    locations: UserLocationsResponse;
    userCoords: CoordsType | undefined;
    fetchLocation: () => Promise<CoordsType | undefined>;
};

const profileItems = [
    {
        title: "Details",
        to: "/profile",
    },
    {
        title: "My items",
        to: "/profile/my-items",
    },
    {
        title: "My rentals",
        to: "/profile/rentals/in-progress",
        menuItems: [
            {
                title: "In progress",
                to: "/profile/rentals/in-progress",
            },
            {
                title: "Completed",
                to: "/profile/rentals/completed",
            },
        ],
    },
    {
        title: "Inbox",
        to: "/profile/inbox/requests",
        menuItems: [
            {
                title: "Requests",
                to: `/profile/inbox/${InboxTab.REQUESTS}`,
            },
            {
                title: "Active",
                to: `/profile/inbox/${InboxTab.ACTIVE}`,
            },
            {
                title: "History",
                to: `/profile/inbox/${InboxTab.HISTORY}`,
            },
        ],
    },
    {
        title: "Reviews",
        to: "/profile/reviews",
    },
];

export function ProfilePage() {
    const { user, userCoords, fetchLocation, fetchAddressFromCoords } = useUserData();
    const { data: locations } = useGetUserLocationsQuery();
    const { data: rentals } = useGetUserRequestsQuery(InboxTab.REQUESTS);
    const navigate = useNavigate();
    const location = useLocation();
    const [opened, { open, close }] = useDisclosure(false);
    const contextValue = useMemo(
        () => ({ user, locations, userCoords, fetchLocation, fetchAddressFromCoords }),
        [user, locations, userCoords, fetchLocation, fetchAddressFromCoords],
    );

    const activeTab = useMemo(() => {
        for (const item of profileItems) {
            if (location.pathname === item.to) {
                return item.to;
            }
            if (item.menuItems?.some((mItem) => location.pathname === mItem.to)) {
                return item.to;
            }
        }
        return location.pathname;
    }, [location.pathname]);

    const handleOpen = () => {
        open();
    };

    return (
        <>
            <Container size="lg">
                <Flex w="100%" align={{ base: "flex-start", sm: "flex-end" }} gap="20px">
                    <ProfilePic profilePic={user?.profile_pic} />
                    <Flex
                        w="100%"
                        mb={20}
                        mt={{ base: 20, sm: 0 }}
                        direction={{ base: "column", sm: "row" }}
                        justify="space-between"
                        align={{ base: "flex-start", sm: "flex-end" }}
                        gap="md"
                    >
                        <Box style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <Text miw={{ base: "100%", sm: 500 }} fz="clamp(24px, 3vw, 40px)">
                                {user?.first_name + " " + user?.last_name}
                            </Text>
                            <Box style={{ display: "flex", gap: "10px" }}>
                                <Button radius="md" onClick={handleOpen}>
                                    Upload item
                                </Button>
                            </Box>
                        </Box>
                        <Box
                            style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "flex-start" }}
                        >
                            <Rating fractions={10} readOnly value={Number(user?.rating || 0)} />
                            <Text>{`(${user?.rating})`}</Text>
                        </Box>
                    </Flex>
                </Flex>
                <Box style={{ display: "flex", gap: "30px" }} mt={50}>
                    <Tabs value={activeTab} onChange={(value) => navigate(value as string)} w="100%">
                        <Tabs.List
                            style={{
                                flexWrap: "nowrap",
                                overflowX: "auto",
                                scrollbarWidth: "none",
                                paddingTop: "10px",
                            }}
                            styles={{
                                list: {
                                    "&::-webkit-scrollbar": { display: "none" },
                                },
                            }}
                        >
                            {profileItems.map((item) => (
                                <Menu trigger="click-hover" key={item.to}>
                                    <Indicator
                                        disabled={
                                            !item.menuItems ||
                                            !item.menuItems.some((mItem) => mItem.title === "Requests") ||
                                            !rentals ||
                                            rentals.length === 0
                                        }
                                        color="red"
                                        inline
                                        label={rentals?.length}
                                        size={20}
                                    >
                                        <Menu.Target>
                                            <Tabs.Tab onClick={() => navigate(item.to)} value={item.to}>
                                                {item.title}
                                            </Tabs.Tab>
                                        </Menu.Target>
                                    </Indicator>
                                    {item.menuItems && (
                                        <Menu.Dropdown>
                                            {item.menuItems.map((mItem) => (
                                                <Menu.Item key={mItem.title} onClick={() => navigate(mItem.to)}>
                                                    {mItem.title}
                                                </Menu.Item>
                                            ))}
                                        </Menu.Dropdown>
                                    )}
                                </Menu>
                            ))}
                        </Tabs.List>
                    </Tabs>
                </Box>
                <UploadEditItemModal opened={opened} close={close} locations={locations} />
                <Outlet context={contextValue} />
            </Container>
        </>
    );
}

function ProfilePic({ profilePic }: { profilePic: string | undefined | null }) {
    const [changeProfilePic] = useChangeProfilePicMutation();
    const { hovered, ref } = useHover();
    // eslint-disable-next-line no-magic-numbers
    const MAX_FILE_SIZE = 5 * 1024 ** 2;

    const handleFileChange = async (file: File | null) => {
        if (!file) {
            showCustomNotification({
                id: "client-error",
                title: "Warning",
                message: "Please choose a file!",
                type: "warning",
            });
            return;
        } else if (file && file.size <= MAX_FILE_SIZE) {
            const formData = new FormData();
            formData.append("profile_pic", file);
            try {
                await changeProfilePic(formData).unwrap();
            } catch (e) {
                showCustomNotification({
                    id: "server-error",
                    title: "Error",
                    message: getApiErrorMessage(e),
                    type: "error",
                });
            }
        } else if (file) {
            showCustomNotification({
                id: "client-error",
                title: "Error",
                message: "The file is too big!",
                type: "error",
            });
        }
    };

    return (
        <FileButton accept="image/png,image/jpeg,image/webp" onChange={handleFileChange}>
            {(fileButtonProps) => (
                <Box {...fileButtonProps} ref={ref} pos="relative" style={{ flexShrink: 0, cursor: "pointer" }}>
                    <Avatar
                        size="clamp(150px, 15vw, 250px)"
                        radius="clamp(40px, 5vw, 80px)"
                        src={profilePic}
                        style={{ aspectRatio: "1 / 1" }}
                    />
                    <Overlay
                        radius="clamp(10px, 5vw, 75px)"
                        color="#000"
                        backgroundOpacity={0.65}
                        style={{
                            pointerEvents: "none",
                            opacity: hovered ? 1 : 0,
                            transition: "opacity 0.2s ease-in-out",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <IconCameraPlus opacity={0.8} size={60} color="white" />
                    </Overlay>
                </Box>
            )}
        </FileButton>
    );
}
