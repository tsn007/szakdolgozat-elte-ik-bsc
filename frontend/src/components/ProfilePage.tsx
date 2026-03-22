import { Container, Avatar, Box, Text, Button, Rating, Tabs, Overlay, FileButton } from "@mantine/core";
import { useUserData } from "../hooks/userLocation";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import type { User } from "../redux/authSlice";
import { useDisclosure, useHover } from "@mantine/hooks";
import { UploadEditItemModal } from "./UploadEditItemModal";
import { useMemo } from "react";
import { useChangeProfilePicMutation, useGetUserLocationsQuery, type UserLocationsResponse } from "../redux/userApi";
import type { CoordsType } from "./SearchLayout";
import { IconCameraPlus } from "@tabler/icons-react";

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
        title: "My Items",
        to: "/profile/my-items",
    },
    {
        title: "My reservations",
        to: "/profile/my-reservations",
    },
    {
        title: "Reviews",
        to: "/profile/reviews",
    },
];

export function ProfilePage() {
    const { user, userCoords, fetchLocation, fetchAddressFromCoords } = useUserData();
    const { data: locations } = useGetUserLocationsQuery();
    const navigate = useNavigate();
    const location = useLocation();
    const [opened, { open, close }] = useDisclosure(false);
    const contextValue = useMemo(
        () => ({ user, locations, userCoords, fetchLocation, fetchAddressFromCoords}),
        [user, locations, userCoords, fetchLocation, fetchAddressFromCoords],
    );

    const handleOpen = () => {
        open();
    };

    return (
        <>
            <Container size="lg">
                <Box w="100%" style={{ display: "flex", alignItems: "flex-end", gap: "20px" }}>
                    <ProfilePic profilePic={user?.profile_pic} />
                    <Box w="100%" mb={20} style={{ display: "flex", justifyContent: "space-between" }}>
                        <Box style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <Text size="3vw">{user?.first_name + " " + user?.last_name}</Text>
                            <Box style={{ display: "flex", gap: "10px" }}>
                                <Button radius="md" onClick={handleOpen}>
                                    Upload item
                                </Button>
                            </Box>
                        </Box>
                        <Box
                            style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "flex-start" }}
                        >
                            <Rating fractions={2} readOnly defaultValue={2.5} />
                            <Text>(2.5)</Text>
                        </Box>
                    </Box>
                </Box>
                <Box style={{ display: "flex", gap: "30px" }} mt={50}>
                    <Tabs value={location.pathname} onChange={(value) => navigate(value as string)} w="100%">
                        <Tabs.List>
                            {profileItems.map((item) => (
                                <Tabs.Tab key={item.to} onClick={() => navigate(item.to)} value={item.to}>
                                    {item.title}
                                </Tabs.Tab>
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

function ProfilePic({ profilePic }: { profilePic: string | undefined }) {
    const [changeProfilePic] = useChangeProfilePicMutation();
    const { hovered, ref } = useHover();
    // eslint-disable-next-line no-magic-numbers
    const MAX_FILE_SIZE = 5 * 1024 ** 2;

    const handleFileChange = async (file: File | null) => {
        if (!file) {
            console.log("Nem választottál fájlt!");
            return;
        } else if (file && file.size <= MAX_FILE_SIZE) {
            const formData = new FormData();
            formData.append("profile_pic", file);
            try {
                await changeProfilePic(formData).unwrap();
            } catch (e) {
                console.log(e);
            }
        } else if (file) {
            console.error("A fájl túl nagy!");
        }
    };

    return (
        <FileButton accept="image/png,image/jpeg,image/webp" onChange={handleFileChange}>
            {(fileButtonProps) => (
                <Box {...fileButtonProps} ref={ref} pos="relative" style={{ flexShrink: 0, cursor: "pointer" }}>
                    <Avatar
                        size="clamp(80px, 15vw, 250px)"
                        radius="clamp(10px, 5vw, 80px)"
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
