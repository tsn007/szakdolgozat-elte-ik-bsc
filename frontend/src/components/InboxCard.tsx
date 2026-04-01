import { Avatar, Badge, Box, Button, Card, Paper, Text, Image, AspectRatio, Flex, Divider } from "@mantine/core";
import { useChangeStatusMutation, type Inbox } from "../redux/reservationsApi";
import { decideBadgeColor, formatStatusLabel, type ReservationStatus } from "../utils/rentalStatus";
import { IconCalendarFilled, IconCheck, IconMapPinFilled, IconX } from "@tabler/icons-react";
import { InboxTab } from "../consts/inboxTabs";
import { RESERVATION_STATUS } from "../utils/rentalStatus";
import { AddReviewModal } from "./AddReviewModal";
import { useDisclosure } from "@mantine/hooks";

export function InboxCard({ rental, tab }: { rental: Inbox; tab: string | undefined }) {
    const [opened, { open, close }] = useDisclosure(false);
    const [changeStatus] = useChangeStatusMutation();
    const resFrom = new Date(rental.from_date);
    const resTo = new Date(rental.to_date);
    const nextStatus =
        rental.status === RESERVATION_STATUS.PENDING ? RESERVATION_STATUS.ACCEPTED : RESERVATION_STATUS.COMPLETED;

    const handleChange = async (new_status: ReservationStatus) => {
        const statusObj = {
            id: rental.id,
            status: new_status,
        };

        try {
            await changeStatus(statusObj).unwrap();
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <Card radius="lg" p="lg" bg="dark.7" withBorder my={20}>
            <Flex direction={{ base: "column", sm: "row" }} gap="xl" align={{ base: "stretch", sm: "center" }}>
                <Box w={{ base: "100%", sm: 150 }}>
                    <AspectRatio ratio={1 / 1} w="100%">
                        <Image radius="lg" src={rental.item.cover} fit="cover" />
                    </AspectRatio>
                </Box>

                <Box style={{ flex: 1 }}>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} mb="xs">
                        <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Avatar src={rental.renter.profile_pic} size="md" />
                            <Text fw={600}>{rental.renter.first_name + " " + rental.renter.last_name}</Text>
                        </Box>
                        <Badge color={decideBadgeColor(rental.status)}>
                            {formatStatusLabel(rental.status || RESERVATION_STATUS.PENDING)}
                        </Badge>
                    </Box>

                    <Text size="sm" c="dimmed" mb="md">
                        <Text span fw={600} c="white">
                            {rental.item.name}
                        </Text>
                    </Text>

                    <Paper radius="lg" p={20} bg="black" withBorder>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Box style={{ display: "flex", gap: "10px" }}>
                                    <IconCalendarFilled size={20} />
                                    <Text size="sm">
                                        {resFrom.toLocaleDateString()} - {resTo.toLocaleDateString()}
                                    </Text>
                                </Box>
                                <Box style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                                    <IconMapPinFilled color="red" size={20} />
                                    <Text size="sm">Pick up: {rental.item.location.address}</Text>
                                </Box>
                            </Box>
                            <Box style={{ textAlign: "right" }}>
                                <Text fw={500} size="sm">
                                    Total:
                                </Text>
                                <Text size="xl" fw={700}>
                                    {rental.total_price} €
                                </Text>
                            </Box>
                        </Flex>
                    </Paper>
                </Box>
            </Flex>

            {tab === InboxTab.REQUESTS && (
                <>
                    <Divider my="lg" />
                    <Box style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        {rental.status === RESERVATION_STATUS.PENDING && (
                            <Button
                                radius="md"
                                leftSection={<IconX size={18} />}
                                variant="outline"
                                color="red"
                                onClick={() => handleChange(RESERVATION_STATUS.REJECTED)}
                            >
                                Reject
                            </Button>
                        )}
                        <Button
                            radius="md"
                            leftSection={<IconCheck size={18} />}
                            color="teal"
                            onClick={() => handleChange(nextStatus)}
                        >
                            {rental.status === RESERVATION_STATUS.PENDING ? "Accept" : "Returned"}
                        </Button>
                    </Box>
                </>
            )}

            {rental.status === RESERVATION_STATUS.COMPLETED && (
                <>
                    <Divider my="lg" />
                    <Box w="100%" style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="light" radius="md" w={150} onClick={open}>
                            Leave a review
                        </Button>
                    </Box>
                    <AddReviewModal opened={opened} close={close} rentalId={rental.id} />
                </>
            )}
        </Card>
    );
}
