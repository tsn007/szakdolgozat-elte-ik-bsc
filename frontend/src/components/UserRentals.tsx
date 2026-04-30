import { Accordion, Badge, Box, Center, Container, Divider, Flex, Group, Loader, Pill, Text } from "@mantine/core";
import { useGetUserRentalsQuery } from "../redux/reservationsApi";
import { RentalItemDetails } from "./RentalItemDetails";
import { decideBadgeColor, formatStatusLabel, RESERVATION_STATUS } from "../utils/rentalStatus";
import { useParams } from "react-router-dom";
import { IconCalendar } from "@tabler/icons-react";
import { StatusMobileIcon } from "./StatusMobileIcon";

export function UserRentals() {
    const { resStatus } = useParams();
    const { data: rentals, isLoading } = useGetUserRentalsQuery(resStatus ?? "");

    if (isLoading) {
        return (
            <Center mt="xl">
                <Loader />
            </Center>
        );
    }

    if (!rentals || rentals.length === 0) {
        return (
            <Text ta="center" mt="lg">
                You have no rentals yet!
            </Text>
        );
    }

    return (
        <>
            <Container mt={20}>
                <Accordion radius="lg" chevronIconSize={23} variant="separated" multiple={true}>
                    {rentals?.map((rental) => {
                        const res_from = new Date(rental.from_date);
                        const res_to = new Date(rental.to_date);
                        return (
                            <Accordion.Item key={rental.id} value={rental.id}>
                                <Accordion.Control>
                                    <Box w="100%">
                                        <Flex visibleFrom="md" align="center" justify="space-between" w="100%">
                                            <Text fw={500} size="xl" truncate w="30%">
                                                {rental.item.name}
                                            </Text>

                                            <Flex align="center" justify="center" gap="10px" w="40%">
                                                <Pill
                                                    size="xl"
                                                    style={{
                                                        backgroundColor:
                                                            "light-dark(var(--mantine-color-beige-2), var(--mantine-color-midnight-6))",
                                                    }}
                                                >
                                                    {res_from.toLocaleDateString()}
                                                </Pill>
                                                <Divider orientation="horizontal" w="7rem" size="md" variant="dashed" />
                                                <Pill
                                                    size="xl"
                                                    style={{
                                                        backgroundColor:
                                                            "light-dark(var(--mantine-color-beige-2), var(--mantine-color-midnight-6))",
                                                    }}
                                                >
                                                    {res_to.toLocaleDateString()}
                                                </Pill>
                                            </Flex>

                                            <Flex align="center" justify="flex-end" w="25%" gap="sm">
                                                <Badge color={decideBadgeColor(rental.status)}>
                                                    {formatStatusLabel(rental.status || RESERVATION_STATUS.PENDING)}
                                                </Badge>
                                                <Divider
                                                    orientation="vertical"
                                                    mr={10}
                                                    size="md"
                                                    style={{ marginTop: "-5px", marginBottom: "-5px", height: "auto" }}
                                                />
                                            </Flex>
                                        </Flex>
                                        <Flex hiddenFrom="md" direction="row" justify="flex-start" align="center">
                                            <Flex direction="column" gap="8px" style={{ flex: 1, minWidth: 0 }} pr="sm">
                                                <Text fw={600} size="lg" truncate style={{ maxWidth: "85%" }}>
                                                    {rental.item.name}
                                                </Text>

                                                <Group gap="xs" wrap="nowrap">
                                                    <IconCalendar size={16} color="gray" />
                                                    <Text size="sm" c="dimmed" fw={500}>
                                                        {res_from.toLocaleDateString()} → {res_to.toLocaleDateString()}
                                                    </Text>
                                                </Group>
                                            </Flex>
                                            <Box mr={10} style={{ display: "flex", flexShrink: 0 }}>
                                                <StatusMobileIcon status={rental.status || "PENDING"} />
                                            </Box>
                                        </Flex>
                                    </Box>
                                </Accordion.Control>

                                <Accordion.Panel>
                                    <RentalItemDetails rental={rental} />
                                </Accordion.Panel>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
            </Container>
        </>
    );
}
