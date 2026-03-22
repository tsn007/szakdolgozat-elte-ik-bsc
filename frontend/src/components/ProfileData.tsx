/* eslint-disable no-magic-numbers */
import { Container, TextInput, Box, Text, SimpleGrid, Button } from "@mantine/core";
import { useProfileContext } from "../hooks/profileContextHook";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useState } from "react";
import type { User } from "../redux/authSlice";
import { useUpdateUserDataMutation } from "../redux/userApi";
import { AddEditNewAddress } from "./AddEditNewAddress";
import { useDisclosure } from "@mantine/hooks";
import { fetchAddressFromCoords } from "../hooks/userLocation";
import type { AddressType } from "./MapSearchBar";
import { LocationCard } from "./LocationCard";

function PersonalDetailsForm({ user }: { user: User }) {
    const [updateProfile, { isLoading }] = useUpdateUserDataMutation();

    const form = useForm({
        initialValues: {
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
        },
    });
    const [isFnameActive, setIsFnameActive] = useState(true);
    const [isLnameActive, setIsLnameActive] = useState(true);
    const [isEmailActive, setIsEmailActive] = useState(true);

    const handleSubmit = async (values: typeof form.values) => {
        try {
            const changedData: Partial<typeof form.values> = {};

            if (values.email !== user.email) changedData.email = values.email;
            if (values.first_name !== user.first_name) changedData.first_name = values.first_name;
            if (values.last_name !== user.last_name) changedData.last_name = values.last_name;

            if (Object.keys(changedData).length !== 0) {
                await updateProfile(changedData).unwrap();
                form.setInitialValues(values);
                form.resetDirty(values);
            }
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Box style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Text fw={500} size="xl">
                    Personal Details
                </Text>
                <TextInput
                    readOnly={isFnameActive}
                    radius="md"
                    label="First name"
                    rightSection={<IconEdit onClick={() => setIsFnameActive(!isFnameActive)} />}
                    {...form.getInputProps("first_name")}
                />
                <TextInput
                    readOnly={isLnameActive}
                    radius="md"
                    label="Last name"
                    rightSection={<IconEdit onClick={() => setIsLnameActive(!isLnameActive)} />}
                    {...form.getInputProps("last_name")}
                />
                <TextInput
                    readOnly={isEmailActive}
                    radius="md"
                    label="Email"
                    rightSection={<IconEdit onClick={() => setIsEmailActive(!isEmailActive)} />}
                    {...form.getInputProps("email")}
                />
                <Box
                    mt={40}
                    w="100%"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <Button radius="md" w="100%" disabled={!form.isDirty()} loading={isLoading} type="submit">
                        Save changes
                    </Button>
                    <Button
                        radius="md"
                        w="100%"
                        variant="outline"
                        color="red"
                        disabled={!form.isDirty()}
                        onClick={() => form.reset()}
                    >
                        Revert changes
                    </Button>
                </Box>
            </Box>
        </form>
    );
}

export function ProfileData() {
    const { user, locations, userCoords, fetchLocation } = useProfileContext();
    const [openedLocationModal, { open: openLocationModal, close: closelocationModal }] = useDisclosure(false);
    const [userAddress, setUserAddress] = useState<AddressType>();

    const handleOpen = async () => {
        openLocationModal();
        let currentCoords = userCoords;
        if (!currentCoords) {
            currentCoords = await fetchLocation();
        }
        if (currentCoords && !userAddress) {
            const defAddress = await fetchAddressFromCoords(currentCoords.lat, currentCoords.lng);
            setUserAddress(defAddress);
        }
    };

    return (
        <Container fluid mt={30} style={{ display: "flex" }}>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="60px" w="100%">
                <Box style={{ position: "sticky", top: "95px", alignSelf: "flex-start" }}>
                    <PersonalDetailsForm user={user} />
                </Box>
                <Box>
                    <Text fw={500} size="xl" mb={36}>
                        Manage Addresses
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                        {locations?.map((loc) => {
                            const splitted = loc.address.split(",");
                            const city = splitted[1];
                            const additional = splitted[3] && splitted[4] ? `, ${splitted[3]}, ${splitted[4]}` : "";
                            const addr = splitted[0] + ", " + splitted[2] + additional;
                            return (
                                <LocationCard
                                    key={loc.id}
                                    loc={loc}
                                    city={city}
                                    addr={addr}
                                    userAddress={userAddress}
                                />
                            );
                        })}
                        <Button
                            mih={130}
                            h="100%"
                            variant="default"
                            style={{ borderStyle: "dashed", borderWidth: "2px" }}
                            leftSection={<IconPlus size={20} />}
                            radius="md"
                            onClick={handleOpen}
                        >
                            Add new address
                        </Button>
                    </SimpleGrid>
                </Box>
            </SimpleGrid>
            <AddEditNewAddress
                opened={openedLocationModal}
                close={closelocationModal}
                userCoords={userCoords}
                userAddress={userAddress}
            />
        </Container>
    );
}
