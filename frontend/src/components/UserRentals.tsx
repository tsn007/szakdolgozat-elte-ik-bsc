import { Accordion, Badge, Box, Center, Container, Divider, Group, Loader, Pill, Text } from "@mantine/core";
import { useGetUserRentalsQuery } from "../redux/reservationsApi";
import { RentalItemDetails } from "./RentalItemDetails";
import { decideBadgeColor, formatStatusLabel, RESERVATION_STATUS } from "../utils/rentalStatus";
import { useParams } from "react-router-dom";

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
            <Text ta="center" mt="xl">
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
                                    <Box
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            width: "100%",
                                        }}
                                    >
                                        <Text
                                            fw={500}
                                            size="xl"
                                            truncate
                                            style={{
                                                flex: 0.5,
                                                minWidth: 0,
                                            }}
                                        >
                                            {rental.item.name}
                                        </Text>
                                        <Box
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                width: "400px",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Pill
                                                style={{ backgroundColor: "var(--mantine-color-midnight-6)" }}
                                                size="xl"
                                            >
                                                {res_from.toLocaleDateString()}
                                            </Pill>
                                            <Divider orientation="horizontal" w="7rem" size="md" variant="dashed" />
                                            <Pill
                                                style={{ backgroundColor: "var(--mantine-color-midnight-6)" }}
                                                size="xl"
                                            >
                                                {res_to.toLocaleDateString()}
                                            </Pill>
                                        </Box>
                                        <Group
                                            style={{
                                                width: "160px",
                                                justifyContent: "flex-end",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Badge color={decideBadgeColor(rental.status)}>
                                                {formatStatusLabel(rental.status || RESERVATION_STATUS.PENDING)}
                                            </Badge>
                                            <Divider
                                                orientation="vertical"
                                                mr={10}
                                                size="md"
                                                style={{
                                                    marginTop: "-5px",
                                                    marginBottom: "-5px",
                                                    alignSelf: "stretch",
                                                    height: "auto",
                                                }}
                                            />
                                        </Group>
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
