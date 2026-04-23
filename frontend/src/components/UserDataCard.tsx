import { Avatar, Box, Button, Card, Divider, Flex, Rating, Text } from "@mantine/core";
import { useChangeActiveStatusMutation } from "../redux/userApi";
import type { components } from "../types/schema";
import { IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";

type StaffUser = components["schemas"]["StaffUsers"];

export function UserDataCard({ user }: { user: StaffUser }) {
    const [changeActiveStatus, { isLoading }] = useChangeActiveStatusMutation();

    const handleStatusChange = () => {
        if (user.is_active !== undefined) {
            changeActiveStatus({ userId: user.id, isActive: user.is_active });
        }
    };

    return (
        <Card radius="lg" p="md" shadow="sm" withBorder>
            <Flex
                direction={{ base: "column", sm: "row" }}
                align={{ base: "stretch", sm: "center" }}
                justify="space-between"
                gap="md"
            >
                <Flex
                    direction={{ base: "column", sm: "row" }}
                    align={{ base: "center", sm: "center" }}
                    gap="xl"
                    style={{ flex: 1 }}
                >
                    <Flex
                        align="center"
                        gap="md"
                        style={{ flex: 1 }}
                        justify={{ base: "center", sm: "flex-start" }}
                        direction={{ base: "column", xs: "row" }}
                        ta={{ base: "center", xs: "left" }}
                    >
                        <Avatar src={user.profile_pic} size={80} />
                        <Box>
                            <Text size="lg" fw={500}>{`${user.first_name} ${user.last_name}`}</Text>
                            <Text size="sm" c="dimmed" fs="italic">
                                {user.email}
                            </Text>
                        </Box>
                    </Flex>

                    <Flex gap="xl" justify="center" align="center">
                        <Flex direction="column" align="center" justify="center">
                            <Text size="md" c="dimmed" fs="italic">{`(${user.rating})`}</Text>
                            <Rating fractions={10} value={Number(user.rating)} readOnly />
                        </Flex>

                        <Flex direction="column" align="center">
                            <Text>Is Active</Text>
                            {user.is_active ? (
                                <IconCircleCheckFilled color="teal" size={24} />
                            ) : (
                                <IconCircleXFilled color="red" size={24} />
                            )}
                        </Flex>
                    </Flex>
                </Flex>

                <Box display={{ base: "none", sm: "block" }}>
                    <Divider orientation="vertical" size="md" />
                </Box>
                <Box display={{ base: "block", sm: "none" }}>
                    <Divider size="sm" my="sm" />
                </Box>

                <Box w={{ base: "100%", sm: "auto" }}>
                    <Button
                        fullWidth
                        color={user.is_active ? "red" : "green"}
                        loading={isLoading}
                        onClick={handleStatusChange}
                        radius="md"
                    >
                        {user.is_active ? "Suspend" : "Restore"}
                    </Button>
                </Box>
            </Flex>
        </Card>
    );
}
