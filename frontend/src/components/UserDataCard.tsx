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
        <Card radius="lg" p="md">
            <Flex align="center" justify="space-between" gap="md">
                <Flex align="center" style={{ flex: 1 }}>
                    <Flex align="center" gap="md" style={{ flex: 1 }}>
                        <Avatar src={user.profile_pic} size={80} />
                        <Box>
                            <Text size="lg" fw={500}>{`${user.first_name} ${user.last_name}`}</Text>
                            <Text size="sm" c="dimmed" fs="italic">
                                {user.email}
                            </Text>
                        </Box>
                    </Flex>

                    <Flex direction="column" align="center" justify="center">
                        <Text size="md" c="dimmed" fs="italic">{`(${user.rating})`}</Text>
                        <Rating fractions={10} value={Number(user.rating)} readOnly />
                    </Flex>

                    <Flex style={{ flex: 1 }} justify="flex-end">
                        <Flex direction="column" align="center">
                            <Text>Is Active</Text>
                            {user.is_active ? (
                                <IconCircleCheckFilled color="teal" />
                            ) : (
                                <IconCircleXFilled color="red" />
                            )}
                        </Flex>
                    </Flex>
                </Flex>

                <Divider orientation="vertical" size="md" />

                <Box>
                    <Button color={user.is_active ? "red" : "green"} loading={isLoading} onClick={handleStatusChange}>
                        {user.is_active ? "Suspend" : "Restore"}
                    </Button>
                </Box>
            </Flex>
        </Card>
    );
}
