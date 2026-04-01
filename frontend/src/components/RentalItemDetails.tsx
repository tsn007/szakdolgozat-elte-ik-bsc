import {
    Box,
    Container,
    Divider,
    Paper,
    SimpleGrid,
    Stepper,
    Text,
    Image,
    Avatar,
    AspectRatio,
    Button,
} from "@mantine/core";
import { useChangeStatusMutation, type Rental } from "../redux/reservationsApi";
import { STEPPERS } from "../consts/stepperStates";
import { IconCheck, IconMapPinFilled, IconMessageCircle } from "@tabler/icons-react";
import { RESERVATION_STATUS, type ReservationStatus } from "../utils/rentalStatus";
import { useDisclosure } from "@mantine/hooks";
import { AddReviewModal } from "./AddReviewModal";

export function RentalItemDetails({ rental }: { rental: Rental }) {
    const [opened, { open, close }] = useDisclosure(false);
    const [changeStatus] = useChangeStatusMutation();
    const flow = STEPPERS[rental.status || "PENDING"];
    const res_from = new Date(rental.from_date);
    const res_to = new Date(rental.to_date);
    const differenceInMs = res_to.getTime() - res_from.getTime();
    // eslint-disable-next-line no-magic-numbers
    const msInADay = 1000 * 60 * 60 * 24;
    const differenceInDays = differenceInMs / msInADay;
    const nextStatus =
        rental.status === RESERVATION_STATUS.ACCEPTED
            ? RESERVATION_STATUS.IN_PROGRESS
            : RESERVATION_STATUS.RETURN_PENDING;

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
        <Container fluid>
            <Paper w="100%" p={20} radius="lg">
                <Stepper active={flow.active} color="teal" size="sm">
                    {flow.steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === flow.active;
                        return (
                            <Stepper.Step
                                key={index}
                                label={step.label}
                                description={step.description}
                                icon={
                                    Icon ? (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: "100%",
                                                height: "100%",
                                            }}
                                        >
                                            <Icon size={20} color={flow.stepColor} />
                                        </div>
                                    ) : undefined
                                }
                                color={isActive ? flow.stepColor : undefined}
                            />
                        );
                    })}
                    <Stepper.Completed>The rental has been successfully completed!</Stepper.Completed>
                </Stepper>
            </Paper>
            <Paper radius="lg" mt={20} p={20}>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Box style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <AspectRatio ratio={1 / 1} w={150}>
                            <Image src={rental.item.cover} radius="lg" />
                        </AspectRatio>
                        <Box>
                            <Box style={{ display: "flex", alignItems: "center", gap: "10px" }} mb={10}>
                                <Avatar src={rental.item.owner.profile_pic} size={50} />
                                <Text size="xl">
                                    {rental.item.owner.first_name + " " + rental.item.owner.last_name}
                                </Text>
                            </Box>
                            <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <IconMapPinFilled size={30} color="red" />
                                <Text>{rental.item.location.address}</Text>
                            </Box>
                        </Box>
                    </Box>
                    <Box style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                        {(rental.status === RESERVATION_STATUS.ACCEPTED ||
                            rental.status === RESERVATION_STATUS.IN_PROGRESS) && (
                            <Box style={{ display: "flex", gap: "10px" }}>
                                <Button radius="md" color="blue" leftSection={<IconMessageCircle size={16} />}>
                                    Message Owner
                                </Button>
                                <Button
                                    radius="md"
                                    color="teal"
                                    leftSection={<IconCheck size={16} />}
                                    onClick={() => handleChange(nextStatus)}
                                >
                                    {rental.status === RESERVATION_STATUS.ACCEPTED
                                        ? "Got the item"
                                        : "Returned the item"}
                                </Button>
                            </Box>
                        )}
                        {rental.status === RESERVATION_STATUS.COMPLETED && (
                            <>
                                <Button variant="light" radius="md" onClick={open}>
                                    Leave a review
                                </Button>
                                <AddReviewModal opened={opened} close={close} rentalId={rental.id} />
                            </>
                        )}
                    </Box>
                </SimpleGrid>
                <Divider my={10} />
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Text size="xl">
                        Total price (for {differenceInDays > 0 ? Math.ceil(differenceInDays) : 1} days):
                    </Text>
                    <Box style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
                        <Text ta="right" size="30px">
                            {rental.total_price} €
                        </Text>
                    </Box>
                </SimpleGrid>
            </Paper>
        </Container>
    );
}
